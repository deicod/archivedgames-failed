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

// GameLike holds user likes for games.
type GameLike struct{ ent.Schema }

func (GameLike) Annotations() []schema.Annotation {
  return []schema.Annotation{
    entgql.QueryField(),
    entgql.RelayConnection(),
  }
}

func (GameLike) Fields() []ent.Field {
  return []ent.Field{
    field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
    field.String("user_id"),
  }
}

func (GameLike) Edges() []ent.Edge {
  return []ent.Edge{
    edge.To("game", Game.Type).Unique().Required(),
  }
}

func (GameLike) Indexes() []ent.Index {
  return []ent.Index{
    index.Fields("user_id").Edges("game").Unique(),
  }
}

