import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useAuth } from 'react-oidc-context';

const Query = graphql`
  query AdminReports_Query($first: Int!, $offset: Int!, $subjectType: String) {
    reportsOpen(first: $first, offset: $offset, subjectType: $subjectType) { id subjectType subjectID reason note status }
    reportsOpenTotal(subjectType: $subjectType)
  }
`;

export default function AdminReports(){
  const auth = useAuth();
  const [offset, setOffset] = React.useState(0);
  const [type, setType] = React.useState<string>('');
  const pageSize = 50;
  const data = useLazyLoadQuery(Query, { first: pageSize, offset, subjectType: type||null } as any, { fetchPolicy: 'network-only' });
  const reports = (data as any)?.reportsOpen || [];
  const total = (data as any)?.reportsOpenTotal || 0;
  const start = total ? offset + 1 : 0;
  const end = Math.min(offset + pageSize, total);
  const hasPrev = offset > 0;
  const hasNext = offset + pageSize < total;

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [adminNote, setAdminNote] = React.useState('');
  const allSelected = reports.length > 0 && reports.every((r:any)=> selected[r.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    if (!allSelected) reports.forEach((r:any)=> next[r.id] = true);
    setSelected(next);
  };
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
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($id:String!,$s:ReportStatus!,$n:String){ setReportStatus(reportId:$id, status:$s, note:$n){ id status } }`, variables: { id: reportId, s: status, n: adminNote||null } }) });
    window.location.reload();
  };
  const bulkStatus = async (status: string) => {
    const ids = reports.filter((r:any)=> selected[r.id]).map((r:any)=> r.id);
    if (ids.length === 0) return;
    const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
    const token = localStorage.getItem('access_token');
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($ids:[String!]!,$s:ReportStatus!,$n:String){ setReportStatusBulk(reportIds:$ids, status:$s, note:$n){ id } }`, variables: { ids, s: status, n: adminNote||null } }) });
    window.location.reload();
  };
  const bulkQuarantine = async () => {
    const fileIds = reports.filter((r:any)=> selected[r.id] && r.subjectType==='file').map((r:any)=> r.subjectID);
    if (fileIds.length === 0) return;
    if (!window.confirm(`Quarantine ${fileIds.length} files?`)) return;
    const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
    const token = localStorage.getItem('access_token');
    for (const fid of fileIds) {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: `mutation($id:String!){ quarantineFile(fileId:$id, reason:"bulk") { id } }`, variables: { id: fid } }) });
    }
    window.location.reload();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports (Open)</h1>
      <div className="text-sm text-white/60">Viewer: {auth?.user?.profile?.preferred_username || 'anonymous'}</div>
      <div className="flex items-center gap-3 text-sm">
        <label>Filter:</label>
        <select value={type} onChange={e=>{setType(e.target.value); setOffset(0);}} className="bg-white/5 px-2 py-1 rounded">
          <option value="">All</option>
          <option value="file">file</option>
          <option value="game">game</option>
        </select>
        <div className="flex-1" />
        <label className="text-sm">Admin note:</label>
        <input value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="optional" className="bg-white/5 px-2 py-1 rounded text-sm w-64" />
        <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>bulkStatus('TRIAGED')}>Mark Triaged</button>
        <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>bulkStatus('REJECTED')}>Reject</button>
        <button className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30" onClick={bulkQuarantine}>Quarantine files</button>
      </div>
      <div className="text-sm text-white/60">{total ? `Showing ${start}–${end} of ${total}` : 'No reports'}</div>
      <table className="w-full text-sm mt-2">
        <thead><tr className="text-left"><th><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th><th>Type</th><th>Subject ID</th><th>Reason</th><th>Note</th><th>Action</th></tr></thead>
        <tbody>
          {reports.map((r:any)=> (
            <tr key={r.id} className="border-t border-white/10">
              <td><input type="checkbox" checked={!!selected[r.id]} onChange={e=> setSelected(s => ({...s, [r.id]: e.target.checked}))} /></td>
              <td>{r.subjectType}</td>
              <td className="font-mono truncate max-w-[24ch]">{r.subjectID}</td>
              <td>{r.reason}</td>
              <td className="text-white/60">{r.note||''}</td>
              <td className="space-x-2">
                {r.subjectType==='file' ? <button className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30" onClick={()=>quarantine(r.subjectID)}>Quarantine</button> : null}
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>setStatus(r.id,'TRIAGED')}>Triaged</button>
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>setStatus(r.id,'REJECTED')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-3">
        <button onClick={()=> setOffset(Math.max(0, offset-pageSize))} disabled={!hasPrev}>Prev</button>
        <button onClick={()=> setOffset(offset+pageSize)} disabled={!hasNext}>Next</button>
      </div>
    </div>
  );
}
