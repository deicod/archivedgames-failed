import React from 'react';
import { Link } from 'react-router';
import { useAuth } from 'react-oidc-context';
import { Button } from '@/components/ui/button';

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

export const AdminLayout: React.FC<{ children: React.ReactNode }>=({ children }) => (
  <div className="min-h-screen flex flex-col">
    <AdminHeader />
    <main className="flex-1 max-w-6xl mx-auto px-4 py-6">{children}</main>
    <footer className="border-t border-white/10 py-4 text-center text-xs text-white/60">Admin Console</footer>
  </div>
);

export default AdminLayout;

