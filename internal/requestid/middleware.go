package requestid

import (
    "context"
    "net/http"
    "github.com/rs/xid"
)

type ctxKey struct{}

// FromContext returns the request id string, if any.
func FromContext(ctx context.Context) (string, bool) {
    v := ctx.Value(ctxKey{})
    if v == nil { return "", false }
    s, _ := v.(string)
    return s, s != ""
}

// Middleware injects an X-Request-ID header (generating one if absent) and puts it in the context.
func Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        rid := r.Header.Get("X-Request-ID")
        if rid == "" { rid = xid.New().String() }
        w.Header().Set("X-Request-ID", rid)
        ctx := context.WithValue(r.Context(), ctxKey{}, rid)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

