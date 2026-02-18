import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* UI Components */
import { Button } from './ui/Button';

/* Context */
import { useAuth } from '../context/AuthContext';

/* Icons */
import { LogOut, User, Settings, LayoutDashboard, ChevronDown, Crown, Sparkles, Shield } from 'lucide-react';

/* Animations */
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

/* Assets */
import logo_img from '../assets/logo_img.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth(); // Added userData
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const menuRef = useRef(null);

  // Determine if user is Pro
  const isProUser = userData?.isPro === true;

  useEffect(() => {
    const handleScrollSpy = () => {
      if (location.pathname !== '/') return;

      const sections = ['home', 'features', 'pricing'];
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      navigate('/');
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = currentUser ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'DSA', path: '/dsa' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Mock Tests', path: '/mock-tests' },
    { name: 'Aptitude', path: '/aptitude' },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'About', path: '/about' },
    { name: 'Privacy', path: '/privacy-policy' },
  ];

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: -100 },
      }}
      initial="hidden"
      animate={hidden ? "hidden" : "visible"}
      exit="hidden"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 sm:px-6 py-4 ${location.pathname.startsWith('/problem/') ? 'hidden' : ''}`}
    >
      {/* Glassmorphism Container */}
      <div className="relative w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl shadow-lg shadow-black/20 overflow-visible">

        {/* Shimmer/Reflection Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              // Hierarchical Navigation Logic
              if (location.pathname === '/dashboard') {
                // Should go "back" to Landing Page
                navigate('/');
              } else if (currentUser && location.pathname !== '/') {
                // If on any other internal page (DSA, etc.), go to Dashboard
                navigate('/dashboard');
              } else {
                // Determine scrolling or standard home nav
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }
            }}
          >
            <img
              src={logo_img}
              alt="CodeHubx Logo"
              className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 object-cover"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
              CodeHubx
            </span>
          </div>

          {/* Center Navigation - Desktop */}
          <div
            className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navLinks.map((link, index) => {
              let isActive = false;
              if (currentUser) {
                isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              } else {
                if (location.pathname === '/') {
                  if (link.path === '/') isActive = activeSection === 'home';
                  else if (link.path.includes('#')) {
                    const sectionId = link.path.split('#')[1];
                    isActive = activeSection === sectionId;
                  }
                } else {
                  const isHashLink = link.path.includes('#');
                  isActive = isHashLink
                    ? location.hash === link.path.substring(link.path.indexOf('#'))
                    : location.pathname === link.path && location.hash === '';
                }
              }

              return (
                <button
                  key={link.name}
                  onClick={() => {
                    if (link.path === '/') {
                      if (location.pathname === '/') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        navigate(link.path);
                      }
                    } else if (link.path.startsWith('/#')) {
                      const id = link.path.substring(2);
                      const element = document.getElementById(id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/');
                        setTimeout(() => {
                          const element = document.getElementById(id);
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    } else {
                      navigate(link.path);
                    }
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {/* Hover Effect */}
                  {hoveredIndex === index && !isActive && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full bg-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  {/* Active State */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* UPGRADE TO PRO BADGE */}
            {currentUser && !isProUser && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/pricing')}
                className="relative hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] group overflow-hidden cursor-pointer"
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-12 blur-sm"
                />

                {/* Glow Pulse */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-amber-500/5"
                />

                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-semibold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent group-hover:text-yellow-300 transition-colors">
                  Upgrade to Pro
                </span>
                <Crown size={14} className="text-amber-400 fill-amber-400/20" />
              </motion.button>
            )}

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 group"
                >
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#0a0a0a] group-hover:ring-purple-500/50 transition-all overflow-hidden">
                    <img
                      src={userData?.photoURL || currentUser.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser.email?.split('@')[0] || 'User'}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser.email?.split('@')[0] || 'User'}`;
                      }}
                    />
                    {/* Pro Indicator Helper on Avatar */}
                    {isProUser && (
                      <div className="absolute inset-0 border-2 border-amber-400/50 rounded-full" />
                    )}
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
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl shadow-black/50 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate max-w-[150px]">{currentUser.displayName || 'User'}</p>
                          {isProUser && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <Crown size={10} className="fill-amber-400/50" /> PRO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <MenuLink
                          icon={User}
                          label="My Profile"
                          onClick={() => {
                            if (!userData?.username || !userData?.profileCompleted) {
                              setShowProfileMenu(false);
                              navigate('/complete-profile');
                              return;
                            }
                            setShowProfileMenu(false);
                            navigate(`/${userData.username}`);
                          }}
                        />
                        <MenuLink
                          icon={LayoutDashboard}
                          label="Dashboard"
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/dashboard');
                          }}
                        />
                        <MenuLink
                          icon={Settings}
                          label="Settings"
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/settings');
                          }}
                        />
                        {userData?.role === 'admin' && (
                          <div className="pt-2 border-t border-white/5 space-y-1">
                            <MenuLink
                              icon={Shield}
                              label="Admin Panel"
                              onClick={() => {
                                setShowProfileMenu(false);
                                navigate('/admin');
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="relative overflow-hidden !bg-white !text-black !border-0 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-shadow duration-300 group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Login</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const MenuLink = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors group"
  >
    <Icon size={16} className="text-gray-500 group-hover:text-white transition-colors" />
    {label}
  </button>
);

export default Navbar;
