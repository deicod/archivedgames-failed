# Frontend Scaffold — Part 2: App Shell (Routes, Header, Auth, Layout)

This document covers the React 19 app shell: entrypoint, routes, header/footer, and auth wiring via `react-oidc-context`.

Repo path: `github.com/deicod/archivedgames` (frontend in `/web`).

---

## 1) Entrypoint — `web/src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RelayEnvironmentProvider } from 'react-relay';
import { environment } from './relay/environment';
import { OIDCProvider } from './oidc';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OIDCProvider>
      <RelayEnvironmentProvider environment={environment}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RelayEnvironmentProvider>
    </OIDCProvider>
  </React.StrictMode>
);
```

---

## 2) App & Header — `web/src/App.tsx`
```tsx
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PlatformList from './pages/PlatformList';
import GameDetail from './pages/GameDetail';
import { useAuth } from 'react-oidc-context';
import SupportButton from './components/SupportButton';

const Header: React.FC = () => {
  const auth = useAuth();
  const nav = useNavigate();
  return (
    <header className="border-b border-white/10 sticky top-0 bg-gray-950/80 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">ArchivedGames</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/platform/c64" className="hover:underline">C64</Link>
          <Link to="/platform/amiga" className="hover:underline">Amiga</Link>
          <Link to="/platform/dos" className="hover:underline">DOS</Link>
        </nav>
        <div className="flex-1" />
        <SupportButton />
        {auth.isAuthenticated ? (
          <button onClick={() => auth.signoutRedirect()} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Logout</button>
        ) : (
          <button onClick={() => auth.signinRedirect()} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Login</button>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/platform/:platform" element={<PlatformList />} />
        <Route path="/game/:slug" element={<GameDetail />} />
      </Routes>
    </main>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-white/60">© ArchivedGames</footer>
  </div>
);

export default App;
```

---

## 3) Relay compiler config — `web/relay.config.js`
```js
module.exports = {
  src: './src',
  schema: '../api/ent.graphql',
  language: 'typescript'
};
```

---

## 4) Token injection option for Relay (hook) — `web/src/relay/useAuthNetwork.ts`
```ts
import { Network, Observable } from 'relay-runtime';
import { useAuth } from 'react-oidc-context';

export function useAuthNetwork(){
  const auth = useAuth();
  return Network.create((params, variables) => {
    return Observable.create(sink => {
      (async () => {
        const user = await auth.getUser?.();
        try {
          const res = await fetch(import.meta.env.VITE_GRAPHQL_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(user?.access_token ? { Authorization: `Bearer ${user.access_token}` } : {})
            },
            body: JSON.stringify({ query: params.text, variables })
          });
          const json = await res.json();
          sink.next(json); sink.complete();
        } catch (e) { sink.error(e as Error); }
      })();
    });
  });
}
```

> If you want to use this, swap the environment’s network in `main.tsx` with `useAuthNetwork()` and wrap it in a component.
