package obs

import (
    "net/http"
    "strconv"
    "time"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
    // Default registry to avoid polluting the global one if embedding elsewhere.
    Registry = prometheus.NewRegistry()

    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{Name: "http_requests_total", Help: "Total HTTP requests"},
        []string{"method", "path", "status"},
    )
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{Name: "http_request_duration_seconds", Help: "HTTP request duration seconds", Buckets: prometheus.DefBuckets},
        []string{"method", "path"},
    )
)

func init() {
    Registry.MustRegister(httpRequestsTotal, httpRequestDuration)
}

// WithHTTPMetrics wraps an http.Handler to record Prometheus metrics.
func WithHTTPMetrics(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        ww := &statusWriter{ResponseWriter: w, status: http.StatusOK}
        next.ServeHTTP(ww, r)
        path := r.URL.Path
        httpRequestsTotal.WithLabelValues(r.Method, path, strconv.Itoa(ww.status)).Inc()
        httpRequestDuration.WithLabelValues(r.Method, path).Observe(time.Since(start).Seconds())
    })
}

// MetricsHandler returns a /metrics handler for the custom registry.
func MetricsHandler() http.Handler { return promhttp.HandlerFor(Registry, promhttp.HandlerOpts{}) }

type statusWriter struct{
    http.ResponseWriter
    status int
}
func (s *statusWriter) WriteHeader(code int) { s.status = code; s.ResponseWriter.WriteHeader(code) }

// no custom itoa needed; strconv handles conversion

