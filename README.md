# ArchivedGames

Archive browser for C64 / Amiga / MS‑DOS games.

- Backend: Go + ent/entgql + gqlgen, PostgreSQL, S3
- Frontend: React 19 + Relay, Tailwind, Vite
- Auth: Keycloak OIDC (`auth.icod.de`)
- Repo: `github.com/deicod/archivedgames`

## Getting started (dev)

1. Copy `.env.example` to `.env` and (optionally) create `.env.local` overrides.
2. Start dev stack:

```bash
docker compose -f docker-compose.dev.yml up -d
```

3. Frontend:

```bash
cd web
npm i
npm run dev
```

4. Backend: (agent will scaffold Go code next)

```bash
# placeholder; agent will write cmd/server and ent schemas
```

## Docs

See **/docs** for specs, scaffolds, and the agent issue plan.
