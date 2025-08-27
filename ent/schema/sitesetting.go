package schema

import (
    "encoding/json"

    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// SiteSetting stores public site configuration such as donations URL.
type SiteSetting struct{ ent.Schema }

func (SiteSetting) Fields() []ent.Field {
    // Using JSON value for flexibility; default to empty object.
    return []ent.Field{
        field.String("key").Unique(),
        field.JSON("value", json.RawMessage{}).Optional(),
        field.Bool("public").Default(true),
    }
}
