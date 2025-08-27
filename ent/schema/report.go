package schema

import (
    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// Report minimal moderation report
type Report struct{ ent.Schema }

func (Report) Fields() []ent.Field {
    return []ent.Field{
        field.String("subject_type"),
        field.String("subject_xid"),
        field.String("reporter_id").Optional(),
        field.String("reason"),
        field.String("note").Optional(),
        field.Enum("status").Values("OPEN","TRIAGED","ACTIONED","REJECTED").Default("OPEN"),
    }
}

