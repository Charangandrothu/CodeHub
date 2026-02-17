import React from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, FileText, Layers, Settings, LogOut, ArrowLeft } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === '/admin'}
    className={({ isActive }) => `
      relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200
      ${isActive
        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_16px_30px_-18px_rgba(59,130,246,0.9)]'
        : 'text-app-muted hover:bg-app-primary-soft hover:text-app-text'
      }
    `}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </NavLink>
);

const AdminLayout = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser || (userData && userData.role !== 'admin')) {
    if (userData && userData.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex">
      <aside className="fixed left-0 top-0 z-50 h-full w-72 border-r border-app-border bg-app-panel p-6 backdrop-blur-xl">
        <div className="mb-8 rounded-2xl border border-app-border bg-app-panel-strong p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-app-muted">Control Center</p>
          <h1 className="text-xl font-bold text-app-text">Admin Panel</h1>
        </div>

        <nav className="space-y-2">
          <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/admin/users" icon={Users} label="Users" />
          <SidebarItem to="/admin/payments" icon={CreditCard} label="Payments" />
          <SidebarItem to="/admin/problems" icon={FileText} label="Problems" />
          <SidebarItem to="/admin/categories" icon={Layers} label="Categories" />
          <SidebarItem to="/admin/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full rounded-2xl border border-app-border px-4 py-3 text-sm font-medium text-app-muted hover:bg-app-primary-soft hover:text-app-text flex items-center gap-2">
            <ArrowLeft size={16} /> Back to App
          </button>
          <button onClick={handleLogout} className="w-full rounded-2xl border border-rose-400/30 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 p-8 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
