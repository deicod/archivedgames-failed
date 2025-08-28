# Changelog — ArchivedGames

All notable changes to this repo are documented here. Use reverse‑chronological order. New entries should follow the format below and keep bullets concise and action‑oriented.

Entry template:
- YYYY‑MM‑DD: short title
  - change bullet

---


- 2025-08-28: Ingestion polish — platform allowlist + disk/side labels
  - Validate file extensions per platform (C64/Amiga/DOS) and flag `needs_review` when mismatched
  - Inspect DOS `.zip` contents and auto-clear `needs_review` when `.exe`/`.com` present; keep `rar/7z` flagged for review
  - Parse and persist `disk_number` and `side` from filenames; append label to `normalized_name`
  - Keep grouping via `set_key` (platform+slug); `FileGroup` model tracked in #44 for a follow-up
  - Tracks: #45, #44

- 2025-08-28: FileGroup model and linking
  - Add `FileGroup` entity with unique `key` and edge to `Game`; expose Relay connection
  - Link `File` to `FileGroup` via `group` edge; keep `set_key` for compatibility
  - Update ingest to find/create `FileGroup` per `platform:slug` and assign on file create
  - Update GraphQL config to map `FileGroup` types to ent models
  - Tracks: #44

- 2025-08-28: Frontend — Tailwind CSS v4 + deps update
  - Migrate to Tailwind CSS v4: `@import "tailwindcss";` and CSS `@source` directives; remove `tailwind.config.js`
  - Switch PostCSS plugin to `@tailwindcss/postcss`; keep `autoprefixer`
  - Update `@vitejs/plugin-react` to ^5; keep Vite 7
  - Update `react-router-dom` to latest v6 (avoid v7 breaking changes), `react-oidc-context` to ^2.4, and `@types/react*`
  - Docs: update Frontend Scaffold (Part 1) for Tailwind v4 setup
  - Tracks: #49

- 2025-08-28: SEO — show publisher/year on game page
  - GameDetail now renders `publisher` and `year` in the page body below the title
  - GraphQL query updated accordingly; build verified
  - Tracks: #47

- 2025-08-28: SEO — Canonical URLs + JSON-LD
  - Add runtime `<link rel="canonical">` for Home, PlatformList, and GameDetail
  - Inject JSON-LD on GameDetail: `VideoGame` + `BreadcrumbList` with Home → Platform → Game
  - Implemented lightweight `Seo` helper component (no external deps)
  - Build verified (Relay + Vite)
  - Tracks: #36

- 2025-08-28: Auth — react-oidc-context + oidc-client-ts
  - Configure `AuthProvider` with `onSigninCallback` to clean `code/state` from URL
  - Add `silent_redirect_uri` and `/oidc-silent` route that runs `signinSilentCallback()`
  - Use LocalStorage `WebStorageStateStore`; keep PKCE flow and token sync for API
  - Add explicit `oidc-client-ts` dependency
  - Tracks: #50

- 2025-08-28: Auth — callback route + guarded admin
  - Add `/oidc-callback` route that calls `signinRedirectCallback()` and cleans URL
  - Guard `/admin/reports` with `withAuthenticationRequired`; show "Not authorized" if not admin
  - Fix Header admin gating to read `isAdmin` via props; add env overrides for redirect/silent paths
  - Tracks: #51

- 2025-08-28: Images — derived thumbnails and /img route
  - Generate JPEG derivatives at widths 128 and 512 on finalizeImageUploads (best-effort)
  - Add `/img/{imageId}?w=128|512` redirect to S3 keys; fall back to original when missing
  - Frontend now requests `?w=512` for cover and gallery images
  - Tracks: #46

- 2025-08-28: Frontend — adopt shadcn/ui (base)
  - Add shadcn/ui scaffolding: `components.json`, `cn` util, `Button` component
  - Add deps: `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `lucide-react`
  - Tailwind v4: add `tailwindcss-animate` plugin via `@plugin`; base theme tokens in CSS
  - Vite: alias `@` → `src`; replace some buttons (Login/Logout/Support/Load more) with `<Button>`
  - Tracks: #52

- 2025-08-28: Moderation — Report submission dialog
  - Add in-app report dialog with preset reasons and optional note on GameDetail
  - Submit via `reportContent(subjectType, subjectId, reason, note)`; show feedback
  - Replaces prompt-based flow; aligns with moderation plan (I2)
  - Tracks: #34

- 2025-08-28: Backlog — shadcn/ui follow-ups
  - Add shadcn/ui components and refactor views (#53)
  - Theme toggle and tokens (Tailwind v4) (#54)
  - Replace remaining buttons/controls with shadcn/ui (#55)

- 2025-08-28: Planning — NEXT.md linked to GitHub issues
  - Annotate `docs/NEXT.md` with direct links to open issues for each next step
  - Create tracking issues for missing items: #44 (FileGroup model), #45 (Platform validation & DOS zips), #46 (Image thumbnails), #47 (Publisher/year in body), #48 (Observability metrics/logging)
  - Sync tracking issue #20 body to mirror updated `docs/NEXT.md`

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
