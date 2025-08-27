import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import React from 'react';

const oidcConfig: AuthProviderProps['client'] = {
  authority: import.meta.env.VITE_OIDC_ISSUER,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: window.location.origin + '/',
  post_logout_redirect_uri: window.location.origin + '/',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
};

export const OIDCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider authority={oidcConfig.authority} client_id={oidcConfig.client_id}
    redirect_uri={oidcConfig.redirect_uri} post_logout_redirect_uri={oidcConfig.post_logout_redirect_uri}
    response_type={oidcConfig.response_type} scope={oidcConfig.scope} automaticSilentRenew={oidcConfig.automaticSilentRenew}>
    {children}
  </AuthProvider>
);
