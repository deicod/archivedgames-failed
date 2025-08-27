import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PlatformList from './pages/PlatformList';
import GameDetail from './pages/GameDetail';
import { useAuth } from 'react-oidc-context';
import SupportButton from './components/SupportButton';
import AdminReports from './pages/AdminReports';

const Header: React.FC = () => {
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

const App: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/platform/:platform" element={<PlatformList />} />
        <Route path="/game/:slug" element={<GameDetail />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </main>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-white/60">© ArchivedGames</footer>
  </div>
);

export default App;
