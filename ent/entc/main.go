package main

import (
    "log"

    "entgo.io/contrib/entgql"
    "entgo.io/ent/entc"
    "entgo.io/ent/entc/gen"
)

func main() {
    cfg := &gen.Config{
        Features: []gen.Feature{
            gen.FeatureVersionedMigration,
        },
    }
    ext, err := entgql.NewExtension(
        entgql.WithSchemaGenerator(),
        entgql.WithSchemaPath("../api/ent.graphql"),
        entgql.WithRelaySpec(true),
        entgql.WithWhereInputs(true),
    )
    if err != nil {
        log.Fatalf("creating entgql extension: %v", err)
    }
    if err := entc.Generate("./schema", cfg, entc.Extensions(ext)); err != nil {
        log.Fatalf("running ent codegen: %v", err)
    }
}
