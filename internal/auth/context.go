package auth

import (
    "context"
)

type ctxKey string

const (
    ctxUserID ctxKey = "userID"
    ctxRoles  ctxKey = "roles"
)

// WithUser returns a context carrying user id and roles.
func WithUser(ctx context.Context, userID string, roles []string) context.Context {
    ctx = context.WithValue(ctx, ctxUserID, userID)
    ctx = context.WithValue(ctx, ctxRoles, roles)
    return ctx
}

// UserID extracts the user id from context if present.
func UserID(ctx context.Context) (string, bool) {
    v := ctx.Value(ctxUserID)
    if v == nil { return "", false }
    s, _ := v.(string)
    return s, s != ""
}

// Roles returns roles claim if present.
func Roles(ctx context.Context) []string {
    v := ctx.Value(ctxRoles)
    if v == nil { return nil }
    if r, ok := v.([]string); ok { return r }
    return nil
}

// RequireUser returns user id or error if unauthenticated.
func RequireUser(ctx context.Context) (string, error) {
    if id, ok := UserID(ctx); ok { return id, nil }
    return "", ErrUnauthenticated
}

var ErrUnauthenticated = &AuthError{Msg: "unauthenticated"}

type AuthError struct{ Msg string }
func (e *AuthError) Error() string { return e.Msg }

