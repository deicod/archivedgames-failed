import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RelayEnvironmentProvider } from 'react-relay';
import { environment } from './relay/environment';
import { OIDCProvider } from './oidc';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OIDCProvider>
      <RelayEnvironmentProvider environment={environment}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RelayEnvironmentProvider>
    </OIDCProvider>
  </React.StrictMode>
);
