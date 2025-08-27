package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/deicod/archivedgames/ent"
	_ "github.com/lib/pq"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	graphpkg "github.com/deicod/archivedgames/graph"
	authmw "github.com/deicod/archivedgames/internal/auth"
	ratelimit "github.com/deicod/archivedgames/internal/rate"
	reqmw "github.com/deicod/archivedgames/internal/request"
)

func dsnFromEnv() string {
	host := getenv("PGHOST", "localhost")
	port := getenv("PGPORT", "5432")
	db := getenv("PGDATABASE", "archivedgames")
	user := getenv("PGUSER", "app")
	pass := getenv("PGPASSWORD", "app")
	ssl := getenv("PGSSLMODE", "disable")
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, port, user, pass, db, ssl)
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func main() {
	ctx := context.Background()

	client, err := ent.Open("postgres", dsnFromEnv())
	if err != nil {
		log.Fatalf("opening database: %v", err)
	}
	defer client.Close()

	// Run migrations on startup for dev.
	if getenv("MIGRATE_ON_START", "true") == "true" {
		if err := client.Schema.Create(ctx); err != nil {
			log.Fatalf("running migrations: %v", err)
		}
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ok")) })
	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ready")) })
	mux.HandleFunc("/robots.txt", robotsTxt)
	mux.HandleFunc("/opensearch.xml", openSearchXML)
	mux.HandleFunc("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) { sitemapXML(w, r, client) })
	resolver := &graphpkg.Resolver{Client: client, Rate: ratelimit.NewFromEnv()}
	srv := handler.NewDefaultServer(graphpkg.NewExecutableSchema(graphpkg.Config{Resolvers: resolver}))
	// Attach OIDC auth middleware
	mux.Handle("/graphql", reqmw.WithClientIP(authmw.NewValidator().Middleware(srv)))
	mux.Handle("/", playground.Handler("GraphQL", "/graphql"))

	addr := ":8080"
	httpSrv := &http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 10 * time.Second}
	log.Printf("listening on %s", addr)
	if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func baseURL(r *http.Request) string {
	scheme := "http"
	if r.Header.Get("X-Forwarded-Proto") == "https" || r.TLS != nil {
		scheme = "https"
	}
	host := r.Host
	return scheme + "://" + host
}

func robotsTxt(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User-agent: *\nAllow: /\n"))
}

func openSearchXML(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/opensearchdescription+xml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	xml := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>`+
		`<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">`+
		`<ShortName>ArchivedGames</ShortName>`+
		`<Description>Search game titles</Description>`+
		`<InputEncoding>UTF-8</InputEncoding>`+
		`<Url type="application/json" template="%s/api/opensearch?q={searchTerms}"/>`+
		`</OpenSearchDescription>`, baseURL(r))
	w.Write([]byte(xml))
}

func sitemapXML(w http.ResponseWriter, r *http.Request, c *ent.Client) {
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	b := baseURL(r)
	urls := []string{
		b + "/",
		b + "/platform/c64",
		b + "/platform/amiga",
		b + "/platform/dos",
	}
	ctx := r.Context()
	slugs, _ := c.Game.Query().Select("slug").Strings(ctx)
	for _, s := range slugs {
		urls = append(urls, b+"/game/"+s)
	}
	w.Write([]byte("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"))
	w.Write([]byte("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"))
	for _, u := range urls {
		w.Write([]byte("  <url><loc>" + u + "</loc></url>\n"))
	}
	w.Write([]byte("</urlset>"))
}
