# ArchivedGames — Milestone 2 (UGC, Search, Moderation)

**Goal:** Deliver core community features (descriptions, comments, ratings, favorites/collections, video links), a solid search v1.5, and a basic moderation dashboard—without overreaching. Keep server the source of truth (sanitize server‑side; Relay drives UI).

---
## 1) Scope (ships in M2)
- **Descriptions (wiki‑style)**
  - Markdown input → sanitize with bluemonday; store `content_raw` + `content_sanitized`.
  - Versioned with `version` and `changeNote`; per‑language (`language` BCP‑47) with fallback.
  - Lightweight history view (list versions + diff text; no heavy WYSIWYG).
- **Comments**
  - Flat comments on **games** and **files**; edit window (5–10 min), soft delete.
  - Anti‑spam: per‑user/IP rate limits, cooldowns, link caps. No CAPTCHA.
- **Ratings & Reactions**
  - Game **like** (1/0) and File **like/dislike** (−1/ +1). Unique per user.
- **Favorites & Collections**
  - Favorite a game. Public **collections** (ordered items, name/description). Shareable URL.
- **Video links**
  - Add YouTube/Vimeo/PeerTube; parse/normalize; embed on game page.
- **Search v1.5 (Postgres FTS)**
  - Title FTS + prefix; filters (platform, year, file format); sort by title/year.
  - Keep `opensearch.xml`; suggestions backed by FTS prefix.
- **Moderation dashboard**
  - Reports queue; actions: quarantine file, hide comment, revert description version, remove video link. Audit log.
- **SEO polish**
  - Canonical URLs, JSON‑LD (BreadcrumbList + CreativeWork), OG/Twitter tags on game pages.
- **Monetization (optional)**
  - Ads **framework only** (feature‑flagged + consent‑gated). No provider adapter yet.

---
## 2) Data Model (ent) — deltas
> Ent‑first; `entgql` generates Relay types/queries. Only custom SDL for non‑CRUD ops.

- `DescriptionVersion` (ensure fields): `language`, `markup=MARKDOWN`, `content_raw`, `content_sanitized`, `version`, `author_id`.
- `Comment`: `subject_type` (`game|file`), `subject_xid`, `user_id`, `language?`, `content_sanitized`, `edited_at?`, `deleted_at?`.
- `Rating`: unique `(user_id, game_xid)`, `value=1`.
- `Reaction`: unique `(user_id, file_xid)`, `value ∈ {-1,1}`.
- `Favorite`: unique `(user_id, game_xid)`.
- `Collection` + `CollectionItem`: unique `(collection_xid, game_xid)`; index `(collection_xid, position)`.
- `VideoLink`: `provider` (`youtube|vimeo|peertube`), `url`, `title?`, `channel?`.
- **FTS**: add `tsvector` column/materialized view for `Game.title` (+ optional `aliases` table) with GIN index.

---
## 3) GraphQL — minimal custom ops
> Add to `api/custom.graphqls`. Lists/edges come from entgql.

- **Descriptions**: `upsertDescription(gameXid, language, content, changeNote) → DescriptionVersion!`; `revertDescription(versionXid) → DescriptionVersion!`
- **Comments**: `addComment(subjectType, subjectXid, content, language?)`, `editComment(xid, content)`, `deleteComment(xid)`
- **Ratings/Reactions**: `rateGame(gameXid, like) → Game!`, `reactToFile(fileXid, value) → File!`
- **Favorites/Collections**: `favoriteGame`, `unfavoriteGame`, `createCollection(name, public, description?)`, `updateCollection(...)`, `deleteCollection(xid)`, `addToCollection(collectionXid, gameXid, note?, position?)`, `removeFromCollection(itemXid)`
- **Video**: `addVideoLink(gameXid, url) → VideoLink!`, `removeVideoLink(xid) → Boolean!`
- **Search**: `search(query, platform?, yearFrom?, yearTo?, format?, first, after) → GameConnection!`
- **Moderation**: `reportContent(subjectType, subjectXid, reason, note?) → Report!`, `moderationQueue(status?, first?, after?) → ReportConnection!`, `quarantineFile(fileXid, reason) → File!`, `hideComment(xid, reason) → Comment!`, `revertDescriptionAdmin(versionXid, reason) → DescriptionVersion!`

---
## 4) Frontend (React 19 + Relay)
- **Game page**: description panel (language switch + edit/history); comments list with add/edit/delete; like button; file like/dislike; video embeds.
- **Collections**: my collections (CRUD) + public collection page with simple cover mosaic.
- **Search page**: query + filters (platform/year/format), infinite list; show counts.
- **Moderation** (role‑gated): table of reports + action drawers.
- **Sanitize & preview**: optional client Markdown preview; server always sanitizes.

---
## 5) Security & Abuse Controls
- Sanitize Markdown server‑side with tuned bluemonday policy (allow links, code, lists; disallow images in user text for now).
- Rate limits: comment/description edit/video link endpoints; per‑user cooldowns.
- Length limits: titles, notes, content; max links per comment; `rel="nofollow"` for external links.

---
## 6) Acceptance Criteria
- Users can add **descriptions** in multiple languages; latest version renders sanitized; history shows versions & change notes; fallback to another language works.
- Users can **comment** on games/files; edit within a short window; deletions soft‑hide.
- Users can **like** games and **like/dislike** files; aggregates update immediately.
- Users can **favorite** games; create **public collections** and add/remove items; shareable URL renders.
- Users can add **video links** that embed correctly (YT/Vimeo/PeerTube).
- **Search** finds titles with typos/prefix; filters by platform/year/format.
- **Moderators** can action reports (quarantine/hide/revert); actions are audited.
- Canonical tags & JSON‑LD present on game pages; FTS suggestions respond <150ms on small data.

---
## 7) Implementation Notes
- Keep `entgql` as source of truth; minimize custom SDL.
- Sanitization path: `content_raw → sanitize → content_sanitized`; never render `raw`.
- Video URL parsing: extract provider + id; store normalized URL; validate embeddability.
- FTS: use `to_tsvector('simple', title)` with trigram/GIN for prefix; periodically refresh matview if used.
- Feature flags via `SiteSetting` (public read): `descriptions.enabled`, `comments.enabled`, `collections.enabled`, `video.enabled`, `search.fts.enabled`, `ads.enabled`.

---
## 8) Migration & Rollout
- One migration batch for new tables/uniques/indexes.
- Deploy with flags default **off**; enable progressively.
- No downtime expected; new resolvers return empty when flags off.

---
## 9) Definition of Done (M2)
- All features above functional and gated by flags.
- Server sanitizes all UGC; moderation actions effective immediately.
- Search returns relevant results with filters and suggestions; SEO enhancements visible in HTML.
- Frontend routes implemented with Relay connections and mutations; baseline accessibility maintained.

