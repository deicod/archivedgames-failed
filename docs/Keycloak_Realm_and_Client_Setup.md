# Keycloak Realm & Client Setup (archivedgames)

Target: **auth.icod.de** realm `archivedgames` with SPA client `web-spa`.

---

## 1) Realm
- Name: `archivedgames`
- Login settings: Registration OFF (optional for V1), Email as username ON (optional)
- Themes: default

---

## 2) Client: `web-spa` (Public SPA)
- Type: **OpenID Connect**
- Access type: **Public** (PKCE required)
- Root URL: `https://archivedgames.com`
- Valid redirect URIs:
  - `https://archivedgames.com/*`
  - `http://localhost:5173/*`
- Web origins:
  - `https://archivedgames.com`
  - `http://localhost:5173`
- Advanced:
  - **Proof Key for Code Exchange (PKCE)**: Required
  - Standard Flow (Authorization Code): **ON**
  - Implicit Flow: **OFF**
  - Direct Access Grants (password): **OFF**
  - Refresh token rotation: **ON** (Recommended)
  - Access Token lifespan: 5m; Refresh Token lifespan: 30m (tune later)

---

## 3) Client Scopes
- Default: `openid`, `profile`, `email`
- Optional: `roles`

### Protocol Mappers
- **realm roles → `roles` (array)**
  - Mapper type: User Realm Role
  - Token Claim Name: `roles`
  - Add to Access Token: **ON**
  - Multivalued: **ON**
- **preferred_username**
  - Built-in; ensure included in ID token & access token

---

## 4) Roles
- Realm roles: `user`, `moderator`, `admin`
- Admin can assign via Keycloak UI

---

## 5) CORS & Security
- CORS handled by API/edge; still set **Web Origins** above
- Enforce HTTPS (realm requirement)
- Set Content-Security-Policy on SPA to allow Keycloak domain

---

## 6) Local Dev
- Add an additional Web Origin & Redirect URI for `http://localhost:5173/*`
- For Preview envs, add their hostnames

---

## 7) App config
- Frontend env:
```
VITE_OIDC_ISSUER=https://auth.icod.de/realms/archivedgames
VITE_OIDC_CLIENT_ID=web-spa
```
- Backend will validate JWTs with issuer `https://auth.icod.de/realms/archivedgames`

---

## 8) Optional: Service Client for admin tools
- Create confidential client `archivedgames-admin` with client credentials for backoffice tasks (not needed for V1)
