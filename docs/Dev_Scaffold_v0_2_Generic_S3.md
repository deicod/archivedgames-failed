# ArchivedGames — Dev Scaffold (v0.2, Generic S3)

Replaces provider-specific bits with **generic S3** config. Dev uses **MinIO**; production can be AWS S3 or any S3‑compatible provider.

---

## 1) `.env.example`
```env
# Postgres
PGHOST=postgres
PGPORT=5432
PGDATABASE=archivedgames
PGUSER=app
PGPASSWORD=app

# S3 (Generic)
# For AWS S3: leave S3_ENDPOINT empty and set S3_REGION; PATH_STYLE=false
# For MinIO/other S3-compatible: set S3_ENDPOINT and PATH_STYLE=true
S3_ENDPOINT=
S3_REGION=eu-central-1
S3_BUCKET=archivedgames
S3_ACCESS_KEY=changeme
S3_SECRET_KEY=changeme
S3_FORCE_PATH_STYLE=false
S3_USE_ACCELERATE=false

# Keycloak (OIDC)
OIDC_ISSUER=https://auth.icod.de/realms/archivedgames
OIDC_CLIENT_ID=web-spa
OIDC_AUDIENCE=archivedgames-api

# CORS
CORS_ALLOWED_ORIGINS=https://archivedgames.com,http://localhost:5173

# Rate limits (example)
RATE_LIMIT_ANON_MB_PER_DAY=500
RATE_LIMIT_ANON_DOWNLOADS_PER_HOUR=8
RATE_LIMIT_USER_MB_PER_DAY=2048
RATE_LIMIT_USER_DOWNLOADS_PER_HOUR=20

# Donations
DONATIONS_URL=https://ko-fi.com/yourhandle
DONATIONS_CTA="Support the archive"
```

---

## 2) Local dev overrides (`.env.local` example)
```env
S3_ENDPOINT=http://minio:9000
S3_FORCE_PATH_STYLE=true
S3_REGION=us-east-1
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
```

---

## 3) `docker-compose.dev.yml`
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: archivedgames
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

  app:
    build: .
    command: ["air"] # hot reload
    env_file:
      - .env
      - .env.local
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - minio

volumes:
  pgdata:
  miniodata:
```

---

## 4) `gqlgen.yml`
```yaml
schema:
  - ent.graphql
  - api/custom.graphqls
exec:
  filename: graph/generated.go
  package: generated
model:
  filename: graph/model/models_gen.go
  package: model
resolver:
  layout: follow-schema
  dir: graph
  package: graph
autobind:
  - github.com/deicod/archivedgames/ent/game
  - github.com/deicod/archivedgames/ent/file
  - github.com/deicod/archivedgames/ent/image
  - github.com/deicod/archivedgames/ent/videolink
  - github.com/deicod/archivedgames/ent/descriptionversion
  - github.com/deicod/archivedgames/ent/comment
  - github.com/deicod/archivedgames/ent/rating
  - github.com/deicod/archivedgames/ent/reaction
  - github.com/deicod/archivedgames/ent/favorite
  - github.com/deicod/archivedgames/ent/collection
  - github.com/deicod/archivedgames/ent/collectionitem
  - github.com/deicod/archivedgames/ent/report
  - github.com/deicod/archivedgames/ent/moderationaction
  - github.com/deicod/archivedgames/ent/sitesetting
  - github.com/deicod/archivedgames/ent/usershadow
```

---

## 5) Dev UX
- `make up` → starts Postgres + MinIO + app (hot reload)
- `make migrate` → ent migrations
- `make gen` → ent generate + gqlgen
- Frontend dev: `npm run dev` (Vite) → http://localhost:5173

---

## 6) Production notes (Generic S3)
- Leave `S3_ENDPOINT` empty for AWS S3; set only `S3_REGION`, `S3_BUCKET`, keys; keep `S3_FORCE_PATH_STYLE=false`.
- For other S3‑compatible providers, set `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE=true` as required by the provider.
- Use **pre‑signed GET/PUT** URLs (no public read policy needed). Configure bucket CORS to allow `GET, PUT, HEAD` from your origins.
