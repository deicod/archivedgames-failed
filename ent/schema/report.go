package schema

import (
	"entgo.io/contrib/entgql"
	"entgo.io/ent"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
	"github.com/rs/xid"
)

// Report minimal moderation report
type Report struct{ ent.Schema }

func (Report) Annotations() []schema.Annotation { return []schema.Annotation{entgql.QueryField()} }

func (Report) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
		field.String("subject_type"),
		field.String("subject_id"),
		field.String("reporter_id").Optional(),
		field.String("reason"),
		field.String("note").Optional(),
		field.Enum("status").Values("OPEN", "TRIAGED", "ACTIONED", "REJECTED").Default("OPEN"),
	}
}
