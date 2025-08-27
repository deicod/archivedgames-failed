# Monetization Addendum (Overview + V1)

This addendum is meant to be merged into:
- **Overview & Phase Plan** — new section "Monetization"
- **V1 MVP Plan & Backlog** — new backlog block and acceptance tweak

---

## Policy & Approach
- **V1**: Donations only (privacy‑friendly). Global Support button linking to external provider (PayPal/Ko‑fi/Stripe Checkout). No server‑side payments; no PII stored. Minimal UTM tracking allowed.
- **V2 (optional)**: Ads (feature‑flagged). Consent‑gated (EU) and non‑intrusive placements; provider adapters (AdSense/EthicalAds/custom). Scripts load only after CMP consent.

---

## Data Model & API (summary)
- `SiteSetting` (key/json/public) for runtime config.
- GraphQL:
  - Query: `publicSiteConfig: JSON!` (whitelisted public settings)
  - Mutation (admin): `setSiteSetting(key: String!, value: JSON!, public: Boolean!): Boolean!`

---

## V1 Backlog block (to insert under a new "K. Monetization" heading)
- [ ] K1: `SiteSetting` schema + migration (key/json/public)
- [ ] K2: GraphQL: `publicSiteConfig` (read) + `setSiteSetting` (admin write)
- [ ] K3: `<SupportButton/>` in header & GameDetail reading `donations.url`
- [ ] K4: Optional: add UTM to `donations.url`

---

## Acceptance Criteria addition (V1)
- A visible **Support** button appears sitewide and links to the configured donations URL.

---

## Notes
- If ads are enabled in V2, add CMP, `<AdSlot/>` components, and provider adapters; do not load third‑party scripts before consent.
