import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { Button } from '@/components/ui/button';
import { graphql, useLazyLoadQuery } from 'react-relay';

const Query = graphql`
  query PlatformList_Query($platform: GamePlatform!, $first: Int!, $after: Cursor) {
    games(where: { platform: $platform }, first: $first, after: $after) {
      edges { cursor node { id slug title } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export default function PlatformList(){
  const { platform } = useParams();
  const plat = (platform || '').toUpperCase();
  const [after, setAfter] = React.useState<string | null>(null);
  const data = useLazyLoadQuery(Query, { platform: plat as any, first: 20, after } as any, { fetchPolicy: 'network-only' });
  const conn: any = (data as any).games;
  const loadMore = () => { if (conn.pageInfo.hasNextPage) setAfter(conn.pageInfo.endCursor as any); };
  return (
    <div>
      <Seo title={`ArchivedGames — ${plat}`} canonicalPath={`/platform/${(platform||'').toLowerCase()}`} />
      <h1 className="text-2xl font-bold mb-4 uppercase">{plat}</h1>
      <ul className="space-y-2">
        {conn.edges?.map((e: any) => (
          <li key={e.node.id}>
            <Link to={`/game/${e.node.slug}`} className="hover:underline">{e.node.title}</Link>
          </li>
        ))}
      </ul>
      {conn.pageInfo.hasNextPage && (
        <Button onClick={loadMore} className="mt-4">Load more</Button>
      )}
    </div>
  );
}
