import React from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  subjectType: 'file' | 'game';
  subjectId: string | null;
  onClose: () => void;
};

const REASONS = [
  'Copyright infringement',
  'Malware or virus',
  'Broken or incorrect file',
  'Offensive content',
  'Other',
];

export default function ReportDialog({ open, subjectType, subjectId, onClose }: Props) {
  const [reason, setReason] = React.useState(REASONS[0]);
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(()=>{ if(open){ setReason(REASONS[0]); setNote(''); setError(null); setBusy(false);} }, [open]);

  if (!open) return null;
  const submit = async () => {
    if (!subjectId) return;
    setBusy(true); setError(null);
    try {
      const url = (import.meta as any).env.VITE_GRAPHQL_URL as string;
      const token = localStorage.getItem('access_token');
      const q = `mutation Report($t:String!,$id:String!,$r:String!,$n:String){ reportContent(subjectType:$t, subjectId:$id, reason:$r, note:$n){ id } }`;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token?{ Authorization:`Bearer ${token}` }: {}) }, body: JSON.stringify({ query: q, variables: { t: subjectType, id: subjectId, r: reason, n: note || null } }) });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors?.[0]?.message || 'Report failed');
      onClose();
      alert('Thanks for your report.');
    } catch (e:any) {
      setError(e?.message || 'Failed to submit report');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => !busy && onClose()} />
      <div className="relative bg-gray-900 text-gray-100 w-full max-w-md rounded-xl border border-white/10 p-4 shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Report content</h2>
        <div className="space-y-3">
          <label className="block text-sm">Reason</label>
          <select value={reason} onChange={e=>setReason(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm">
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label className="block text-sm">Additional details (optional)</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm" placeholder="Add any helpful details" />
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => !busy && onClose()}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !subjectId}>{busy ? 'Sending…' : 'Submit report'}</Button>
        </div>
      </div>
    </div>
  );
}

