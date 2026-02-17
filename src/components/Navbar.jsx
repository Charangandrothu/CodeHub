import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, LayoutDashboard, ChevronDown, Crown, Sparkles, Shield, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo_img from '../assets/logo_img.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const menuRef = useRef(null);

  const isProUser = userData?.isPro === true;

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() || 0;
    setHidden(latest > previous && latest > 120);
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinks = currentUser
    ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'DSA', path: '/dsa' },
      { name: 'Roadmap', path: '/roadmap' },
      { name: 'Mock Tests', path: '/mock-tests' },
      { name: 'Aptitude', path: '/aptitude' },
    ]
    : [
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/#features' },
      { name: 'Pricing', path: '/#pricing' },
      { name: 'About', path: '/about' },
      { name: 'Privacy', path: '/privacy-policy' },
    ];

  return (
    <motion.nav
      initial={{ y: -96 }}
      animate={{ y: hidden ? -112 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 ${location.pathname.startsWith('/problem/') ? 'hidden' : ''}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-app-border bg-app-panel/90 px-5 py-3 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <button onClick={() => navigate(currentUser ? '/dashboard' : '/')} className="flex items-center gap-3 cursor-pointer">
          <img src={logo_img} alt="CodeHubx Logo" className="h-9 w-9 rounded-xl object-cover" />
          <div className="text-left">
            <p className="text-base font-bold tracking-tight text-app-text">CodeHubx</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-app-muted">DSA Platform</p>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-app-primary-soft/50 border border-app-border">
          {navLinks.map((link) => {
            const isHash = link.path.includes('#');
            const hash = isHash ? link.path.split('#')[1] : null;
            const isActive = isHash ? location.pathname === '/' : location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => {
                  if (isHash) {
                    navigate('/');
                    setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 80);
                  } else {
                    navigate(link.path);
                  }
                }}
                className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-app-muted hover:text-app-text'}`}
              >
                {isActive && <motion.span layoutId="nav-active-pill" className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500" />}
                <span className="relative z-10">{link.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-app-border text-app-muted hover:text-app-text hover:bg-app-primary-soft transition-colors">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!currentUser ? (
            <Button onClick={() => navigate('/login')}>Get Started</Button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowProfileMenu((p) => !p)} className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-panel px-3 py-1.5 hover:bg-app-primary-soft transition-colors">
                <img
                  src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || 'User'}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="hidden sm:block max-w-24 truncate text-sm font-medium text-app-text">{userData?.displayName || 'User'}</span>
                <ChevronDown size={16} className="text-app-muted" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-3 w-60 soft-card p-2"
                  >
                    <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-app-muted hover:bg-app-primary-soft hover:text-app-text"><LayoutDashboard size={16} /> Dashboard</button>
                    <button onClick={() => navigate(userData?.profileCompleted ? `/${userData?.username}` : '/complete-profile')} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-app-muted hover:bg-app-primary-soft hover:text-app-text"><User size={16} /> Profile</button>
                    <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-app-muted hover:bg-app-primary-soft hover:text-app-text"><Settings size={16} /> Settings</button>
                    {userData?.role === 'admin' && <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-app-muted hover:bg-app-primary-soft hover:text-app-text"><Shield size={16} /> Admin</button>}
                    {!isProUser && <button onClick={() => navigate('/pricing')} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-amber-500 hover:bg-amber-500/10"><Sparkles size={16} /> Upgrade <Crown size={16} /></button>}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"><LogOut size={16} /> Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
