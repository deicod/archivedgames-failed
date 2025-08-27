package request

import (
	"context"
	"net"
	"net/http"
	"strings"
)

type ctxKey string

const ipKey ctxKey = "clientIP"

func WithClientIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := clientIP(r)
		ctx := context.WithValue(r.Context(), ipKey, ip)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func FromContextIP(ctx context.Context) string {
	if v := ctx.Value(ipKey); v != nil {
		if s, _ := v.(string); s != "" {
			return s
		}
	}
	return ""
}

func clientIP(r *http.Request) string {
	// Respect X-Forwarded-For
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			return strings.TrimSpace(parts[0])
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}
