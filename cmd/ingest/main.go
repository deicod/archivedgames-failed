package main

import (
    "context"
    "flag"
    "fmt"
    "log"
    "os"

    "github.com/deicod/archivedgames/ent"
    _ "github.com/lib/pq"
    "github.com/deicod/archivedgames/internal/ingest"
)

func getenv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }

func dsn() string {
    return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        getenv("PGHOST","localhost"), getenv("PGPORT","5432"), getenv("PGUSER","dev"), getenv("PGPASSWORD","dev"), getenv("PGDATABASE","archivedgames"), getenv("PGSSLMODE","disable"))
}

func main(){
    root := flag.String("root", getenv("GAMES_DIR","/home/darko/go/src/code.icod.de/dalu/archivedgames/files"), "root directory of games (c64/amiga/dos subfolders)")
    flag.Parse()
    ctx := context.Background()
    c, err := ent.Open("postgres", dsn())
    if err != nil { log.Fatal(err) }
    defer c.Close()
    if err := c.Schema.Create(ctx); err != nil { log.Fatal(err) }
    if err := ingest.Scan(ctx, c, *root); err != nil { log.Fatal(err) }
}

