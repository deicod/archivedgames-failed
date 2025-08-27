# ArchivedGames — V1 MVP Plan & Backlog (v0.2)

> **What changed from v0.1**
> - Added **Monetization (Donations)** to V1, with SiteSetting + Support button + public config query.
> - Kept scope intentionally small; all big UGC/search features move to V2+.

**Goal of V1**: ship a thin, lovable slice — browse → game detail → download file — with solid ingestion, S3, rate limits, and minimal UI.

---

## 0) Non‑negotiables (V1)
- **Platforms**: C64, Amiga, DOS
- **Ingestion**: scan `games/{c64,amiga,dos}` → create `Game` + `File` using filename heuristics; flag ambiguous entries
- **Downloads**: allowed by default (except ROM/firmware); anti‑mirroring + IP/user rate limits + pre‑signed URLs
- **UI**: platform lists + game detail; cover + up to 4 gallery images (upload requires login)
- **Auth**: Keycloak @ `auth.icod.de` (OIDC). Anonymous browsing & downloads work
- **Search**: minimal title prefix search (full FTS later)
- **SEO**: `sitemap.xml`, `robots.txt`, basic meta, `opensearch.xml`
- **Monetization**: donations only (Support button → external provider link)

---

## 1) Out of scope for V1 → V2+
- Wiki descriptions (versioned, i18n), comments
- Favorites, ratings, collections, video links
- Postgres FTS + synonyms + advanced filters
- Full moderation suite (keep report → quarantine only in V1)
- External metadata import (MobyGames/IGDB/OpenRetro)
- Ads (consent‑gated) — optional in V2

---

## 2) Architecture Baseline
- **Backend**: Go; `ent` + `entgql` (Relay codegen), `gqlgen`; PostgreSQL
- **IDs**: `rs/xid`; mixins include **TimeMixin with immutable `created_at`**
- **Storage**: S3 (files & images), pre‑signed GET/PUT
- **Frontend**: React + Relay, Tailwind, Vite (SPA) with light prerender for `/`, `/platform/*`, `/game/*`

---

## 3) V1 Backlog (agent‑ready, 1–3h tickets)

### A. Repo & Tooling
- [ ] A1: Init repo (Go 1.22), `go mod`, `Makefile` (`gen`, `migrate`, `run`)
- [ ] A2: Add `ent` + `entgql` + `gqlgen` scaffolding; minimal `gqlgen.yml`
- [ ] A3: Docker Compose for dev: Postgres + MinIO (S3‑compatible) + app

### B. Data Model (minimal)
- [ ] B1: `Game` (xid, slug, platform, title, year?, publisher?, developer?)
- [ ] B2: `File` (xid, game, path, original_name, normalized_name, checksum, size_bytes, mime, format, source, quarantine?)
- [ ] B3: `Image` (xid, game, kind, position, s3_key, w/h)
- [ ] B4: `UserShadow` (xid, keycloak_sub, handle, display_name) — created on first login
- [ ] B5: Migrations + seed script creates sample games

### C. Ingestion
- [ ] C1: Filesystem scanner per platform (C64: d64/t64/prg; Amiga: adf/ipf; DOS: zip/exe/com/img)
- [ ] C2: Filename normalizer (strip tags/year/lang, underscores→spaces, title‑case)
- [ ] C3: Group multi‑disk/side sets under one Game; compute checksum & size
- [ ] C4: Idempotent sync; `needs_review` for low confidence

### D. Storage & Downloads
- [ ] D1: S3 client + bucket config; pre‑signed **GET** for downloads; **PUT** for image upload
- [ ] D2: Download endpoint: create short‑TTL token → redirect to signed URL
- [ ] D3: Rate limiter (IP + user): token bucket (env‑tuned caps)
- [ ] D4: Quarantine blocks signed URL issuance

### E. API (GraphQL)
- [ ] E1: entgql‑generated queries: `games`, `files`, `images` connections
- [ ] E2: Custom: `getDownloadURL(fileXid)` → signed URL
- [ ] E3: Custom: `uploadGameImages(gameXid, kind, files[])` → pre‑signed PUTs
- [ ] E4: Custom: `opensearchSuggestions(q)` (prefix from titles)

### F. Auth & Security
- [ ] F1: Keycloak OIDC middleware → context user (sub, roles)
- [ ] F2: Role guard: image upload requires login; ingestion endpoints admin‑only
- [ ] F3: Sanitization hook for any user‑text (image titles/alt text if present)

### G. Frontend (SPA)
- [ ] G1: Vite + Tailwind + Relay env
- [ ] G2: Pages: Home (platform tiles/search), PlatformList (infinite list), GameDetail (cover/gallery, files table, Download)
- [ ] G3: Login/Logout with Keycloak; viewer state
- [ ] G4: Image upload widget (drag‑and‑drop) if logged in

### H. SEO & Prerender
- [ ] H1: `opensearch.xml`, `sitemap.xml`, `robots.txt`
- [ ] H2: Prerender for `/`, `/platform/*`, `/game/*`; OG/Twitter meta from cover

### I. Moderation (minimal)
- [ ] I1: Report button on Game/File → creates `Report`
- [ ] I2: Admin: list reports; action: `quarantineFile`

### J. Observability & Ops
- [ ] J1: Structured logs + request IDs
- [ ] J2: Basic metrics (resolver timings, ingestion throughput)
- [ ] J3: Health/readiness probes; simple alerts (log‑based)

### K. Monetization (V1 donations)
- [ ] K1: `SiteSetting` schema + migration (key/json/public)
- [ ] K2: GraphQL: `publicSiteConfig` (read) + `setSiteSetting` (admin write)
- [ ] K3: `<SupportButton/>` in header & GameDetail reading `donations.url`
- [ ] K4: Optional: add UTM params to `donations.url`

---

## 4) Acceptance Criteria (V1)
- Ingest messy dirs for 3 platforms; ≥95% files matched to a Game or flagged
- Browse by platform → Game detail shows cover/gallery & file table; **download works** and is rate‑limited
- Login via Keycloak; logged‑in users can upload cover + up to 4 images
- `opensearch.xml`, `sitemap.xml` live; prerendered pages have correct meta
- Reports create a moderation entry; quarantined files don’t issue download URLs
- **Support button** appears sitewide and links to configured donations URL

---

## 5) V2+ Roadmap (vision)
**V2 (UGC & Search)**: wiki descriptions (versioned/i18n), comments, ratings, favorites, collections, video links; Postgres FTS; moderation dashboard.  
**V2.1 (Metadata import)**: MobyGames/IGDB importers; checksum adapters (OpenRetro); attribution; nightly sync (metadata only).  
**V3 (Scale & polish)**: advanced search (synonyms/typo), optional OpenSearch engine, transparency page, analytics, export APIs, richer filters/facets, ads (consent‑gated).

---

## 6) Working Mode for the Coding Agent
- Keep tasks ≤200 LOC each; one PR per ticket; `make gen && make migrate && make test` must pass
- Feature flags for risky bits; trunk‑based, short‑lived branches
- Tiny fixtures for ingestion; a couple of golden GraphQL tests per custom resolver
