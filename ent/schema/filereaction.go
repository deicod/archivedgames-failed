package schema

import (
  "entgo.io/contrib/entgql"
  "entgo.io/ent"
  "entgo.io/ent/schema"
  "entgo.io/ent/schema/edge"
  "entgo.io/ent/schema/field"
  "entgo.io/ent/schema/index"
  "github.com/rs/xid"
)

// FileReaction stores like/dislike reactions on files.
type FileReaction struct{ ent.Schema }

func (FileReaction) Annotations() []schema.Annotation {
  return []schema.Annotation{
    entgql.QueryField(),
    entgql.RelayConnection(),
  }
}

func (FileReaction) Fields() []ent.Field {
  return []ent.Field{
    field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
    field.String("user_id"),
    field.Int("value"),
  }
}

func (FileReaction) Edges() []ent.Edge {
  return []ent.Edge{
    edge.To("file", File.Type).Unique().Required(),
  }
}

func (FileReaction) Indexes() []ent.Index {
  return []ent.Index{
    index.Fields("user_id").Edges("file").Unique(),
  }
}

