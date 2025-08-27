# Data Model & API (v0.2 — Gamification Additions)

> This addendum extends the **ent‑first** model. `entgql` remains the schema source; we only add custom operations in `api/custom.graphqls` where needed. Target **V2.1**.

---

## 1) `UserShadow` deltas
Add XP/level/streak fields and privacy toggle.

```go
// schema/usershadow.go (add fields)
field.Int("xp").Default(0),
field.Int("level").Default(1),
field.Int("streak_count").Default(0),
field.Time("last_activity_at").Optional().Nillable(),
field.Bool("public_opt_in").Default(true),
```

> Note: keep existing `xid`, `keycloak_sub`, `handle`, `display_name` as before.

---

## 2) New Entities

### 2.1 GamificationEvent
```go
// schema/gamificationevent.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/deicod/archivedgames/xidmixin"
)

type GamificationEvent struct{ ent.Schema }

func (GamificationEvent) Annotations() []ent.Annotation { return []ent.Annotation{ /* admin queries only later */ } }

func (GamificationEvent) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("user_id"),               // keycloak sub / usershadow foreign key (string)
    field.Enum("type").Values(
      "IMAGE_APPROVED", "DESCRIPTION_ACCEPTED", "TRANSLATION_ACCEPTED",
      "VIDEO_LINK_ADDED", "COLLECTION_CREATED", "COLLECTION_ITEM_ADDED",
      "REPORT_QUARANTINED", "FILENAME_OVERRIDE_ACCEPTED", "DAILY_STREAK_CLAIMED",
    ),
    field.String("subject_type"),          // e.g., game|file|image|description
    field.String("subject_xid").Optional(),
    field.Int("points"),
    field.Enum("status").Values("PENDING", "GRANTED", "REVERTED").Default("GRANTED").Annotations(entgql.OrderField("status")),
    // timestamps from TimeMixin if present project‑wide; otherwise:
    // field.Time("created_at").Default(time.Now),
  }
}
```

### 2.2 Badge
```go
// schema/badge.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/deicod/archivedgames/xidmixin"
)

type Badge struct{ ent.Schema }

func (Badge) Annotations() []ent.Annotation { return []ent.Annotation{ entgql.QueryField() } }

func (Badge) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("slug").Unique(),
    field.String("name"),
    field.String("description").Optional(),
    field.String("icon").Optional(),
    field.String("tier").Optional(),
  }
}
```

### 2.3 UserBadge
```go
// schema/userbadge.go
package schema

import (
  "entgo.io/ent"
  "entgo.io/ent/schema/field"
  "entgo.io/contrib/entgql"
  "github.com/deicod/archivedgames/xidmixin"
)

type UserBadge struct{ ent.Schema }

func (UserBadge) Annotations() []ent.Annotation { return []ent.Annotation{ entgql.QueryField() } }

func (UserBadge) Fields() []ent.Field {
  return []ent.Field{
    xidmixin.XIDMixin{}.Fields()...,
    field.String("user_id"),
    field.String("badge_xid"),
    field.Time("awarded_at"),
    field.Enum("source").Values("AUTO", "ADMIN").Default("AUTO"),
  }
}
```

---

## 3) Indexes & Constraints
- `userbadge`: **unique** on `(user_id, badge_xid)`.
- `gamificationevent`: index on `(user_id, created_at)`; consider partial index for `status='PENDING'`.
- `usershadow`: index on `xp`, `level` (for leaderboard queries if computed on the fly).

---

## 4) Generated GraphQL (entgql)
- `Badge` and `UserBadge` are exposed via `entgql.QueryField()` (Relay connections available if edges are added later).
- `GamificationEvent` is not publicly exposed in v2.1 (admin tooling may add queries later).

---

## 5) Minimal custom SDL additions (to `api/custom.graphqls`)
```graphql
extend type Query {
  meGamification: MeGamification!
  leaderboard(period: LeaderboardPeriod!, first: Int, after: String): LeaderboardConnection!
  badges: [Badge!]!
}

enum LeaderboardPeriod { DAILY WEEKLY ALLTIME }

type MeGamification { xp: Int!, level: Int!, streakCount: Int!, badges: [Badge!]! }

type LeaderboardEntry { user: User!, xp: Int!, rank: Int! }

type LeaderboardEdge { node: LeaderboardEntry!, cursor: String! }

type LeaderboardConnection { edges: [LeaderboardEdge!]!, pageInfo: PageInfo!, totalCount: Int! }

extend type Mutation {
  claimDailyStreak: MeGamification!
}
```

---

## 6) Service Notes
- **Awarding** happens after approvals (images/descriptions/overrides) or moderation actions; emit `GamificationEvent` → apply caps/cooldowns → update `usershadow` aggregates.
- **Reverts**: create a new `REVERTED` event that subtracts points.
- **Leaderboards**: can be materialized via scheduled SQL (optional) or computed with window functions.

---

## 7) Migration Plan
- Add new tables and fields in one migration batch.
- Backfill existing users with `xp=0, level=1, public_opt_in=true`.
- Seed starter badges (Crate Digger, Box‑Art Curator, Pixel Historian, Localization Hero, platform badges, Moderator’s Helper, Collector, Early Supporter).
