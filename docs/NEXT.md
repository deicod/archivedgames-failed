# NEXT — Work Plan After v0.1

This document captures current status and the prioritized next steps so we can pick up seamlessly.

## Where We Are
- v0.1 (V1 MVP) is tagged and published.
- Core flow shipped: ingest → browse → game detail → download (rate‑limited), with image uploads and minimal moderation.
- IDs are rs/xid (string) throughout; Relay is wired end‑to‑end.

## Prioritized Next Steps
1) Ingestion polish (C1–C4)
- Confidence scoring: mark `needs_review` for ambiguous titles; add simple rules/guidance. (baseline shipped)
- Optional: persist a stronger grouping model (FileGroup) and link Files. [#44](https://github.com/deicod/archivedgames/issues/44)
- Platform‑specific format validation; better DOS zip content handling (future). [#45](https://github.com/deicod/archivedgames/issues/45)

2) Images & UX
- Thumbnails/derived sizes (would need a background job or on‑the‑fly scaler; optional for MVP). [#46](https://github.com/deicod/archivedgames/issues/46)
- Add “Set cover” control on current cover slot (if not cover), small UI polish. Tracked under [#40](https://github.com/deicod/archivedgames/issues/40)

6) Frontend Polish
- Adopt more shadcn/ui primitives (Dialog, Input, Select, Tabs) and refactor views. [#53](https://github.com/deicod/archivedgames/issues/53)
- Theme toggle + tokens (Tailwind v4 CSS variables; persist preference). [#54](https://github.com/deicod/archivedgames/issues/54)
- Replace remaining class-based buttons/controls with shadcn/ui variants. [#55](https://github.com/deicod/archivedgames/issues/55)

3) Moderation (I2)
- AdminReports paging polish (total counts), bulk actions. [#35](https://github.com/deicod/archivedgames/issues/35)
- Report submission polish and flows. [#34](https://github.com/deicod/archivedgames/issues/34)
- Frontend route + role‑gated access. [#43](https://github.com/deicod/archivedgames/issues/43)

4) SEO/Meta
- Canonical URLs + JSON‑LD on game pages. [#36](https://github.com/deicod/archivedgames/issues/36)
- Optional: nicer OG platform images (replace solid color placeholders with branded assets).
- Add publisher/year to game page body, not just meta. [#47](https://github.com/deicod/archivedgames/issues/47)

5) Observability
- Structured logs + request IDs; basic metrics (resolver timings, ingest throughput). [#48](https://github.com/deicod/archivedgames/issues/48)

## How To Run
- Server (dev):
```
make gen
go run ./cmd/server
```
- Frontend (dev):
```
cd web
npm install
npm run dev
```
- Ingestion:
```
go run ./cmd/ingest --root ./games --dry-run
# Then without --dry-run to persist. Use --platform c64|amiga|dos as needed
```
- Admin page: `/admin/reports` (requires admin role).

## Gotchas / Notes
- OIDC: set `VITE_OIDC_ISSUER` and `VITE_OIDC_CLIENT_ID`; the SPA syncs `access_token` to localStorage for API calls.
- GraphQL URL: set `VITE_GRAPHQL_URL` (frontend) to `http://localhost:8080/graphql` for local dev.
- S3: dev uses MinIO; ensure `.env.local` matches docker compose (path‑style).
- Downloads: SPA uses `/d/{fileId}` HTTP redirect to signed S3 URLs; rate limits apply.
- Images: SPA uses `/img/{imageId}` which redirects to signed S3 URLs; consider caching headers in production.
- Dev cleanup: server drops legacy `reports.subject_xid` if present on startup.

## Reference
- Changelog: `changelog.MD` (reverse‑chronological)
- V1 Plan: `docs/ArchivedGames_V1_MVP_Plan_v0_2.md`
- Data Model: `docs/Data_Model_and_API_ent_first.md`
 - Tracking Issue: [#20 — Next Steps (post v0.1)](https://github.com/deicod/archivedgames/issues/20)
