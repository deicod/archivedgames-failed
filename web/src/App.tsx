import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router';
import Home from './pages/Home';
import PlatformList from './pages/PlatformList';
import GameDetail from './pages/GameDetail';
import SearchPage from './pages/Search';
import { useAuth, withAuthenticationRequired } from 'react-oidc-context';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import SupportButton from './components/SupportButton';
import { isAdminFromToken } from './utils/jwt';
import AdminReports from './pages/AdminReports';
import OidcSilent from './pages/OidcSilent';
import OidcCallback from './pages/OidcCallback';


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
      <Route path="/search" element={<PublicLayout isAdmin={isAdmin}><SearchPage /></PublicLayout>} />

      {/* Admin layout */}
      <Route path="/admin/reports" element={<AdminLayout><AdminRoute /></AdminLayout>} />

      {/* OIDC utility routes (no layout) */}
      <Route path="/oidc-silent" element={<OidcSilent />} />
      <Route path="/oidc-callback" element={<OidcCallback />} />
    </Routes>
)};

export default App;
