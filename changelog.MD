# Changelog — ArchivedGames

All notable changes to this repo are documented here. Use reverse‑chronological order. New entries should follow the format below and keep bullets concise and action‑oriented.

Entry template:
- YYYY‑MM‑DD: short title
  - change bullet

---


- 2025-08-28: Relay global IDs + frontend queries
  - Switch all entities to string `id` primary keys using rs/xid; remove separate `xid` fields
  - Update Node/Nodes resolvers and pagination to use `Cursor[string]`; align gqlgen mappings
  - Rename GraphQL args to id-based names: `gameId`, `fileId`, `subjectId` (was `*Xid`)
  - Rename `Report.subject_xid` → `subject_id`; add dev-only cleanup to drop legacy column if present
  - Enable entgql WhereInputs; `games(where: ...)` and `files(where: ...)` available for Relay filters
  - Frontend: PlatformList uses Relay to list games by platform with pagination; GameDetail queries by `slug` and lists images/files; Download uses `getDownloadURL(fileId)`
  - Add HTTP download redirect endpoint `/d/{fileId}` and wire GameDetail downloads to it (D2)
  - Add ImageUploader component: calls createImageUploads → PUT → finalizeImageUploads (auth required)
  - Add Report button on file rows (GameDetail) to call `reportContent` (I1)
  - Add basic AdminReports page to list OPEN reports and trigger quarantine action (I2)
  - Finalize image upload polish: enforce unique cover and max 4 gallery images server-side; add cover/gallery upload widgets in GameDetail
  - Ingestion improvements (C1–C4): better filename normalization (strip year/lang/disk/side tags), platform filter and dry-run flags, mark `needs_review` for unknown formats; idempotent checks remain via checksum.
  - SEO & Prerender (H2): add bot-targeted prerender for `/`, `/platform/*`, `/game/*` with OG/Twitter meta (uses cover image when available); keep SPA for regular users.
  - Admin reports polish (I2): add subjectType filter and offset pagination; "Admin" link in header when authenticated.
  - Ingestion grouping metadata: parse disk/side tokens from filenames and persist `disk_number`/`side` on File records
  - SEO: enrich game meta with publisher/year; add `/static/og/{platform}.png` solid placeholders when no cover
  - Ingestion: persist `set_key` on File to group multi-disk/side sets per normalized title and platform
  - UI gating: show Admin link only for users with `admin` role (decoded from access_token); add /img/{imageId} redirect for displaying images via S3 presign
  - Admin moderation: add setReportStatus(reportId,status) mutation; AdminReports now supports TRIAGED/REJECTED status changes
  - Frontend: SupportButton reads donations from `publicSiteConfig` (env fallback); sync OIDC access_token to localStorage for API
  - Web upgrades: Relay 20 + React 19.1; add schema merge step for relay-compiler; remove legacy JS relay config

- 2025-08-27: V1 backend scaffold + core features
  - Initialize Go module and Makefile; add gen/migrate/run targets
  - Add ent schemas: Game, File(+needs_review), Image, UserShadow, SiteSetting
  - Configure entgql to emit api/ent.graphql; align gqlgen.yml and models
  - Implement GraphQL server with Relay queries (games, files), node/nodes
  - Add custom queries: getDownloadURL (S3 presigned GET), opensearchSuggestions
  - Implement image upload flow: createImageUploads (presigned PUT) + finalizeImageUploads
  - Add OIDC (Keycloak) middleware; auth guards for mutations
  - Add in‑memory rate limiter (per‑hour downloads, per‑day MB) applied to downloads
  - Add moderation minimal: Report entity; reportContent + quarantineFile (admin) mutations
  - Add public site config GraphQL (publicSiteConfig) and admin setSiteSetting
  - Add /api/opensearch suggestions endpoint used by opensearch.xml
  - Implement SEO endpoints: /robots.txt, /opensearch.xml, /sitemap.xml
  - Add S3 client (generic S3/MinIO) with presign GET/PUT
  - Add ingestion scanner CLI (cmd/ingest) and filename normalization; idempotent on checksum
  - Add seed CLI (cmd/seed) with example data
  - Add Dockerfile; update docker‑compose.dev.yml to build/run server
  - Update README with dev run instructions
  - Introduce SiteSetting resolvers: publicSiteConfig (read) + setSiteSetting (admin upsert)
