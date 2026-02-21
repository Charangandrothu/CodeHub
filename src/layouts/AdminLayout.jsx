import React from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FileText,
    Layers,
    Settings,
    LogOut,
    ArrowLeft,
    Megaphone
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end={to === '/admin'}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive
                ? 'bg-gradient-to-r from-blue-600/20 to-blue-400/10 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}
        `}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const AdminLayout = () => {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    // While purely client-side check is not enough for security (Backend verifies requests),
    // we do a quick check here for UX.
    if (!currentUser || (userData && userData.role !== 'admin')) {
        // If data is still loading, maybe wait?
        // But if userData is present and role is not admin, redirect.
        if (userData && userData.role !== 'admin') {
            return <Navigate to="/unauthorized" replace />;
        }
        // If no user execution flow should have been handled by ProtectedRoute, but double check
    }

    const handleLogout = async () => {
        try {
            navigate('/');
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#222] bg-[#0f0f0f]/50 backdrop-blur-xl fixed h-full z-50">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="font-bold text-white">A</span>
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">Admin Panel</span>
                    </div>

                    <nav className="space-y-2">
                        <SidebarItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem to="/admin/users" icon={Users} label="Users" />
                        <SidebarItem to="/admin/payments" icon={CreditCard} label="Payments" />
                        <SidebarItem to="/admin/problems" icon={FileText} label="Problems" />
                        <SidebarItem to="/admin/categories" icon={Layers} label="Categories" />
                        <SidebarItem to="/admin/announcements" icon={Megaphone} label="Announcements" />
                        <SidebarItem to="/admin/settings" icon={Settings} label="Settings" />
                    </nav>
                </div>

                <div className="absolute bottom-6 left-0 w-full px-6 space-y-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to App</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
