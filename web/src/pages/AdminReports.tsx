import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useAuth } from 'react-oidc-context';

const Query = graphql`
  query AdminReports_Query($first: Int!) {
    reportsOpen(first: $first) { id subjectType subjectID reason note status }
  }
`;

export default function AdminReports(){
  const auth = useAuth();
  const data = useLazyLoadQuery(Query, { first: 50 } as any, { fetchPolicy: 'network-only' });
  const reports = (data as any)?.reportsOpen || [];
  const quarantine = async (fileId: string) => {
    if (!window.confirm('Quarantine this file?')) return;
    const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
    const token = localStorage.getItem('access_token');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($id:String!){ quarantineFile(fileId:$id, reason:"admin") { id } }`, variables: { id: fileId } }) });
    if (res.ok) window.location.reload();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports (Open)</h1>
      <div className="text-sm text-white/60">Viewer: {auth?.user?.profile?.preferred_username || 'anonymous'}</div>
      <table className="w-full text-sm">
        <thead><tr className="text-left"><th>Type</th><th>Subject ID</th><th>Reason</th><th>Note</th><th>Action</th></tr></thead>
        <tbody>
          {reports.map((r:any)=> (
            <tr key={r.id} className="border-t border-white/10">
              <td>{r.subjectType}</td>
              <td className="font-mono truncate max-w-[24ch]">{r.subjectID}</td>
              <td>{r.reason}</td>
              <td className="text-white/60">{r.note||''}</td>
              <td>
                {r.subjectType==='file' ? <button onClick={()=>quarantine(r.subjectID)} className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30">Quarantine</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
