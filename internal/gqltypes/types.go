package gqltypes

import (
    "encoding/json"
    "io"

    entgql "entgo.io/contrib/entgql"
)

// Cursor aliases the entgql generic cursor to a concrete type for gqlgen mapping.
type Cursor = entgql.Cursor[int]

// RawMessage is a JSON scalar backed by bytes, with GraphQL marshaling.
type RawMessage []byte

func (m RawMessage) MarshalGQL(w io.Writer) {
    if m == nil {
        _, _ = w.Write([]byte("null"))
        return
    }
    _, _ = w.Write([]byte(m))
}

func (m *RawMessage) UnmarshalGQL(v any) error {
    b, err := json.Marshal(v)
    if err != nil {
        return err
    }
    *m = RawMessage(b)
    return nil
}

