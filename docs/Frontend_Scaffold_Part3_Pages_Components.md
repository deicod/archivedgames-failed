# Frontend Scaffold — Part 3: Pages & Components

Skeleton pages and reusable components (Support button, Ad slot) for ArchivedGames.

---

## 1) Pages

### `web/src/pages/Home.tsx`
```tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[['c64','Commodore 64'],['amiga','Amiga'],['dos','MS-DOS']].map(([k,v]) => (
        <Link key={k} to={`/platform/${k}`} className="rounded-2xl p-6 bg-white/5 hover:bg-white/10">
          <div className="text-2xl font-semibold">{v}</div>
          <div className="text-white/60 text-sm mt-2">Browse games</div>
        </Link>
      ))}
    </div>
  );
}
```

### `web/src/pages/PlatformList.tsx`
```tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PlatformList(){
  const { platform } = useParams();
  // TODO: Relay query games(platform) with pagination
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 uppercase">{platform}</h1>
      <ul className="space-y-2">
        {/* Placeholder examples */}
        {['example-game-1','example-game-2'].map(slug => (
          <li key={slug}>
            <Link to={`/game/${slug}`} className="hover:underline">{slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### `web/src/pages/GameDetail.tsx`
```tsx
import React from 'react';
import { useParams } from 'react-router-dom';

export default function GameDetail(){
  const { slug } = useParams();
  // TODO: Relay query game(slug) { images, files { sizeBytes, format } }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="aspect-video bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-white/5 rounded-xl" />)}
        </div>
      </div>
      <aside className="space-y-4">
        <h1 className="text-2xl font-semibold break-words">{slug}</h1>
        <button className="w-full rounded-xl bg-white/10 py-2 hover:bg-white/20">Download</button>
        <div className="text-sm text-white/60">Formats and file list will appear here.</div>
      </aside>
    </div>
  );
}
```

---

## 2) Components

### `web/src/components/SupportButton.tsx`
```tsx
import React from 'react';

export default function SupportButton(){
  const url = (import.meta.env.VITE_DONATIONS_URL || '').toString();
  if(!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm">
      Support
    </a>
  );
}
```

### `web/src/components/AdSlot.tsx` (V2 placeholder)
```tsx
import React from 'react';
export default function AdSlot({ name }: { name: string }){
  // TODO: render only after consent (CMP) and when ads.enabled=true from publicSiteConfig
  return <div data-ad-slot={name} className="min-h-12" />;
}
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

## 4) Token injection snippet (optional)

**`web/src/relay/useAuthNetwork.ts`**
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

> Swap into your environment if you prefer auth-managed fetches instead of reading from `localStorage`.
