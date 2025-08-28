import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PlatformList from './pages/PlatformList';
import GameDetail from './pages/GameDetail';
import { useAuth, withAuthenticationRequired } from 'react-oidc-context';
import SupportButton from './components/SupportButton';
import { isAdminFromToken } from './utils/jwt';
import AdminReports from './pages/AdminReports';
import OidcSilent from './pages/OidcSilent';
import OidcCallback from './pages/OidcCallback';

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
          <button onClick={() => auth.signoutRedirect()} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Logout</button>
        ) : (
          <button onClick={() => auth.signinRedirect()} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Login</button>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const auth = useAuth();
  const token = (auth?.user as any)?.access_token as string | undefined;
  const isAdmin = token ? isAdminFromToken(token) : false;
  const AdminProtected = withAuthenticationRequired(AdminReports);
  const AdminRoute: React.FC = () => (isAdmin ? <AdminProtected /> : <div>Not authorized</div>);
  return (
  <div className="min-h-screen flex flex-col">
    <Header isAdmin={isAdmin} />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/platform/:platform" element={<PlatformList />} />
        <Route path="/game/:slug" element={<GameDetail />} />
        <Route path="/admin/reports" element={<AdminRoute />} />
        <Route path="/oidc-silent" element={<OidcSilent />} />
        <Route path="/oidc-callback" element={<OidcCallback />} />
      </Routes>
    </main>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-white/60">© ArchivedGames</footer>
  </div>
)};

export default App;
