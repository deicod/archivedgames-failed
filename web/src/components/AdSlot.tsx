import React from 'react';
export default function AdSlot({ name }: { name: string }){
  // TODO: render only after consent (CMP) and when ads.enabled=true from publicSiteConfig
  return <div data-ad-slot={name} className="min-h-12" />;
}
