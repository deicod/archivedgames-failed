package main

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/deicod/archivedgames/ent"
    "github.com/deicod/archivedgames/ent/game"
    _ "github.com/lib/pq"
)

func getenv(k, d string) string { if v := os.Getenv(k); v != "" { return v }; return d }

func dsn() string {
    return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        getenv("PGHOST","localhost"), getenv("PGPORT","5432"), getenv("PGUSER","app"), getenv("PGPASSWORD","app"), getenv("PGDATABASE","archivedgames"), getenv("PGSSLMODE","disable"))
}

func main(){
    ctx := context.Background()
    c, err := ent.Open("postgres", dsn())
    if err != nil { log.Fatal(err) }
    defer c.Close()
    if err := c.Schema.Create(ctx); err != nil { log.Fatal(err) }

    // Simple upsert-ish: create some games if none exist.
    n, err := c.Game.Query().Count(ctx)
    if err != nil { log.Fatal(err) }
    if n == 0 {
        g1, err := c.Game.Create().SetSlug("example-game-1").SetPlatform(game.PlatformC64).SetTitle("Example Game 1").Save(ctx)
        if err != nil { log.Fatal(err) }
        _, _ = c.File.Create().SetXid(g1.Xid+"-f1").SetPath("c64/example1.d64").SetOriginalName("Example1.d64").SetNormalizedName("Example 1").SetChecksum("deadbeef").SetSizeBytes(123456).SetSource("s3").SetGame(g1).Save(ctx)

        g2, err := c.Game.Create().SetSlug("example-game-2").SetPlatform(game.PlatformDOS).SetTitle("Example Game 2").Save(ctx)
        if err != nil { log.Fatal(err) }
        _, _ = c.File.Create().SetXid(g2.Xid+"-f1").SetPath("dos/example2.zip").SetOriginalName("Example2.zip").SetNormalizedName("Example 2").SetChecksum("beadfeed").SetSizeBytes(654321).SetSource("s3").SetGame(g2).Save(ctx)
        log.Println("Seeded example games and files.")
    } else {
        log.Printf("DB already has %d games; skipping seed.\n", n)
    }
}

