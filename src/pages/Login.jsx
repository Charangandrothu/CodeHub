import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { signInWithEmailAndPassword, signInWithPopup, updatePassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import { createFirestoreUser, getUserDocument } from '../services/userService'
import pythonGlass from '../assets/pythonglass.png'
import javaGlass from '../assets/javaglass.png'

import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { currentUser, userData } = useAuth();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoginProcessing, setIsGoogleLoginProcessing] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [error, setError] = useState('')

  // Redirect if already logged in (and not currently processing a Google login which needs to run its own logic)
  useEffect(() => {
    if (currentUser && !isLoading && !isGoogleLoginProcessing) {
      if (userData?.profileCompleted && userData?.username) {
        navigate('/dashboard'); // Or landing page '/' if that's the desired dashboard
      } else if (userData && (!userData.profileCompleted || !userData.username)) {
        navigate('/complete-profile');
      }
    }
  }, [currentUser, userData, isLoading, isGoogleLoginProcessing, navigate]);

  // Mouse parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Transform values for icons (inverted movement for depth)
  const iconX = useTransform(springX, [-0.5, 0.5], [20, -20])
  const iconY = useTransform(springY, [-0.5, 0.5], [20, -20])

  // Transform for card (subtle movement)
  const cardX = useTransform(springX, [-0.5, 0.5], [5, -5])
  const cardY = useTransform(springY, [-0.5, 0.5], [5, -5])

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates to -0.5 to 0.5
      const { innerWidth, innerHeight } = window
      mouseX.set(e.clientX / innerWidth - 0.5)
      mouseY.set(e.clientY / innerHeight - 0.5)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const handleGoogleLogin = async () => {
    setIsGoogleLoginProcessing(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user; // This triggers AuthContext update -> currentUser set

      const { isNew, userData: newUserData } = await createFirestoreUser(user);

      if (isNew) {
        // Generate random password for new Google users
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let randomPassword = "";
        for (let i = 0; i < 16; i++) {
          randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        try {
          // Set the random password
          await updatePassword(user, randomPassword);
          // Update Firestore to reflect password exists
          await updateDoc(doc(db, "users", user.uid), { hasPassword: true });
        } catch (pwError) {
          console.error("Error setting initial random password:", pwError);
          // Don't block login if this fails, just log it
        }

        navigate('/complete-profile');
      } else if (!newUserData?.profileCompleted || !newUserData?.username) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Google Login Error:", error);

      // If user is actually authenticated (e.g. post-login script failed), don't show error
      if (auth.currentUser) {
        navigate('/dashboard');
      } else {
        setError("Failed to sign in with Google");
        setIsGoogleLoginProcessing(false);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      // 1. Check if user exists but hasn't set up password (i.e., Google only user)
      // Note: We can't easily check Firestore before Auth without custom claims or cloud functions safely.
      // So we try to login first.

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      // 2. Check Firestore Data
      const userData = await getUserDocument(user.uid);

      if (userData && !userData.profileCompleted) {
        navigate('/complete-profile');
        return;
      }

      // If they logged in with password but Firestore says they don't have one, update it.
      if (userData && !userData.hasPassword) {
        try {
          await updateDoc(doc(db, "users", user.uid), { hasPassword: true });
        } catch (err) {
          console.error("Failed to update hasPassword flag:", err);
        }
      }

      console.log('Login success:', user)
      setIsLoading(false)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Incorrect email or password')
      } else {
        setError('Failed to login. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 pt-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-emerald-900/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[350px] z-10 perspective-1000">

        {/* Floating Icons with Parallax - Enhanced Anti-Gravity */}
        <motion.div
          style={{ x: iconX, y: iconY }}
          className="absolute -top-12 -right-8 z-0 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ y: -35, scale: 1.15, transition: { duration: 0.3 } }}
            className="w-20 h-20 relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl" />
            <img src={javaGlass} alt="Java" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,100,100,0.4)]" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: useTransform(iconX, (v) => v * -1.2), y: useTransform(iconY, (v) => v * -1.2) }}
          className="absolute -bottom-8 -left-12 z-0 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            whileHover={{ y: -30, scale: 1.15, transition: { duration: 0.3 } }}
            className="w-24 h-24 relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl" />
            <img src={pythonGlass} alt="Python" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(50,150,255,0.4)]" />
          </motion.div>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ x: cardX, y: cardY }}
          className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 group/card"
        >
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 -z-10 rounded-3xl p-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 animate-[text_3s_ease-in-out_infinite]" />
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 rounded-3xl z-0 pointer-events-none ring-1 ring-inset ring-white/10" />
          <div className="absolute -inset-[1px] rounded-3xl z-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 mb-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">CodeHubx</span>
              </h1>
              <p className="text-gray-400 text-sm">Continue your structured placement preparation</p>
            </motion.div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 relative z-10">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field with Glow Effect */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md" />
                </div>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-white/20 focus-within:border-blue-500/50 focus-within:bg-white/10">
                  <div className="pl-4 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="name@gmail.com"
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-3 focus:ring-0 focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-md" />
                </div>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-white/20 focus-within:border-purple-500/50 focus-within:bg-white/10">
                  <div className="pl-4 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-3 focus:ring-0 focus:outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end"
            >
              <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </motion.div>

            {/* Login Button with Sweep Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                className="group relative w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer active:cursor-grabbing"
              >
                {/* Sweep Gradient */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />

                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="my-4 flex items-center gap-4"
          >
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </motion.div>

          {/* Google Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mb-4"
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-medium py-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Google</span>
            </button>
          </motion.div>

          {/* Social / Sign Up */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="text-white font-medium transition-all duration-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500 cursor-pointer relative z-20"
              >
                Continue with Google
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Add custom keyframe for sweep animation in a style tag since we can't easily add to tailwind config on the fly */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
    </section >
  )
}

export default Login