import React from 'react';
import { useParams } from 'react-router';
import { graphql, useLazyLoadQuery } from 'react-relay';
import ImageUploader from '../components/ImageUploader';
import Seo from '../components/Seo';
import { useAuth } from 'react-oidc-context';
import { useMutation, graphql as relayGraphql } from 'react-relay';
import ReportDialog from '../components/ReportDialog';

const Query = graphql`
  query GameDetail_Query($slug: String!) {
    games(first: 1, where: { slug: $slug }) {
      edges {
        node {
          id slug title year publisher platform
          images(first: 4) { edges { node { id s3Key width height kind } } }
          files(first: 50) { edges { node { id originalName sizeBytes format } } }
          comments(first: 50) { edges { node { id userID contentSanitized createdAt editedAt deletedAt } } }
        }
      }
    }
  }
`;

const AddCommentMutation = relayGraphql`
  mutation GameDetail_AddComment_Mutation($t: String!, $id: String!, $content: String!, $lang: String) {
    addComment(subjectType: $t, subjectId: $id, content: $content, language: $lang) { id }
  }
`;


// Report handled via modal dialog

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


async function setCover(imageId: string){
  const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
  const token = window.localStorage.getItem('access_token');
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query: `mutation($id:String!){ setCoverImage(imageId:$id){ id } }`, variables: { id: imageId } })
  });
  window.location.reload();
}

async function deleteImg(imageId: string){
  if(!window.confirm('Delete this image?')) return;
  const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
  const token = window.localStorage.getItem('access_token');
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ query: `mutation($id:String!){ deleteImage(imageId:$id) }`, variables: { id: imageId } })
  });
  window.location.reload();
}

export default function GameDetail(){
  const { slug } = useParams();
  const auth = useAuth();
  const data = useLazyLoadQuery(Query, { slug } as any, { fetchPolicy: 'network-only' });
  const node = (data as any)?.games?.edges?.[0]?.node;
  if (!node) return <div>Not found</div>;
  const images = node.images.edges?.map((e: any) => e.node) || [];
  const files = node.files.edges?.map((e: any) => e.node) || [];
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportId, setReportId] = React.useState<string | null>(null);
  const comments = (node.comments?.edges || []).map((e:any)=> e.node);
  const [commentText, setCommentText] = React.useState('');
  const [commitAddComment, isAdding] = useMutation(AddCommentMutation as any);
  const onAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commitAddComment({
      variables: { t: 'game', id: node.id, content: commentText, lang: 'en' },
      onCompleted: () => { setCommentText(''); window.location.reload(); },
    });
  };
  const origin = (typeof window !== 'undefined') ? window.location.origin : '';
  const canonical = `/game/${node.slug}`;
  const platform = (node.platform || '').toString();
  const coverUrl = images[0] ? `${origin}/img/${images[0].id}?w=512` : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: node.title,
    url: origin + canonical,
    ...(coverUrl ? { image: coverUrl } : {}),
    ...(node.publisher ? { publisher: { '@type': 'Organization', name: node.publisher } } : {}),
    ...(node.year ? { datePublished: String(node.year) } : {}),
    ...(platform ? { gamePlatform: platform } : {}),
    // Breadcrumb as a separate graph item
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
          { '@type': 'ListItem', position: 2, name: platform || 'Platform', item: origin + '/platform/' + (platform || '').toLowerCase() },
          { '@type': 'ListItem', position: 3, name: node.title, item: origin + canonical }
        ]
      }
    ]
  };
  return (
    <>
    <div className="grid md:grid-cols-3 gap-6">
      <Seo title={`ArchivedGames — ${node.title}`} canonicalPath={canonical} jsonLd={jsonLd} />
      <div className="md:col-span-2 space-y-4">
        <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center">{images[0] ? <img src={`/img/${images[0].id}?w=512`} alt="cover" className="w-full h-full object-cover rounded-2xl"/> : null}</div>
        <div className="grid grid-cols-2 gap-3">
          {images.slice(1).map((img:any)=> (
          <div key={img.id} className="aspect-[4/3] bg-white/5 rounded-xl overflow-hidden relative group">
              <img src={`/img/${img.id}?w=512`} alt="gallery" className="w-full h-full object-cover"/>
              {auth?.isAuthenticated && (
                <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>setCover(img.id)} className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20">Set cover</button>
                  <button onClick={()=>deleteImg(img.id)} className="px-2 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/30">Delete</button>
                </div>
              )}
            </div>
        ))}
        </div>
      </div>
      <aside className="space-y-4">
        <h1 className="text-2xl font-semibold break-words">{node.title}</h1>
        {(node.publisher || node.year) && (
          <div className="text-sm text-gray-300 space-x-2">
            {node.publisher && <span>Publisher: <span className="text-gray-100">{node.publisher}</span></span>}
            {node.year && <span>Year: <span className="text-gray-100">{node.year}</span></span>}
          </div>
        )}
        <div className="space-y-2">
          {files.map((f:any)=> (
            <div key={f.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="truncate">{f.originalName}</div>
              <a href={`/d/${f.id}`} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Download</a>
                <button onClick={()=>{ setReportId(f.id); setReportOpen(true); }} className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30">Report</button>
              </div>
          ))}
        </div>
          {auth?.isAuthenticated ? <div className="space-y-3">
            <ImageUploader gameId={node.id} kind="COVER" allowMultiple={false} />
            <ImageUploader gameId={node.id} kind="GALLERY" allowMultiple={true} />
          </div> : null}

        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Comments</h2>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {comments.length === 0 && <div className="text-sm text-white/60">No comments yet.</div>}
            {comments.map((c:any)=> (
              <div key={c.id} className="text-sm border-b border-white/10 pb-2">
                <div className="text-white/80" dangerouslySetInnerHTML={{ __html: c.contentSanitized }} />
                <div className="text-xs text-white/50 mt-1">by {c.userId} • {new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          {auth?.isAuthenticated ? (
            <form onSubmit={onAddComment} className="space-y-2">
              <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={3} placeholder="Add a comment"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <button type="submit" disabled={isAdding || !commentText.trim()} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50">Post comment</button>
            </form>
          ) : (
            <div className="text-sm text-white/60">Login to comment.</div>
          )}
        </div>
      </aside>
    </div>
    <ReportDialog open={reportOpen} onClose={()=>setReportOpen(false)} subjectType="file" subjectId={reportId} />
    </>
  );
}
