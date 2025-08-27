package auth

import (
    "context"
    "errors"
    "net/http"
    "os"
    "strings"
    "sync"
    "time"

    jwt "github.com/golang-jwt/jwt/v4"
    "github.com/MicahParks/keyfunc"
)

type Validator struct {
    jwksURL string
    aud     string
    issuer  string
    mu      sync.Mutex
    jwks    *keyfunc.JWKS
}

func NewValidator() *Validator {
    issuer := os.Getenv("OIDC_ISSUER")
    jwksURL := strings.TrimSuffix(issuer, "/") + "/protocol/openid-connect/certs"
    return &Validator{ jwksURL: jwksURL, aud: os.Getenv("OIDC_AUDIENCE"), issuer: issuer }
}

func (v *Validator) loadJWKS() error {
    v.mu.Lock(); defer v.mu.Unlock()
    if v.jwks != nil { return nil }
    jwks, err := keyfunc.Get(v.jwksURL, keyfunc.Options{ RefreshInterval: time.Hour, RefreshUnknownKID: true })
    if err != nil { return err }
    v.jwks = jwks
    return nil
}

func (v *Validator) parseToken(tokenString string) (*jwt.Token, jwt.MapClaims, error) {
    if err := v.loadJWKS(); err != nil { return nil, nil, err }
    var claims jwt.MapClaims
    token, err := jwt.ParseWithClaims(tokenString, &claims, v.jwks.Keyfunc)
    if err != nil { return nil, nil, err }
    if !token.Valid { return nil, nil, errors.New("invalid token") }
    if iss, _ := claims["iss"].(string); v.issuer != "" && iss != v.issuer { return nil, nil, errors.New("issuer mismatch") }
    if v.aud != "" {
        switch a := claims["aud"].(type) {
        case string:
            if a != v.aud { return nil, nil, errors.New("audience mismatch") }
        case []any:
            ok := false
            for _, e := range a { if s, _ := e.(string); s == v.aud { ok = true; break } }
            if !ok { return nil, nil, errors.New("audience mismatch") }
        }
    }
    return token, claims, nil
}

// Middleware attaches user information to the request context if a valid
// Bearer token is presented. Anonymous requests pass through unchanged.
func (v *Validator) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authz := r.Header.Get("Authorization")
        if strings.HasPrefix(strings.ToLower(authz), "bearer ") {
            tokenStr := strings.TrimSpace(authz[len("Bearer "):])
            if _, claims, err := v.parseToken(tokenStr); err == nil {
                sub, _ := claims["sub"].(string)
                var roles []string
                if realm, ok := claims["realm_access"].(map[string]any); ok {
                    if rs, ok := realm["roles"].([]any); ok {
                        for _, r := range rs { if s, _ := r.(string); s != "" { roles = append(roles, s) } }
                    }
                }
                r = r.WithContext(WithUser(r.Context(), sub, roles))
            }
        }
        next.ServeHTTP(w, r)
    })
}

// FromContext returns the user id and roles if available.
func FromContext(ctx context.Context) (string, []string, bool) {
    id, ok := UserID(ctx)
    return id, Roles(ctx), ok
}
