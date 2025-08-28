import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { Link, useSearchParams } from 'react-router';
import Seo from '@/components/Seo';

const Query = graphql`
  query Search_Query($q: String!, $platform: GamePlatform, $yearFrom: Int, $yearTo: Int, $format: String, $first: Int, $after: Cursor) {
    searchGames(q: $q, platform: $platform, yearFrom: $yearFrom, yearTo: $yearTo, format: $format, first: $first, after: $after) {
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
  const yearFrom = params.get('yearFrom');
  const yearTo = params.get('yearTo');
  const format = params.get('format') || '';
  const after = params.get('after');
  const vars:any = { q, platform: platEnum as any, yearFrom: yearFrom?parseInt(yearFrom):null, yearTo: yearTo?parseInt(yearTo):null, format: format||null, first: 20, after };
  const data = q ? useLazyLoadQuery(Query, vars, { fetchPolicy: 'network-only' }) : null as any;
  const [items, setItems] = React.useState<any[]>([]);
  React.useEffect(()=>{ setItems([]); }, [q, platform, yearFrom, yearTo, format]);
  React.useEffect(()=>{ if (data?.searchGames?.edges) setItems(prev => after ? [...prev, ...data.searchGames.edges] : data.searchGames.edges); }, [data?.searchGames?.edges]);
  const edges = items;
  const submit = (e: React.FormEvent) => { e.preventDefault(); const p:any = { q }; if (platEnum) p.platform = platEnum.toLowerCase(); if (yearFrom) p.yearFrom = yearFrom; if (yearTo) p.yearTo = yearTo; if (format) p.format = format; setParams(p); };
  return (
    <div>
      <Seo title={`Search — ${q || ''}`} canonicalPath={`/search?q=${encodeURIComponent(q||'')}`} />
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <form onSubmit={submit} className="flex gap-2 items-center mb-4 flex-wrap">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search titles" className="bg-white/5 px-3 py-2 rounded w-72" />
        <select defaultValue={platEnum||''} onChange={e=> setParams({ q, platform: e.target.value, yearFrom: yearFrom||'', yearTo: yearTo||'', format })} className="bg-white/5 px-2 py-2 rounded">
          <option value="">All platforms</option>
          <option value="c64">C64</option>
          <option value="amiga">Amiga</option>
          <option value="dos">DOS</option>
        </select>
        <input type="number" defaultValue={yearFrom||''} placeholder="Year from" className="bg-white/5 px-3 py-2 rounded w-28" onChange={e=> setParams({ q, platform: (platEnum||'').toLowerCase(), yearFrom: e.target.value, yearTo: yearTo||'', format })} />
        <input type="number" defaultValue={yearTo||''} placeholder="Year to" className="bg-white/5 px-3 py-2 rounded w-28" onChange={e=> setParams({ q, platform: (platEnum||'').toLowerCase(), yearFrom: yearFrom||'', yearTo: e.target.value, format })} />
        <input defaultValue={format} placeholder="Format (e.g., d64)" className="bg-white/5 px-3 py-2 rounded w-40" onChange={e=> setParams({ q, platform: (platEnum||'').toLowerCase(), yearFrom: yearFrom||'', yearTo: yearTo||'', format: e.target.value })} />
        <button type="submit" className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Search</button>
      </form>
      <ul className="space-y-2">
        {edges.map((e:any)=> (
          <li key={e.node.id}><Link to={`/game/${e.node.slug}`} className="hover:underline">{e.node.title}</Link> <span className="text-white/50 text-xs">({e.node.platform})</span></li>
        ))}
      </ul>
      {data?.searchGames?.pageInfo?.hasNextPage && (
        <div className="mt-4">
          <button onClick={()=> setParams({ q, platform: (platEnum||'').toLowerCase(), yearFrom: yearFrom||'', yearTo: yearTo||'', format, after: data.searchGames.pageInfo.endCursor })}>Load more</button>
        </div>
      )}
    </div>
  );
}
