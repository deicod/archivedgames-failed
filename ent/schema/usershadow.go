package schema

import (
    xidmixin "github.com/deicod/archivedgames/internal/xidmixin"

    "entgo.io/ent"
    "entgo.io/ent/schema/field"
)

// UserShadow stores minimal user profile derived from Keycloak on first login.
type UserShadow struct{ ent.Schema }

func (UserShadow) Fields() []ent.Field {
    return append(
        append([]ent.Field{}, xidmixin.XIDMixin{}.Fields()...),
        []ent.Field{
            field.String("keycloak_sub").Unique(),
            field.String("handle").Optional(),
            field.String("display_name").Optional(),
        }...,
    )
}

