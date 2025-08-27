import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[['c64','Commodore 64'],['amiga','Amiga'],['dos','MS-DOS']].map(([k,v]) => (
        <Link key={k} to={`/platform/${k}`} className="rounded-2xl p-6 bg-white/5 hover:bg-white/10">
          <div className="text-2xl font-semibold">{v}</div>
          <div className="text-white/60 text-sm mt-2">Browse games</div>
        </Link>
      ))}
    </div>
  );
}
