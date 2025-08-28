import React from 'react';
import { UserManager } from 'oidc-client-ts';
import { useAuth } from 'react-oidc-context';

const OidcSilent: React.FC = () => {
  const auth = useAuth();
  React.useEffect(() => {
    // Handle silent renew callback
    const mgr = new UserManager(auth.settings);
    mgr.signinSilentCallback().catch(() => {
      // ignore; oidc-client-ts will log internally
    });
  }, [auth.settings]);
  return <div />;
};

export default OidcSilent;

