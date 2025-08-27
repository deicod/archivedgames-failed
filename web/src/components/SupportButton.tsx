import React from 'react';

export default function SupportButton(){
  const url = (import.meta.env.VITE_DONATIONS_URL || '').toString();
  if(!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm">
      Support
    </a>
  );
}
