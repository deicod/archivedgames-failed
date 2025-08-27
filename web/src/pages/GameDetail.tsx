import React from 'react';
import { useParams } from 'react-router-dom';

export default function GameDetail(){
  const { slug } = useParams();
  // TODO: Relay query game(slug) { images, files { sizeBytes, format } }
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="aspect-video bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-white/5 rounded-xl" />)}
        </div>
      </div>
      <aside className="space-y-4">
        <h1 className="text-2xl font-semibold break-words">{slug}</h1>
        <button className="w-full rounded-xl bg-white/10 py-2 hover:bg-white/20">Download</button>
        <div className="text-sm text-white/60">Formats and file list will appear here.</div>
      </aside>
    </div>
  );
}
