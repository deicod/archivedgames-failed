package schema

import (
  "time"
  "entgo.io/contrib/entgql"
  "entgo.io/ent"
  "entgo.io/ent/schema"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "github.com/rs/xid"
)

// Comment holds the schema definition for the Comment entity.
type Comment struct{ ent.Schema }

func (Comment) Annotations() []schema.Annotation {
  return []schema.Annotation{
    entgql.QueryField(),
    entgql.RelayConnection(),
  }
}

func (Comment) Fields() []ent.Field {
  return []ent.Field{
    field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
    field.String("subject_type"), // "game" | "file"
    field.String("subject_id"),
    field.String("user_id"),
    field.String("language").Optional(),
    field.String("content"),
    field.Time("created_at").Default(time.Now).Immutable(),
    field.Time("edited_at").Optional().Nillable(),
    field.Time("deleted_at").Optional().Nillable(),
  }
}

func (Comment) Edges() []ent.Edge {
  return []ent.Edge{
    edge.From("game", Game.Type).Ref("comments").Unique(),
    edge.From("file", File.Type).Ref("comments").Unique(),
  }
}
