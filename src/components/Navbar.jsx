import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            C
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            CodeHub
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors cursor-pointer active:cursor-grabbing">
              Home
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-white/5 hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                    >
                      <div className="relative">
                        {/* Blur background effect */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl pointer-events-none" />

                        <div className="relative z-10">
                          {/* User Header */}
                          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : (currentUser.email ? currentUser.email[0].toUpperCase() : 'U')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {currentUser.displayName || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate font-mono">
                                  {currentUser.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2 space-y-1">
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors group">
                              <User size={16} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                              My Profile
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors group">
                              <LayoutDashboard size={16} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                              Dashboard
                            </button>
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors group">
                              <Settings size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                              Settings
                            </button>
                          </div>

                          {/* Footer / Logout */}
                          <div className="p-2 border-t border-white/5 bg-red-500/[0.02]">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
                            >
                              <LogOut size={16} className="text-red-500/50 group-hover:text-red-400 transition-colors" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors cursor-pointer active:cursor-grabbing"
                >
                  Login
                </button>
                <Button onClick={() => navigate('/Signup')} variant="primary" className="!py-2 !px-5 text-sm shadow-blue-500/25">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
