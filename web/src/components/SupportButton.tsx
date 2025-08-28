import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const Query = graphql`
  query SupportButton_PublicConfig_Query {
    publicSiteConfig
  }
`;

export default function SupportButton(){
  let donationsUrl = (import.meta.env.VITE_DONATIONS_URL || '').toString();
  try {
    const data = useLazyLoadQuery(Query, {} as any);
    const cfg: any = (data as any)?.publicSiteConfig ?? null;
    const url = cfg?.donations?.url as string | undefined;
    if (url) donationsUrl = url;
  } catch {}
  if(!donationsUrl) return null;
  return (
    <a href={donationsUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm">Support</a>
  );
}
