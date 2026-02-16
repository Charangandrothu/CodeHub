import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Code2, Trophy } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import pythonGlass from '../assets/pythonglass.png';
import javaGlass from '../assets/javaglass.png';
import AntiGravityParticles from './AntiGravityParticles';

// Anti-gravity animation constants
const HOVER_SCALE = 1.3;
const HOVER_SCALE_ENHANCED = 1.4;
const JAVA_GLOW_COLOR = 'rgba(255,100,100,0.6)';
const PYTHON_GLOW_COLOR = 'rgba(50,150,255,0.6)';

const ProgressRow = ({ label, current, total, color = "blue" }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-4 last:mb-0 group">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{label}</span>
        <span className="text-gray-500 font-mono group-hover:text-gray-400 transition-colors">{current} / {total}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className={`h-full rounded-full ${color === 'blue' ? 'bg-blue-500' :
            color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'
            }`}
        />
      </div>
    </div>
  );
};

const Hero = () => {
  const { currentUser } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleStartPreparing = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleExplore = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };


  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 sm:px-6 lg:px-8">
      {/* Anti-Gravity Particles */}
      <AntiGravityParticles />
      
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[100px]" />
      </div>

      <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Start Your Journey</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6"
          >
            Structured <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Placement Prep
            </span>
          </motion.h1>

          <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
            Master Coding, Aptitude, and Core CS through a structured learn-practice-test system with clear progress tracking and real-world projects.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" icon={ArrowRight} onClick={handleStartPreparing}>
              Start Preparing for Free
            </Button>
            <Button variant="secondary" onClick={handleExplore}>
              Explore Platform
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>DSA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mock Tests</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Aptitude and reasoning</span>
            </div>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block h-[600px] w-full"
        >
          {/* Main Dashboard Card - Enhanced Anti-Gravity */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ y: -35, transition: { duration: 0.4 } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl shadow-black/50 pulse-glow hover:shadow-purple-500/30"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">DSA Progress</h3>
                  <p className="text-xs text-gray-500">Daily Streak: 12 Days</p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
                Premium
              </div>
            </div>

            <div className="space-y-1">
              <ProgressRow label="Arrays & Hashing" current={30} total={30} color="blue" />
              <ProgressRow label="Binary Search" current={8} total={15} color="purple" />
              <ProgressRow label="Dynamic Programming" current={6} total={12} color="emerald" />
              <ProgressRow label="Graphs" current={3} total={25} color="blue" />
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gray-800 flex items-center justify-center text-[10px] text-white">
                    U{i}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-gray-900 flex items-center justify-center text-[10px] text-gray-400">
                  +42
                </div>
              </div>
              <p className="text-xs text-gray-500">Students Active Now</p>
            </div>
          </motion.div>

          {/* Floating Widget 1 - Top Left - Anti-Gravity */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: [0, -20, 0], opacity: 1 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            whileHover={{ y: -30, scale: 1.05, transition: { duration: 0.3 } }}
            className="absolute top-20 left-0 glass-card p-4 rounded-xl flex items-center gap-3 w-48 z-0 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Weekly Rank</p>
              <p className="text-white font-bold text-sm">Top 5%</p>
            </div>
          </motion.div>

          {/* Floating Widget 2 - Bottom Right - Dual Icon Swap - Enhanced Anti-Gravity */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: [0, -20, 0], opacity: 1 }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            whileHover={{ y: -40, transition: { duration: 0.4 } }}
            className="absolute bottom-20 right-[-20px] w-60 h-60 rounded-3xl flex items-center justify-center z-20 cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/20 transition-shadow duration-500"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icons Container */}
            <div className="relative w-full h-full overflow-visible">

              {/* Java Icon - Starts Top Right - Enhanced Anti-Gravity */}
              <motion.div
                className="absolute top-5 right-5 z-10"
                animate={{
                  x: isHovered ? -90 : 0,
                  y: isHovered ? 90 : 0,
                  scale: isHovered ? HOVER_SCALE : 1,
                  zIndex: isHovered ? 10 : 20,
                  filter: isHovered ? `drop-shadow(0 0 25px ${JAVA_GLOW_COLOR})` : "drop-shadow(0 0 0 rgba(0,0,0,0))"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                whileHover={{ scale: HOVER_SCALE_ENHANCED, rotate: 10 }}
              >
                {/* Independent Anti-Gravity Floating Motion */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={javaGlass} alt="Java" className="w-28 h-28 object-contain drop-shadow-md" />
                </motion.div>
              </motion.div>

              {/* Python Icon - Starts Bottom Left - Enhanced Anti-Gravity */}
              <motion.div
                className="absolute bottom-5 left-5 z-20"
                animate={{
                  x: isHovered ? 90 : 0,
                  y: isHovered ? -90 : 0,
                  scale: isHovered ? HOVER_SCALE : 1,
                  zIndex: isHovered ? 20 : 10,
                  filter: isHovered ? `drop-shadow(0 0 25px ${PYTHON_GLOW_COLOR})` : "drop-shadow(0 0 0 rgba(0,0,0,0))"
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                whileHover={{ scale: HOVER_SCALE_ENHANCED, rotate: -10 }}
              >
                {/* Independent Anti-Gravity Floating Motion */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <img src={pythonGlass} alt="Python" className="w-28 h-28 object-contain drop-shadow-md" />
                </motion.div>
              </motion.div>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
