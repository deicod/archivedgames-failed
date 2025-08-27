# Ingestion & Matching Heuristics Pack (v0.1)

**Purpose**: Provide agent‑ready rules, data structures, and tasks to scan `games/{c64,amiga,dos}`, extract titles, group related files, and create `Game` + `File` rows with a confidence score. Keep it idempotent and review‑friendly.

---

## 1) Outputs
- `Game` rows created/updated with normalized `title`, `slug`, `platform`
- `File` rows created with `original_name`, `normalized_name`, `checksum`, `size_bytes`, `format`, `source`, `quarantine=false`
- Confidence score per file and per game aggregation; `needs_review` flag for low confidence
- Optional `IngestionArtifact` table for audit (path, checksum, detectedTitle, status, rulesetVersion)

---

## 2) Platform formats & quick sniff
- **C64**: `d64`, `t64`, `prg` (plus `zip` containing these)
- **Amiga**: `adf`, `ipf`, `dms`, `lha` (LhA)
- **DOS**: `zip`, `rar`, `7z`, `exe`, `com`, `img`, `iso`

*Strategy*: Prefer extension mapping; fallback to simple magic sniff for common disk images.

---

## 3) Title normalization rules (apply in order)
1. Replace separators: `[_.-]+` → space
2. Strip bracket groups:
   - Square/round: `\[(.*?)\]`, `\((.*?)\)` → remove if matches tags: language `(EN|DE|FR|ES|IT|RU)`, year `\(19\d{2}|20\d{2}\)`, scene flags `(cr|cracked|intro)`, quality `(proper|fixed)`, trainer `[t\d+]`, disk `\b(disk|diskette|disk\s?\d+|side\s?[ab])\b`, region `(US|EU|JP|NTSC|PAL)`
3. Remove release group suffixes: `-(FLT|SKIDROW|RELOADED|HOODLUM|CPY|FAIRLIGHT|PROPHET|CRACKER.*)$`
4. Collapse whitespace; trim
5. Title‑case with small‑word exceptions (`of`, `the`, `and`, `a`, `an`, `in`, `on`, `vs`, `for`)

*Examples*
- `IK+ (1987) [cr-FLT]` → `IK+`
- `Monkey_Island_Disk_1_of_4 (EN)` → `Monkey Island`

---

## 4) Multi‑disk/side grouping
- Detect patterns: `Disk\s?(\d+)`, `Side\s?([AB])`, `Disk\s?(\d+)\s?of\s?(\d+)`, `Part\s?(\d+)`
- Group files with same normalized title + platform into one Game
- Store per‑file human label (e.g., `Disk 1/4`, `Side A`) in `normalized_name` suffix

---

## 5) Confidence scoring (0..100)
- +50 exact normalized title match to existing Game (same platform)
- +25 checksum found again under same Game (duplicate file)
- +15 extension/format in platform allowlist
- +5  parent folder name agrees with normalized title
- −30 title becomes < 2 characters after stripping
- −25 conflicting duplicates (same checksum under different titles)
- Thresholds: `>=70` auto‑attach, `40..69` → **needs_review**, `<40` → **ignored** (unless forced by overrides)

---

## 6) Overrides YAML (admin‑curated)
File per platform: `overrides/{platform}.yaml`

```yaml
version: 1
mappings:
  - match:
      path_regex: "games/c64/.*/demos/.*"
    set:
      ignore: true
  - match:
      filename_regex: "^IK\+.*"
    set:
      title: "IK+"
      slug: "ik-plus"
aliases:
  - from: "International Karate Plus"
    to: "IK+"
  - from: "IK Plus"
    to: "IK+"
```

Rules:
- First match wins; later rules can refine
- `ignore: true` skips file creation
- `title` overrides the normalized title; `slug` optional

---

## 7) Worker flow
1. **Scan** directories recursively; for each file in allowlist, compute `sha1`, size, derive format
2. **Normalize** candidate title; detect disk/side labels
3. **Match**: try (a) checksum to existing File → Game; (b) title+platform to Game; (c) create Game
4. **Score** confidence; flag `needs_review` when below threshold
5. **Persist**: upsert Game/File; write IngestionArtifact (rulesetVersion `v1`)
6. **Idempotency**: duplicate checksums don’t create duplicates; last‑write‑wins for benign fields

---

## 8) External metadata (stubs for V2.1)
- **MobyGames** importer: pull titles/aliases/years per platform; store `mobygames_id` on Game; never overwrite user text
- **IGDB** importer: same pattern; store `igdb_id`
- **OpenRetro/FS‑UAE** adapter (optional): checksum → title mapping for Amiga; store `openretro_id`

---

## 9) CLI commands (agent tasks)
- `ingest scan --platform=c64 --root=games/c64` → prints stats, writes artifacts
- `ingest apply --platform=amiga` → upserts to DB
- `ingest rescore --since=24h` → re‑score artifacts after rules change
- `overrides validate` → lints YAML files

---

## 10) Minimal types (Go sketches)
```go
type ArtifactStatus string
const (
  StatusNew ArtifactStatus = "new"
  StatusMatched ArtifactStatus = "matched"
  StatusNeedsReview ArtifactStatus = "needs_review"
  StatusIgnored ArtifactStatus = "ignored"
)

type Artifact struct {
  Platform string
  Path string
  Checksum string
  Size int64
  DetectedTitle string
  DiskLabel string // e.g., "Disk 1/4", "Side A"
  Score int
  Status ArtifactStatus
  RulesetVersion string // "v1"
}
```

---

## 11) Tests & fixtures
- Place sample messy filenames under `/testdata/{c64,amiga,dos}`
- Golden tests for normalization & grouping; threshold tests for scoring
- E2E: run scanner on fixtures → expect N Games, M Files, K needs_review

---

## 12) Acceptance criteria (V1 ingestion)
- ≥85% of files yield **high‑confidence** titles (auto‑attach)
- ≥95% of files end up attached or flagged `needs_review` (≤5% ignored unintentionally)
- Idempotent re‑runs: no duplicate Games/Files by checksum/slug
- Overrides YAML successfully forces at least 3 tricky cases in fixtures

---

## 13) Test Fixtures (starter set)

### /testdata/c64
- `IK+ (1987) [cr-FLT].d64`
- `Last_Ninja_Side_A (EN).t64`
- `Last_Ninja_Side_B.t64`
- `Boulder-Dash_v2 (GER) [trainer].zip`

### /testdata/amiga
- `Monkey_Island_Disk_1_of_4 (EN).adf`
- `Monkey_Island_Disk_2_of_4.adf`
- `Lotus-Turbo-Challenge [cr].ipf`
- `WHDLoad_Pack (misc).lha`

### /testdata/dos
- `Prince_of_Persia_Disk1 (1990).img`
- `Prince_of_Persia_Disk2.img`
- `DOOM_v1.9_shareware.zip`
- `CommanderKeen4 (EN) - Apogee.zip`

**Expectations**
- Normalization collapses separators and strips tags → canonical titles
- Grouping attaches disk/side variants under one Game
- Confidence scoring pushes unclear cases to `needs_review`
