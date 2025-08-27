package schema

import (
	"encoding/json"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"github.com/rs/xid"
)

// SiteSetting stores public site configuration such as donations URL.
type SiteSetting struct{ ent.Schema }

func (SiteSetting) Fields() []ent.Field {
	// Using JSON value for flexibility; default to empty object.
	return []ent.Field{
		field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
		field.String("key").Unique(),
		field.JSON("value", json.RawMessage{}).Optional(),
		field.Bool("public").Default(true),
	}
}
