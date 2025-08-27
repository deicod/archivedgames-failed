package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/deicod/archivedgames/ent"
	"github.com/deicod/archivedgames/internal/ingest"
	_ "github.com/lib/pq"
)

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}

func dsn() string {
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		getenv("PGHOST", "localhost"), getenv("PGPORT", "5432"), getenv("PGUSER", "dev"), getenv("PGPASSWORD", "dev"), getenv("PGDATABASE", "archivedgames"), getenv("PGSSLMODE", "disable"))
}

func main() {
	root := flag.String("root", getenv("GAMES_DIR", "./games"), "root directory of games (c64/amiga/dos subfolders)")
	platform := flag.String("platform", "", "optional platform filter: c64|amiga|dos")
	dry := flag.Bool("dry-run", false, "do not write to DB, just print actions")
	flag.Parse()
	ctx := context.Background()
	c, err := ent.Open("postgres", dsn())
	if err != nil {
		log.Fatal(err)
	}
	defer c.Close()
	if err := c.Schema.Create(ctx); err != nil {
		log.Fatal(err)
	}
	if err := ingest.Scan(ctx, c, *root, &ingest.Options{Platform: *platform, DryRun: *dry}); err != nil {
		log.Fatal(err)
	}
}
