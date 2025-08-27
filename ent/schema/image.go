package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema"
    "entgo.io/contrib/entgql"
    "github.com/rs/xid"
)

// Image holds the schema definition for the Image entity.
type Image struct{ ent.Schema }

func (Image) Annotations() []schema.Annotation {
    return []schema.Annotation{
        entgql.RelayConnection(),
    }
}

func (Image) Fields() []ent.Field {
    return []ent.Field{
        field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
        field.Enum("kind").Values("COVER", "GALLERY"),
        field.Int("position").Default(0),
        field.String("s3_key"),
        field.Int("width"),
        field.Int("height"),
    }
}

func (Image) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("game", Game.Type).Ref("images").Unique().Required(),
    }
}
