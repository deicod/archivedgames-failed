import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function PlatformList(){
  const { platform } = useParams();
  // TODO: Relay query games(platform) with pagination
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 uppercase">{platform}</h1>
      <ul className="space-y-2">
        {/* Placeholder examples */}
        {['example-game-1','example-game-2'].map(slug => (
          <li key={slug}>
            <Link to={`/game/${slug}`} className="hover:underline">{slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
