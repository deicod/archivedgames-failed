package schema

import (
    "entgo.io/contrib/entgql"
    "entgo.io/ent"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "entgo.io/ent/schema"
    "github.com/rs/xid"
)

// File holds the schema definition for the File entity.
type File struct{ ent.Schema }

func (File) Annotations() []schema.Annotation {
    return []schema.Annotation{
        entgql.QueryField(),
        entgql.RelayConnection(),
    }
}

func (File) Fields() []ent.Field {
    return []ent.Field{
        field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
        field.String("path"),
        field.String("original_name"),
        field.String("normalized_name"),
        field.String("checksum"),
        field.Int64("size_bytes"),
        field.String("mime_type").Optional(),
        field.String("format").Optional(),
        field.String("source"), // local|s3
        field.Bool("quarantine").Default(false),
        field.Bool("needs_review").Default(false),
    }
}

func (File) Edges() []ent.Edge {
    return []ent.Edge{
        edge.From("game", Game.Type).Ref("files").Unique().Required(),
    }
}
