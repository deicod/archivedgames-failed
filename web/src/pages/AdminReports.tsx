import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useAuth } from 'react-oidc-context';

const Query = graphql`
  query AdminReports_Query($first: Int!, $offset: Int!, $subjectType: String) {
    reportsOpen(first: $first, offset: $offset, subjectType: $subjectType) { id subjectType subjectID reason note status }
  }
`;

export default function AdminReports(){
  const auth = useAuth();
  const [offset, setOffset] = React.useState(0);
  const [type, setType] = React.useState<string>('');
  const data = useLazyLoadQuery(Query, { first: 50, offset, subjectType: type||null } as any, { fetchPolicy: 'network-only' });
  const reports = (data as any)?.reportsOpen || [];
  const quarantine = async (fileId: string) => {
    if (!window.confirm('Quarantine this file?')) return;
    const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
    const token = localStorage.getItem('access_token');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($id:String!){ quarantineFile(fileId:$id, reason:"admin") { id } }`, variables: { id: fileId } }) });
    if (res.ok) window.location.reload();
  };
  const setStatus = async (reportId: string, status: string) => {
    const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
    const token = localStorage.getItem('access_token');
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($id:String!,$s:ReportStatus!){ setReportStatus(reportId:$id, status:$s){ id status } }`, variables: { id: reportId, s: status } }) });
    window.location.reload();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports (Open)</h1>
      <div className="text-sm text-white/60">Viewer: {auth?.user?.profile?.preferred_username || 'anonymous'}</div>
      <div className="flex items-center gap-2 text-sm">
        <label>Filter:</label>
        <select value={type} onChange={e=>{setType(e.target.value); setOffset(0);}} className="bg-white/5 px-2 py-1 rounded">
          <option value="">All</option>
          <option value="file">file</option>
          <option value="game">game</option>
        </select>
      </div>
      <table className="w-full text-sm mt-2">
        <thead><tr className="text-left"><th>Type</th><th>Subject ID</th><th>Reason</th><th>Note</th><th>Action</th></tr></thead>
        <tbody>
          {reports.map((r:any)=> (
            <tr key={r.id} className="border-t border-white/10">
              <td>{r.subjectType}</td>
              <td className="font-mono truncate max-w-[24ch]">{r.subjectID}</td>
              <td>{r.reason}</td>
              <td className="text-white/60">{r.note||''}</td>
              <td className="space-x-2">
                {r.subjectType==='file' ? <button onClick={()=>quarantine(r.subjectID)} className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30">Quarantine</button> : null}
                <button onClick={()=>setStatus(r.id,'TRIAGED')} className="px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30">Triaged</button>
                <button onClick={()=>setStatus(r.id,'REJECTED')} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-3">
        <button onClick={()=> setOffset(Math.max(0, offset-50))} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">Prev</button>
        <button onClick={()=> setOffset(offset+50)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">Next</button>
      </div>
    </div>
  );
}
