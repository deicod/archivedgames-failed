# Frontend Scaffold — Part 1: Setup (React 19, Vite, Relay, Tailwind, OIDC)

Covers package setup, Vite/Tailwind config, Relay environment, OIDC provider, and example `.env.local`.

Repo path assumed: **github.com/deicod/archivedgames** with frontend at `/web`.

---

## 1) package.json — `web/package.json`
```json
{
  "name": "archivedgames-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "relay-compiler && vite build",
    "preview": "vite preview",
    "relay": "relay-compiler --schema ../api/ent.graphql --src ./src"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.25.1",
    "react-relay": "^16.2.0",
    "relay-runtime": "^16.2.0",
    "react-oidc-context": "^2.1.0",
    "ky": "^1.2.4"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.1",
    "relay-compiler": "^16.2.0",
    "babel-plugin-relay": "^16.2.0"
  }
}
```

---

## 2) Vite & Tailwind (v4)
Tailwind CSS v4 simplifies setup — no config file is required for basic usage. Define your sources in CSS using `@source` and import Tailwind with a single statement.

**`web/postcss.config.js`**
```js
export default { plugins: { '@tailwindcss/postcss': {}, autoprefixer: {} } }
```

**`web/src/index.css`**
```css
@import "tailwindcss";
@source "./index.html";
@source "./src/**/*.{ts,tsx}";
```

**`web/index.html`**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ArchivedGames</title>
  <link rel="icon" href="/favicon.ico" />
</head>
<body class="min-h-screen bg-gray-950 text-gray-100">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**`web/vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ babel: { plugins: ['babel-plugin-relay'] } })]
})
```

---

## 3) Relay Environment — `web/src/relay/environment.ts`
```ts
import { Environment, Network, RecordSource, Store, FetchFunction } from 'relay-runtime';

const fetchGraphQL: FetchFunction = async (params, variables) => {
  const token = window.localStorage.getItem('access_token');
  const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query: params.text, variables })
  });
  return await res.json();
};

export const environment = new Environment({
  network: Network.create(fetchGraphQL),
  store: new Store(new RecordSource())
});
```

---

## 4) OIDC Provider — `web/src/oidc.tsx`
```tsx
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import React from 'react';

const oidcConfig: AuthProviderProps['client'] = {
  authority: import.meta.env.VITE_OIDC_ISSUER, // https://auth.icod.de/realms/archivedgames
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID, // web-spa
  redirect_uri: window.location.origin + '/',
  post_logout_redirect_uri: window.location.origin + '/',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
};

export const OIDCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider authority={oidcConfig.authority} client_id={oidcConfig.client_id}
    redirect_uri={oidcConfig.redirect_uri} post_logout_redirect_uri={oidcConfig.post_logout_redirect_uri}
    response_type={oidcConfig.response_type} scope={oidcConfig.scope} automaticSilentRenew={oidcConfig.automaticSilentRenew}>
    {children}
  </AuthProvider>
);
```

---

## 5) `.env.local` (example for web)
```
VITE_GRAPHQL_URL=http://localhost:8080/query
VITE_OIDC_ISSUER=https://auth.icod.de/realms/archivedgames
VITE_OIDC_CLIENT_ID=web-spa
VITE_DONATIONS_URL=https://ko-fi.com/yourhandle
```
