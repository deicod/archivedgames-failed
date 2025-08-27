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
    if v := os.Getenv(k); v != "" { return v }
    return def
}

func main() {
    ctx := context.Background()

    client, err := ent.Open("postgres", dsnFromEnv())
    if err != nil { log.Fatalf("opening database: %v", err) }
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
    resolver := &graphpkg.Resolver{ Client: client }
    srv := handler.NewDefaultServer(graphpkg.NewExecutableSchema(graphpkg.Config{ Resolvers: resolver }))
    mux.Handle("/graphql", srv)
    mux.Handle("/", playground.Handler("GraphQL", "/graphql"))

    addr := ":8080"
    httpSrv := &http.Server{ Addr: addr, Handler: mux, ReadHeaderTimeout: 10 * time.Second }
    log.Printf("listening on %s", addr)
    if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        log.Fatal(err)
    }
}
