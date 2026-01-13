import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import pythonGlass from '../assets/pythonglass.png'
import javaGlass from '../assets/javaglass.png'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

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

  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login delay
    setTimeout(() => {
      console.log('Login attempt:', { email, password })
      setIsLoading(false)
      navigate('/')
    }, 1500)
  }
  const handleSignup = () => {
    navigate('/Signup');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 pt-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-emerald-900/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-[400px] z-10 perspective-1000">

        {/* Floating Icons with Parallax */}
        <motion.div
          style={{ x: iconX, y: iconY }}
          className="absolute -top-12 -right-8 z-0 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 relative"
          >
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl" />
            <img src={javaGlass} alt="Java" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: useTransform(iconX, (v) => v * -1.2), y: useTransform(iconY, (v) => v * -1.2) }}
          className="absolute -bottom-8 -left-12 z-0 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-24 h-24 relative"
          >
            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl" />
            <img src={pythonGlass} alt="Python" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </motion.div>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ x: cardX, y: cardY }}
          className="relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80"
        >
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 rounded-3xl z-0 pointer-events-none ring-1 ring-inset ring-white/10" />
          <div className="absolute -inset-[1px] rounded-3xl z-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">CodeHub</span>
              </h1>
              <p className="text-gray-400 text-sm">Continue your structured placement preparation</p>
            </motion.div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-3.5 focus:ring-0 focus:outline-none text-sm"
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
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-3.5 focus:ring-0 focus:outline-none text-sm"
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
              <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
                Forgot password?
              </a>
            </motion.div>

            {/* Login Button with Sweep Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="button"
                onClick={handleLogin}
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
            className="my-8 flex items-center gap-4"
          >
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-gray-500 text-xs uppercase tracking-wider">Or</span>
            <div className="h-px bg-white/10 flex-1" />
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
                onClick={handleSignup} className="text-white font-medium transition-all duration-200 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-500">
                Sign up now
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
    </section>
  )
}

export default Login