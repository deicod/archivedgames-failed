import React from 'react';
import { useParams } from 'react-router-dom';
import { graphql, useLazyLoadQuery } from 'react-relay';
import ImageUploader from '../components/ImageUploader';
import { useAuth } from 'react-oidc-context';

const Query = graphql`
  query GameDetail_Query($slug: String!) {
    games(first: 1, where: { slug: $slug }) {
      edges {
        node {
          id slug title
          images(first: 4) { edges { node { id s3Key width height kind } } }
          files(first: 50) { edges { node { id originalName sizeBytes format } } }
        }
      }
    }
  }
`;


async function reportFile(fileId: string){
  const reason = window.prompt('Reason for report? (e.g., copyright)')||'';
  if(!reason) return;
  const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
  const token = localStorage.getItem('access_token');
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($t:String!,$id:String!,$r:String!){ reportContent(subjectType:$t, subjectId:$id, reason:$r){ id } }`, variables: { t: 'file', id: fileId, r: reason } }) });
  alert('Reported');
}

async function requestDownload(fileId: string){
  const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
  const token = window.localStorage.getItem('access_token');
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query: `query($id:String!){ getDownloadURL(fileId:$id) }`, variables: { id: fileId } })
  });
  const json = await res.json();
  const signed = json?.data?.getDownloadURL as string | undefined;
  if (signed) window.location.href = signed;
}

export default function GameDetail(){
  const { slug } = useParams();
  const auth = useAuth();
  const data = useLazyLoadQuery(Query, { slug } as any, { fetchPolicy: 'network-only' });
  const node = (data as any)?.games?.edges?.[0]?.node;
  if (!node) return <div>Not found</div>;
  const images = node.images.edges?.map((e: any) => e.node) || [];
  const files = node.files.edges?.map((e: any) => e.node) || [];
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center">{images[0] ? <img src={"/s3/"+images[0].s3Key} alt="cover" className="w-full h-full object-cover rounded-2xl"/> : null}</div>
        <div className="grid grid-cols-2 gap-3">
          {images.slice(1).map((img:any)=> <div key={img.id} className="aspect-[4/3] bg-white/5 rounded-xl" />)}
        </div>
      </div>
      <aside className="space-y-4">
        <h1 className="text-2xl font-semibold break-words">{node.title}</h1>
        <div className="space-y-2">
          {files.map((f:any)=> (
            <div key={f.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="truncate">{f.originalName}</div>
              <a href={`/d/${f.id}`} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Download</a>
                <button onClick={()=>reportFile(f.id)} className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30">Report</button>
              </div>
          ))}
        </div>
          {auth?.isAuthenticated ? <ImageUploader gameId={node.id} /> : null}
      </aside>
    </div>
  );
}
