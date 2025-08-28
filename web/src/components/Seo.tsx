import React from 'react';

type SeoProps = {
  title?: string;
  canonicalPath?: string; // e.g. "/game/slug"; if absolute, used as-is
  jsonLd?: any; // object serialized into application/ld+json
};

export const Seo: React.FC<SeoProps> = ({ title, canonicalPath, jsonLd }) => {
  React.useEffect(() => {
    if (title) document.title = title;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalHref = canonicalPath
      ? canonicalPath.startsWith('http')
        ? canonicalPath
        : origin + canonicalPath
      : undefined;

    // canonical
    const existing = document.querySelector('link[rel="canonical"][data-managed="seo"]');
    if (canonicalHref) {
      let link = existing as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        link.setAttribute('data-managed', 'seo');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalHref);
    } else if (existing) {
      existing.parentElement?.removeChild(existing);
    }

    // JSON-LD
    const existingJson = document.querySelector('script[type="application/ld+json"][data-managed="seo-jsonld"]');
    if (jsonLd) {
      let script = existingJson as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-managed', 'seo-jsonld');
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    } else if (existingJson) {
      existingJson.parentElement?.removeChild(existingJson);
    }

    return () => {
      // Do not remove on unmount to avoid flicker during route transitions.
    };
  }, [title, canonicalPath, jsonLd]);

  return null;
};

export default Seo;

