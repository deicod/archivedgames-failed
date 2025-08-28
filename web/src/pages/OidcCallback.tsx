import React from 'react';
import { UserManager } from 'oidc-client-ts';
import { useAuth } from 'react-oidc-context';

const OidcCallback: React.FC = () => {
  const auth = useAuth();
  React.useEffect(() => {
    const mgr = new UserManager(auth.settings);
    mgr.signinRedirectCallback()
      .catch(() => {
        // ignore; handled by provider if already processed
      })
      .finally(() => {
        // clean URL and navigate home
        window.history.replaceState({}, document.title, '/');
      });
  }, [auth.settings]);
  return <div className="text-sm text-white/70">Signing in…</div>;
};

export default OidcCallback;

