import React from 'react';
import { Link } from 'react-router';
import { useAuth } from 'react-oidc-context';
import SupportButton from '@/components/SupportButton';
import { Button } from '@/components/ui/button';

const PublicHeader: React.FC<{ isAdmin: boolean }>=({ isAdmin }) => {
  const auth = useAuth();
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

export const PublicLayout: React.FC<{ isAdmin: boolean; children: React.ReactNode }>=({ isAdmin, children }) => (
  <div className="min-h-screen flex flex-col">
    <PublicHeader isAdmin={isAdmin} />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">{children}</main>
    <footer className="border-t border-white/10 py-6 text-center text-xs text-white/60">© ArchivedGames</footer>
  </div>
);

export default PublicLayout;

