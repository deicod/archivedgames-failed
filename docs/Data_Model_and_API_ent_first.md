# ArchivedGames — Data Model & API (ent‑first, Relay via entgql)

> **Change note**: Simplified to an **ent‑first** design. We rely on **entgql** to generate the **Relay Node/Connection** types and listing fields. Hand‑written SDL is kept **minimal** (custom queries/mutations only). This keeps schema drift low and codegen happy for a coding agent.

- IDs: `rs/xid`
- ORM: `ent` + `entgql` (Relay + filters + ordering)
- API: `gqlgen`
- DB: PostgreSQL
- Storage: S3 (files & images)
- Auth: Keycloak (OIDC) at `auth.icod.de`

---

## 1) Conventions & Codegen
- **Source of truth**: `ent/` schemas, each with:
  - `Annotations(entgql.QueryField())` on types we want root list fields for (e.g., `games`, `files`, …).
  - `edge.To(...).Annotations(entgql.RelayConnection())` for Relay connections.
  - `field.Enum(...).Annotations(entgql.OrderField("field"))` for sortability where useful.
- **Generated GraphQL** (via `entgql`):
  - `Node` interface, `node`/`nodes` resolvers
  - `*Connection`/`*Edge` types for annotated edges
  - `WhereInput`, `Order` inputs
- **Hand‑written GraphQL**: only custom operations not directly mapped to a single entity CRUD (e.g., `upsertDescription`, `reactToFile`, `opensearchSuggestions`, file upload flows, moderation actions).

> Tip for the agent: keep `/api/custom.graphqls` tiny; import the generated `ent.graphql` (or compose via gqlgen config) and add only custom bits.

---

## 2) Shared Mixins
Create small mixins to reduce boilerplate across entities.

```go
// xidmixin/mixin.go
package xidmixin

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/field"
  "time"
)

type XIDMixin struct{}
func (XIDMixin) Fields() []ent.Field { return []ent.Field{ field.String("xid").Immutable().Unique() } }

type TimeMixin struct{}
func (TimeMixin) Fields() []ent.Field {
  return []ent.Field{
    field.Time("created_at").Default(time.Now).Immutable(),
    field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
  }
}
```

---

## 3) Core Entities (ent schemas)
> Only key parts shown; the agent can fill boilerplate. All edges used for lists get `entgql.RelayConnection()`.

### 3.1 Game
```go
// schema/game.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/your/module/xidmixin"
)

type Game struct{ ent.Schema }

func (Game) Annotations() []schema.Annotation { return []schema.Annotation{ entgql.QueryField() } }

func (Game) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("slug").Unique(),
    field.Enum("platform").Values("C64","AMIGA","DOS"),
    field.String("title"),
    field.Int("year").Optional().Nillable(),
    field.String("publisher").Optional(),
    field.String("developer").Optional(),
    field.Strings("genres").Optional(),
    field.Enum("distribution_status").Values("ALLOWED","UNKNOWN","FORBIDDEN").Default("ALLOWED").Annotations(entgql.OrderField("distribution_status")),
  }
}

func (Game) Edges() []ent.Edge {
  return []ent.Edge{
    edge.To("files", File.Type).Annotations(entgql.RelayConnection()),
    edge.To("images", Image.Type).Annotations(entgql.RelayConnection()),
    edge.To("descriptions", DescriptionVersion.Type).Annotations(entgql.RelayConnection()),
    edge.To("videos", VideoLink.Type).Annotations(entgql.RelayConnection()),
    edge.To("comments", Comment.Type).Annotations(entgql.RelayConnection()),
    edge.To("ratings", Rating.Type),
    edge.To("favorites", Favorite.Type),
    edge.To("tags", Tag.Type).Annotations(entgql.RelayConnection()).Optional(), // optional v1.1
  }
}
```

### 3.2 File
```go
// schema/file.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/your/module/xidmixin"
)

type File struct{ ent.Schema }

func (File) Annotations() []schema.Annotation { return []schema.Annotation{ entgql.QueryField() } }

func (File) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("path"),
    field.String("original_name"),
    field.String("normalized_name"),
    field.String("checksum").Annotations(entgql.OrderField("checksum")),
    field.Int64("size_bytes").Annotations(entgql.OrderField("size_bytes")),
    field.String("mime_type").Optional(),
    field.String("format").Optional(),
    field.String("source"), // local|s3
    field.Bool("quarantine").Default(false),
    field.Enum("distribution_status").Values("ALLOWED","UNKNOWN","FORBIDDEN").Optional(),
  }
}

func (File) Edges() []ent.Edge {
  return []ent.Edge{
    edge.From("game", Game.Type).Ref("files").Unique().Required(),
    edge.To("comments", Comment.Type).Annotations(entgql.RelayConnection()),
    edge.To("reactions", Reaction.Type),
  }
}
```

### 3.3 DescriptionVersion
```go
// schema/descriptionversion.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "github.com/your/module/xidmixin"
)

type DescriptionVersion struct{ ent.Schema }

func (DescriptionVersion) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("language"), // BCP-47
    field.Enum("markup").Values("MARKDOWN").Default("MARKDOWN"),
    field.String("content_raw"),
    field.String("content_sanitized"),
    field.Int("version"),
    field.String("author_id"), // from Keycloak sub/uuid
  }
}

func (DescriptionVersion) Edges() []ent.Edge {
  return []ent.Edge{
    edge.From("game", Game.Type).Ref("descriptions").Unique().Required(),
  }
}
```

### 3.4 Image
```go
// schema/image.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "github.com/your/module/xidmixin"
)

type Image struct{ ent.Schema }

func (Image) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.Enum("kind").Values("COVER","GALLERY"),
    field.Int("position").Default(0),
    field.String("s3_key"),
    field.Int("width"), field.Int("height"),
  }
}

func (Image) Edges() []ent.Edge {
  return []ent.Edge{ edge.From("game", Game.Type).Ref("images").Unique().Required() }
}
```

### 3.5 VideoLink
```go
// schema/videolink.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "github.com/your/module/xidmixin"
)

type VideoLink struct{ ent.Schema }

func (VideoLink) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("provider"), // youtube|vimeo|peertube
    field.String("url"),
    field.String("title").Optional(),
    field.String("channel").Optional(),
  }
}
func (VideoLink) Edges() []ent.Edge {
  return []ent.Edge{ edge.From("game", Game.Type).Ref("videos").Unique().Required() }
}
```

### 3.6 Comment
```go
// schema/comment.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "github.com/your/module/xidmixin"
)

type Comment struct{ ent.Schema }

func (Comment) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("subject_type"), // game|file
    field.String("subject_xid"),
    field.String("user_id"),
    field.String("language").Optional(),
    field.String("content_sanitized"),
    field.Time("edited_at").Optional().Nillable(),
    field.Time("deleted_at").Optional().Nillable(),
  }
}

func (Comment) Edges() []ent.Edge { return nil }
```

### 3.7 Rating (game like) & Reaction (file like/dislike)
```go
// schema/rating.go
package schema

import ( "entgo.io/ent"; "entgo.io/ent/schema/field" )

type Rating struct{ ent.Schema }
func (Rating) Fields() []ent.Field {
  return []ent.Field{
    field.String("user_id"),
    field.String("game_xid"),
    field.Int("value").Default(1), // +1 only
  }
}

// schema/reaction.go
package schema

import ( "entgo.io/ent"; "entgo.io/ent/schema/field" )

type Reaction struct{ ent.Schema }
func (Reaction) Fields() []ent.Field {
  return []ent.Field{
    field.String("user_id"),
    field.String("file_xid"),
    field.Int("value"), // -1|+1
  }
}
```

### 3.8 Favorite, Collection, CollectionItem
```go
// schema/favorite.go
package schema

import ( "entgo.io/ent"; "entgo.io/ent/schema/field" )

type Favorite struct{ ent.Schema }
func (Favorite) Fields() []ent.Field {
  return []ent.Field{ field.String("user_id"), field.String("game_xid") }
}

// schema/collection.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/your/module/xidmixin"
)

type Collection struct{ ent.Schema }

func (Collection) Annotations() []schema.Annotation { return []schema.Annotation{ entgql.QueryField() } }

func (Collection) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("user_id"),
    field.String("name"),
    field.String("slug").Unique(),
    field.Bool("public").Default(true),
    field.String("description").Optional(),
  }
}
func (Collection) Edges() []ent.Edge {
  return []ent.Edge{ edge.To("items", CollectionItem.Type).Annotations(entgql.RelayConnection()) }
}

// schema/collectionitem.go
package schema

import (
  "entgo.io/ent"; "entgo.io/ent/schema/edge"; "entgo.io/ent/schema/field"
)

type CollectionItem struct{ ent.Schema }
func (CollectionItem) Fields() []ent.Field {
  return []ent.Field{ field.String("collection_xid"), field.String("game_xid"), field.String("note").Optional(), field.Int("position").Default(0) }
}
func (CollectionItem) Edges() []ent.Edge { return []ent.Edge{} }
```

### 3.9 Moderation
```go
// schema/report.go
package schema

import ( "entgo.io/ent"; "entgo.io/ent/schema/field" )

type Report struct{ ent.Schema }
func (Report) Fields() []ent.Field {
  return []ent.Field{
    field.String("subject_type"), field.String("subject_xid"),
    field.String("reporter_id").Optional(),
    field.String("reason"), field.String("note").Optional(),
    field.Enum("status").Values("OPEN","TRIAGED","ACTIONED","REJECTED").Default("OPEN"),
  }
}

// schema/modaction.go
package schema

import ( "entgo.io/ent"; "entgo.io/ent/schema/field" )

type ModerationAction struct{ ent.Schema }
func (ModerationAction) Fields() []ent.Field {
  return []ent.Field{ field.String("subject_type"), field.String("subject_xid"), field.String("actor_id"), field.String("action"), field.String("rationale").Optional() }
}
```

> **Indexes/uniques** (agent to add):
> - `favorites`: unique `(user_id, game_xid)`
> - `rating`: unique `(user_id, game_xid)`
> - `reaction`: unique `(user_id, file_xid)`
> - `collectionitem`: unique `(collection_xid, game_xid)` and index on `(collection_xid, position)`

---

## 4) Generated GraphQL (by entgql)
With the annotations above, entgql generates:
- `Node`/`node`/`nodes`
- `GameConnection`, `FileConnection`, `ImageConnection`, `DescriptionVersionConnection`, `CommentConnection`, `CollectionConnection`, `CollectionItemConnection`, …
- `WhereInput` for filterable types (add `entgql.Filter()` to fields/types as needed)
- `Order` inputs for fields annotated via `entgql.OrderField(...)`

You **do not** need to hand‑craft connection/edge types or list fields in SDL.

---

## 5) Minimal Hand‑Written SDL (custom ops only)
Put this into `/api/custom.graphqls` (example; adjust names as implemented). The types it references (Game, File, Image, etc.) are from the **generated** ent SDL.

```graphql
scalar Upload

extend type Query {
  search(query: String!, platform: Platform, kind: String): GameConnection!
  opensearchSuggestions(q: String!, platform: Platform): [String!]!
  moderationQueue(status: String, first: Int, after: String): ReportConnection!
}

extend type Mutation {
  upsertDescription(gameXid: String!, language: String!, content: String!, changeNote: String): DescriptionVersion!
  addComment(subjectType: String!, subjectXid: String!, content: String!, language: String): Comment!
  editComment(xid: String!, content: String!): Comment!
  deleteComment(xid: String!): Boolean!

  rateGame(gameXid: String!, like: Boolean!): Game!
  reactToFile(fileXid: String!, value: Int!): File! # -1 or +1

  favoriteGame(gameXid: String!): Game!
  unfavoriteGame(gameXid: String!): Game!

  createCollection(name: String!, public: Boolean!, description: String): Collection!
  updateCollection(xid: String!, name: String, public: Boolean, description: String): Collection!
  deleteCollection(xid: String!): Boolean!
  addToCollection(collectionXid: String!, gameXid: String!, note: String, position: Int): CollectionItem!
  removeFromCollection(itemXid: String!): Boolean!

  uploadGameImages(gameXid: String!, kind: ImageKind!, files: [Upload!]!): [Image!]!
  addVideoLink(gameXid: String!, url: String!): VideoLink!

  reportContent(subjectType: String!, subjectXid: String!, reason: String!, note: String): Report!
  quarantineFile(fileXid: String!, reason: String!): File!
}
```

---

## 6) gqlgen Configuration (sketch)
```yaml
# gqlgen.yml (sketch)
schema:
  - ent.graphql        # generated by entgql
  - api/custom.graphqls # our small extensions only
exec:
  filename: graph/generated.go
model:
  filename: graph/model/models_gen.go
resolver:
  layout: follow-schema
  dir: graph
autobind:
  - your/module/ent
```

---

## 7) Sanitization & Uploads (hooks)
- **Descriptions/Comments**: store raw + sanitized; sanitize server‑side with bluemonday policy before persisting `content_sanitized`.
- **Image upload**: presigned S3 PUT → finalize → create `Image` rows; generate derivatives async.
- **Game file upload**: staging prefix + checksum/format sniff → **moderator approval** → publish path.

---

## 8) Pagination/Ordering Defaults
- Relay pagination only (`first/after`).
- Common orders:
  - Games: `title ASC`, `created_at DESC`, `distribution_status`
  - Files: `created_at DESC`, `size_bytes DESC`, `normalized_name ASC`

---

## 9) Next Steps for the Agent
1. Scaffold all ent schemas above with mixins, indexes, and annotations.
2. Enable `entgql` codegen and emit `ent.graphql`.
3. Add **only** the minimal custom SDL file (`api/custom.graphqls`).
4. Wire gqlgen resolvers for custom mutations/queries.
5. Add auth middleware (Keycloak), per‑resolver guards for mutations.
6. Write migration & seed tasks; add ingestion fixtures.
