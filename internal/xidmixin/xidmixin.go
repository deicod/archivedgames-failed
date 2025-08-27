package xidmixin

import (
    "time"

    "entgo.io/ent"
    "entgo.io/ent/schema/field"
    "github.com/rs/xid"
)

// XIDMixin adds a globally unique immutable xid field using rs/xid.
type XIDMixin struct{}

func (XIDMixin) Fields() []ent.Field {
    return []ent.Field{
        field.String("xid").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
    }
}

// TimeMixin adds created_at and updated_at timestamps.
type TimeMixin struct{}

func (TimeMixin) Fields() []ent.Field {
    return []ent.Field{
        field.Time("created_at").Immutable().Default(time.Now),
        field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
    }
}

