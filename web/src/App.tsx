import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PlatformList from './pages/PlatformList';
import GameDetail from './pages/GameDetail';
import { useAuth, withAuthenticationRequired } from 'react-oidc-context';
import { Button } from '@/components/ui/button';
import SupportButton from './components/SupportButton';
import { isAdminFromToken } from './utils/jwt';
import AdminReports from './pages/AdminReports';
import OidcSilent from './pages/OidcSilent';
import OidcCallback from './pages/OidcCallback';

// Public site header
const Header: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const auth = useAuth();
  const nav = useNavigate();
  return (
    <header className="border-b border-white/10 sticky top-0 bg-gray-950/80 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">ArchivedGames</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/platform/c64" className="hover:underline">C64</Link>
          <Link to="/platform/amiga" className="hover:underline">Amiga</Link>
          <Link to="/platform/dos" className="hover:underline">DOS</Link>
          {auth.isAuthenticated && isAdmin && (
            <Link to="/admin/reports" className="hover:underline text-amber-300">Admin</Link>
          )}
        </nav>
        <div className="flex-1" />
        <SupportButton />
        {auth.isAuthenticated ? (
          <Button onClick={() => auth.signoutRedirect()}>Logout</Button>
        ) : (
          <Button onClick={() => auth.signinRedirect()}>Login</Button>
        )}
      </div>
    </header>
  );
};

// Admin header/layout (separate look & feel)
const AdminHeader: React.FC = () => {
  const auth = useAuth();
  return (
    <header className="border-b border-white/10 sticky top-0 bg-gray-950/90 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-sm text-white/70 hover:underline">← Back to site</Link>
        <div className="text-lg font-semibold text-amber-300">Admin Console</div>
        <nav className="flex items-center gap-3 text-sm ml-6">
          <Link to="/admin/reports" className="hover:underline">Reports</Link>
        </nav>
        <div className="flex-1" />
        {auth.isAuthenticated ? (
          <Button onClick={() => auth.signoutRedirect()}>Logout</Button>
        ) : null}
      </div>
    </header>
  );
};

const PublicLayout: React.FC<{ isAdmin: boolean, children: React.ReactNode }> = ({ isAdmin, children }) => (
  <div className="min-h-screen flex flex-col">
    <Header isAdmin={isAdmin} />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">{children}</main>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-white/60">© ArchivedGames</footer>
  </div>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <AdminHeader />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">{children}</main>
    <footer className="border-t border-white/10 py-4 text-center text-xs text-white/60">Admin Console</footer>
  </div>
);

const App: React.FC = () => {
  const auth = useAuth();
  const token = (auth?.user as any)?.access_token as string | undefined;
  const isAdmin = token ? isAdminFromToken(token) : false;
  const AdminProtected = withAuthenticationRequired(AdminReports);
  const AdminRoute: React.FC = () => (isAdmin ? <AdminProtected /> : <div>Not authorized</div>);
  return (
    <Routes>
      {/* Public layout */}
      <Route path="/" element={<PublicLayout isAdmin={isAdmin}><Home /></PublicLayout>} />
      <Route path="/platform/:platform" element={<PublicLayout isAdmin={isAdmin}><PlatformList /></PublicLayout>} />
      <Route path="/game/:slug" element={<PublicLayout isAdmin={isAdmin}><GameDetail /></PublicLayout>} />

      {/* Admin layout */}
      <Route path="/admin/reports" element={<AdminLayout><AdminRoute /></AdminLayout>} />

      {/* OIDC utility routes (no layout) */}
      <Route path="/oidc-silent" element={<OidcSilent />} />
      <Route path="/oidc-callback" element={<OidcCallback />} />
    </Routes>
)};

export default App;
