import React from 'react';
import { graphql, useMutation } from 'react-relay';

const Create = graphql`
  mutation ImageUploader_Create_Mutation($gameId: String!, $kind: ImageKind!, $count: Int!) {
    createImageUploads(gameId: $gameId, kind: $kind, count: $count) { key url }
  }
`;

const Finalize = graphql`
  mutation ImageUploader_Finalize_Mutation($gameId: String!, $kind: ImageKind!, $items: [UploadedImageInput!]!) {
    finalizeImageUploads(gameId: $gameId, kind: $kind, items: $items) { id s3Key }
  }
`;

export default function ImageUploader({ gameId }: { gameId: string }){
  const [commitCreate] = useMutation(Create);
  const [commitFinalize] = useMutation(Finalize);
  const [busy, setBusy] = React.useState(false);
  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const presigned = await new Promise<any[]>((resolve, reject) => {
        commitCreate({
          variables: { gameId, kind: 'GALLERY', count: files.length },
          onCompleted: (resp:any) => resolve(resp.createImageUploads || []),
          onError: reject,
        });
      });
      const uploads: any[] = [];
      for (let i=0;i<files.length;i++){
        const f = files[i]; const ps = presigned[i];
        if (!ps) break;
        await fetch(ps.url, { method: 'PUT', headers: { 'Content-Type': f.type||'application/octet-stream' }, body: f });
        uploads.push({ key: ps.key, width: 0, height: 0 });
      }
      await new Promise((resolve, reject) => {
        commitFinalize({ variables: { gameId, kind: 'GALLERY', items: uploads }, onCompleted: resolve as any, onError: reject });
      });
      alert('Uploaded');
      e.target.value = '';
    } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      <label className="text-sm">Upload images</label>
      <input type="file" multiple accept="image/*" onChange={onFiles} disabled={busy} />
    </div>
  );
}
