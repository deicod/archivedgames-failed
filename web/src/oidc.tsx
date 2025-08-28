import { AuthProvider, AuthProviderProps, useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { WebStorageStateStore } from 'oidc-client-ts';
import React from 'react';

const oidcConfig: AuthProviderProps['client'] = {
  authority: import.meta.env.VITE_OIDC_ISSUER,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin + '/',
  silent_redirect_uri: window.location.origin + '/oidc-silent',
  post_logout_redirect_uri: window.location.origin + '/',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const OIDCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider
    authority={oidcConfig.authority}
    client_id={oidcConfig.client_id}
    redirect_uri={oidcConfig.redirect_uri}
    silent_redirect_uri={oidcConfig.silent_redirect_uri}
    post_logout_redirect_uri={oidcConfig.post_logout_redirect_uri}
    response_type={oidcConfig.response_type}
    scope={oidcConfig.scope}
    automaticSilentRenew={oidcConfig.automaticSilentRenew}
    userStore={oidcConfig.userStore}
    onSigninCallback={() => {
      // remove code/state from URL after redirect
      window.history.replaceState({}, document.title, window.location.pathname);
    }}
  >
    <TokenSync />
    {children}
  </AuthProvider>
);


const TokenSync: React.FC = () => {
  const auth = useAuth();
  useEffect(() => {
    const token = (auth?.user as any)?.access_token as string | undefined;
    if (token) localStorage.setItem('access_token', token);
    else localStorage.removeItem('access_token');
  }, [auth.user]);
  return null;
};
