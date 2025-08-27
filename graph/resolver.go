package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.
import (
    "github.com/deicod/archivedgames/ent"
    "github.com/deicod/archivedgames/internal/rate"
)

type Resolver struct{
    Client *ent.Client
    Rate   *rate.Limiter
}
