package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"github.com/rs/xid"
)

// UserShadow stores minimal user profile derived from Keycloak on first login.
type UserShadow struct{ ent.Schema }

func (UserShadow) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").Immutable().Unique().DefaultFunc(func() string { return xid.New().String() }),
		field.String("keycloak_sub").Unique(),
		field.String("handle").Optional(),
		field.String("display_name").Optional(),
	}
}
