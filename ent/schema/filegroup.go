package schema

import (
    "entgo.io/contrib/entgql"
    "entgo.io/ent"
    "entgo.io/ent/schema"
    "entgo.io/ent/schema/edge"
    "entgo.io/ent/schema/field"
    "github.com/rs/xid"
)

// FileGroup represents a grouping of files that belong to the same set
// (e.g., multi-disk or multi-side variants) for a given game.
type FileGroup struct{ ent.Schema }

func (FileGroup) Annotations() []schema.Annotation {
    return []schema.Annotation{
        entgql.QueryField(),
        entgql.RelayConnection(),
    }
}

func (FileGroup) Fields() []ent.Field {
    return []ent.Field{
        field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
        // key is typically platform:slug (e.g., "c64:ik-plus")
        field.String("key").Unique(),
    }
}

func (FileGroup) Edges() []ent.Edge {
    return []ent.Edge{
        edge.To("files", File.Type).Annotations(entgql.RelayConnection()),
        edge.From("game", Game.Type).Ref("groups").Unique().Required(),
    }
}

