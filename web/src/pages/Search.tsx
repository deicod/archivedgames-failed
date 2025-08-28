import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link, useSearchParams } from 'react-router';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';

const Query = graphql`
  query Search_Query($q: String!, $platform: GamePlatform, $first: Int) {
    searchGames(q: $q, platform: $platform, first: $first) {
      edges { node { id slug title platform } }
      pageInfo { hasNextPage endCursor }
      totalCount
    }
  }
`;

export default function SearchPage(){
  const [params, setParams] = useSearchParams();
  const [q, setQ] = React.useState(params.get('q') || '');
  const platform = (params.get('platform') || '').toUpperCase();
  const platEnum = platform === 'C64' || platform === 'AMIGA' || platform === 'DOS' ? platform : null;
  const data = q ? useLazyLoadQuery(Query, { q, platform: platEnum as any, first: 50 } as any, { fetchPolicy: 'network-only' }) : null as any;
  const edges = data?.searchGames?.edges || [];
  const submit = (e: React.FormEvent) => { e.preventDefault(); const p:any = { q }; if (platEnum) p.platform = platEnum.toLowerCase(); setParams(p); };
  return (
    <div>
      <Seo title={`Search — ${q || ''}`} canonicalPath={`/search?q=${encodeURIComponent(q||'')}`} />
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <form onSubmit={submit} className="flex gap-2 items-center mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search titles" className="bg-white/5 px-3 py-2 rounded w-72" />
        <select defaultValue={platEnum||''} onChange={e=> setParams({ q, platform: e.target.value })} className="bg-white/5 px-2 py-2 rounded">
          <option value="">All platforms</option>
          <option value="c64">C64</option>
          <option value="amiga">Amiga</option>
          <option value="dos">DOS</option>
        </select>
        <Button type="submit">Search</Button>
      </form>
      <ul className="space-y-2">
        {edges.map((e:any)=> (
          <li key={e.node.id}><Link to={`/game/${e.node.slug}`} className="hover:underline">{e.node.title}</Link> <span className="text-white/50 text-xs">({e.node.platform})</span></li>
        ))}
      </ul>
    </div>
  );
}

