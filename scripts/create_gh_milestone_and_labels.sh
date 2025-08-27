#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-github.com/deicod/archivedgames}"

echo "Creating milestone 'V1 – MVP'..."
gh api repos/${REPO#github.com/}/milestones -f title='V1 – MVP' >/dev/null || true

echo "Creating labels..."
create_label() { local name="$1"; local color="$2"; gh api repos/${REPO#github.com/}/labels -f name="$name" -f color="$color" >/dev/null || true; }
create_label backend bfd4f2
create_label frontend 1abc9c
create_label graph 9b59b6
create_label ent 95a5a6
create_label entgql 8e44ad
create_label gqlgen 8e44ad
create_label ingest f39c12
create_label storage 34495e
create_label s3 34495e
create_label search 27ae60
create_label seo 2ecc71
create_label ops 2980b9
create_label security e74c3c
create_label moderation c0392b
create_label scaffold 7f8c8d
create_label auth 16a085
create_label upload 2c3e50
create_label tooling 7d3c98
create_label relay 6c5ce7

echo "Done. You can now import issues via GitHub UI (Issues → ⋯ → Import) with scripts/issues.csv"
