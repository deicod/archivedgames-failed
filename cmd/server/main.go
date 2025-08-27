package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/deicod/archivedgames/ent"
	"github.com/deicod/archivedgames/ent/file"
	"github.com/deicod/archivedgames/ent/game"
	entimage "github.com/deicod/archivedgames/ent/image"
	_ "github.com/lib/pq"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	graphpkg "github.com/deicod/archivedgames/graph"
	authmw "github.com/deicod/archivedgames/internal/auth"
	ratelimit "github.com/deicod/archivedgames/internal/rate"
	reqmw "github.com/deicod/archivedgames/internal/request"
	"github.com/deicod/archivedgames/internal/s3client"
)

func dsnFromEnv() string {
	host := getenv("PGHOST", "localhost")
	port := getenv("PGPORT", "5432")
	db := getenv("PGDATABASE", "archivedgames")
	user := getenv("PGUSER", "dev")
	pass := getenv("PGPASSWORD", "dev")
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
		dropLegacyColumns(ctx)
	}

	dlRate := ratelimit.NewFromEnv()
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ok")) })
	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ready")) })
	mux.HandleFunc("/robots.txt", robotsTxt)
	mux.HandleFunc("/opensearch.xml", openSearchXML)
	mux.HandleFunc("/sitemap.xml", func(w http.ResponseWriter, r *http.Request) { sitemapXML(w, r, client) })
	mux.HandleFunc("/api/opensearch", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("q")
		plat := r.URL.Query().Get("platform")
		ctx := r.Context()
		qb := client.Game.Query()
		if q != "" {
			qb = qb.Where(game.TitleContainsFold(q))
		}
		if plat != "" {
			switch strings.ToLower(plat) {
			case "c64":
				qb = qb.Where(game.PlatformEQ(game.PlatformC64))
			case "amiga":
				qb = qb.Where(game.PlatformEQ(game.PlatformAMIGA))
			case "dos":
				qb = qb.Where(game.PlatformEQ(game.PlatformDOS))
			}
		}
		titles, _ := qb.Limit(10).Select("title").Strings(ctx)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `[%q,%s]`, q, toJSONArr(titles))
	})

	// HTTP download redirect: /d/{fileId}
	mux.HandleFunc("/d/", func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/d/")
		if id == "" {
			http.Error(w, "missing id", http.StatusBadRequest)
			return
		}
		ctx := r.Context()
		f, err := client.File.Query().Where(file.IDEQ(id)).Only(ctx)
		if err != nil {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		if f.Quarantine {
			http.Error(w, "quarantined", http.StatusForbidden)
			return
		}
		if f.Source != "s3" {
			http.Error(w, "unsupported source", http.StatusBadRequest)
			return
		}
		uid, _ := authmw.UserID(ctx)
		ip := reqmw.FromContextIP(ctx)
		if dlRate != nil {
			if err := dlRate.AllowDownload(uid, ip, f.SizeBytes); err != nil {
				http.Error(w, err.Error(), http.StatusTooManyRequests)
				return
			}
		}
		s3c, err := s3client.New(ctx)
		if err != nil {
			http.Error(w, "s3 error", http.StatusInternalServerError)
			return
		}
		url, err := s3c.PresignGet(ctx, f.Path, 2*time.Minute)
		if err != nil {
			http.Error(w, "sign error", http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, url, http.StatusFound)
	})
	resolver := &graphpkg.Resolver{Client: client, Rate: dlRate}
	srv := handler.NewDefaultServer(graphpkg.NewExecutableSchema(graphpkg.Config{Resolvers: resolver}))
	// Attach OIDC auth middleware
	mux.Handle("/graphql", reqmw.WithClientIP(authmw.NewValidator().Middleware(srv)))
	// Root handler with simple prerender for bots on /, /platform/*, /game/*
	playgroundHandler := playground.Handler("GraphQL", "/graphql")
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if isBot(r) {
			// Prerender paths
			p := r.URL.Path
			if p == "/" {
				prerenderHome(w, r)
				return
			}
			if strings.HasPrefix(p, "/platform/") {
				prerenderPlatform(w, r)
				return
			}
			if strings.HasPrefix(p, "/game/") {
				prerenderGame(w, r, client)
				return
			}
		}
		playgroundHandler.ServeHTTP(w, r)
	})

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

func isBot(r *http.Request) bool {
	ua := strings.ToLower(r.Header.Get("User-Agent"))
	if ua == "" {
		return false
	}
	bots := []string{"googlebot", "bingbot", "twitterbot", "facebookexternalhit", "slackbot", "duckduckbot", "baiduspider", "yandex"}
	for _, b := range bots {
		if strings.Contains(ua, b) {
			return true
		}
	}
	return false
}

func writeHTML(w http.ResponseWriter, title string, meta map[string]string, body string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>%s</title>", title)
	for k, v := range meta {
		// og: and twitter: meta
		if strings.HasPrefix(k, "og:") || strings.HasPrefix(k, "twitter:") {
			fmt.Fprintf(w, "<meta property=\"%s\" content=\"%s\">", k, htmlEscape(v))
		} else {
			fmt.Fprintf(w, "<meta name=\"%s\" content=\"%s\">", k, htmlEscape(v))
		}
	}
	fmt.Fprint(w, "</head><body>")
	fmt.Fprint(w, body)
	fmt.Fprint(w, "</body></html>")
}

func htmlEscape(s string) string {
	r := strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", "\"", "&quot;")
	return r.Replace(s)
}

func prerenderHome(w http.ResponseWriter, r *http.Request) {
	b := baseURL(r)
	meta := map[string]string{
		"description": "Browse and download classic games (C64, Amiga, DOS)",
		"og:title":    "ArchivedGames",
		"og:type":     "website",
		"og:url":      b + "/",
	}
	writeHTML(w, "ArchivedGames", meta, "<h1>ArchivedGames</h1>")
}

func prerenderPlatform(w http.ResponseWriter, r *http.Request) {
	b := baseURL(r)
	plat := strings.TrimPrefix(r.URL.Path, "/platform/")
	title := fmt.Sprintf("%s — ArchivedGames", strings.ToUpper(plat))
	meta := map[string]string{
		"description":  "Browse classic games by platform",
		"og:title":     title,
		"og:type":      "website",
		"og:url":       b + r.URL.Path,
		"og:site_name": "ArchivedGames",
	}
	writeHTML(w, title, meta, fmt.Sprintf("<h1>%s</h1>", htmlEscape(strings.ToUpper(plat))))
}

func prerenderGame(w http.ResponseWriter, r *http.Request, c *ent.Client) {
	b := baseURL(r)
	slug := strings.TrimPrefix(r.URL.Path, "/game/")
	ctx := r.Context()
	g, err := c.Game.Query().Where(game.SlugEQ(slug)).Only(ctx)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	title := fmt.Sprintf("%s — ArchivedGames", g.Title)
	ogImg := ""
	if img, err := c.Image.Query().Where(entimage.HasGameWith(game.IDEQ(g.ID)), entimage.KindEQ(entimage.KindCOVER)).Only(ctx); err == nil {
		if s3c, err := s3client.New(ctx); err == nil {
			if url, err := s3c.PresignGet(ctx, img.S3Key, 30*time.Minute); err == nil {
				ogImg = url
			}
		}
	}
	// Enrich description with publisher/year
	desc := "Download and view screenshots"
	if g.Publisher != "" || g.Year != nil {
		parts := []string{}
		if g.Publisher != "" {
			parts = append(parts, g.Publisher)
		}
		if g.Year != nil {
			parts = append(parts, fmt.Sprintf("%d", *g.Year))
		}
		desc = fmt.Sprintf("%s — %s", desc, strings.Join(parts, ", "))
	}
	// Fallback og:image if no cover
	if ogImg == "" {
		plat := strings.ToLower(string(g.Platform))
		ogImg = b + "/static/og/" + plat + ".png"
	}
	meta := map[string]string{
		"description":         desc,
		"og:title":            title,
		"og:type":             "article",
		"og:url":              b + r.URL.Path,
		"og:site_name":        "ArchivedGames",
		"og:image":            ogImg,
		"twitter:title":       title,
		"twitter:description": desc,
		"twitter:card":        "summary_large_image",
	}
	writeHTML(w, title, meta, fmt.Sprintf("<h1>%s</h1>", htmlEscape(g.Title)))
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

func toJSONArr(ss []string) string {
	b, _ := json.Marshal(ss)
	return string(b)
}

func dropLegacyColumns(ctx context.Context) {
	// Best-effort dev cleanup: drop old subject_xid column if present.
	dsn := dsnFromEnv()
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return
	}
	defer db.Close()
	_, _ = db.ExecContext(ctx, `ALTER TABLE reports DROP COLUMN IF EXISTS subject_xid`)
}
