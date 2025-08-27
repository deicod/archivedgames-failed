package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/rs/xid"
)

// Game holds the schema definition for the Game entity.
type Game struct{ ent.Schema }

func (Game) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entgql.QueryField(),
		entgql.RelayConnection(),
	}
}

func (Game) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
		field.String("slug").Unique(),
		field.Enum("platform").Values("C64", "AMIGA", "DOS"),
		field.String("title"),
		field.Int("year").Optional().Nillable(),
		field.String("publisher").Optional(),
		field.String("developer").Optional(),
	}
}

func (Game) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("files", File.Type).Annotations(entgql.RelayConnection()),
		edge.To("images", Image.Type).Annotations(entgql.RelayConnection()),
	}
}
