import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Code2, Trophy, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import pythonGlass from '../assets/pythonglass.png';
import javaGlass from '../assets/javaglass.png';

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

const TypingCode = () => {
  const codeLines = [
    { text: "class Solution {", color: "text-purple-400" },
    { text: "  solve(head) {", color: "text-yellow-200" },
    { text: "    if (!head) return null;", color: "text-zinc-500" },
    { text: "    let slow = head;", color: "text-blue-400" },
    { text: "    let fast = head;", color: "text-blue-400" },
    { text: "    while (fast && fast.next) {", color: "text-purple-400" },
    { text: "      slow = slow.next;", color: "text-zinc-300" },
    { text: "      fast = fast.next.next;", color: "text-zinc-300" },
    { text: "      if (slow === fast) return true;", color: "text-emerald-400" },
    { text: "    }", color: "text-zinc-300" },
    { text: "    return false;", color: "text-red-400" },
    { text: "  }", color: "text-yellow-200" },
    { text: "}", color: "text-purple-400" },
  ];

  const [displayedLineCount, setDisplayedLineCount] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedLineCount((prev) => {
        if (prev < codeLines.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Reset loop
  React.useEffect(() => {
    if (displayedLineCount >= codeLines.length) {
      const timeout = setTimeout(() => {
        setDisplayedLineCount(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [displayedLineCount]);

  return (
    <div className="flex flex-col gap-0.5 font-mono text-[13px]">
      {codeLines.slice(0, displayedLineCount).map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${line.color} whitespace-pre`}
        >
          {line.text}
        </motion.div>
      ))}
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="w-2 h-4 bg-blue-400 ml-1 inline-block align-middle"
      />
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
          {/* Main Dashboard Card */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-black overflow-hidden group border border-white/10"
          >
            {/* Pure Dark Glass Background - Deep Black */}
            <div className="absolute inset-0 bg-[#050505] opacity-95 z-0" />

            {/* Subtle Noise Texture */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 pointer-events-none" />

            {/* Animated Edge Highlight */}
            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-white/10 via-white/5 to-transparent z-[1] pointer-events-none" />
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm z-0 pointer-events-none"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
            />

            {/* Content - premium animated code type */}
            <div className="relative z-10 flex flex-col h-full min-h-[300px]">
              {/* Header - Editor Tabs */}
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 ">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-2">
                    <Code2 size={12} className="text-blue-400" />
                    <span className="text-[10px] font-mono text-gray-300">solver.js</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-gray-500 font-mono">Live</span>
                </div>
              </div>

              {/* Code Area */}
              <div className="font-mono text-sm leading-relaxed overflow-hidden flex-1 relative">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-6 text-zinc-700 text-xs text-right pr-2 select-none font-mono">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(n => <div key={n}>{n}</div>)}
                </div>

                {/* Typing Code */}
                <div className="pl-8 text-zinc-300">
                  <TypingCode />
                </div>
              </div>

              {/* Footer - Status */}
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-gray-400">All tests passed</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400">0.02ms</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Widget 1 - Top Left */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: [0, 15, 0], opacity: 1 }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-20 left-0 glass-card p-4 rounded-xl flex items-center gap-3 w-48 z-0"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Weekly Rank</p>
              <p className="text-white font-bold text-sm">Top 5%</p>
            </div>
          </motion.div>

          {/* Floating Widget 2 - Bottom Right - Dual Icon Swap */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: [0, -10, 0], opacity: 1 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-20 right-[-20px] w-60 h-60 rounded-3xl flex items-center justify-center z-20 cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-500"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icons Container */}
            <div className="relative w-full h-full overflow-visible">

              {/* Java Icon - Starts Top Right */}
              <motion.div
                className="absolute top-5 right-5 z-10"
                animate={{
                  x: isHovered ? -90 : 0,
                  y: isHovered ? 90 : 0,
                  scale: isHovered ? 1.2 : 1,
                  zIndex: isHovered ? 10 : 20,
                  filter: isHovered ? "drop-shadow(0px 0px 20px rgba(255,100,100,0.5))" : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Independent Floating Motion */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={javaGlass} alt="Java" className="w-28 h-28 object-contain drop-shadow-md" />
                </motion.div>
              </motion.div>

              {/* Python Icon - Starts Bottom Left */}
              <motion.div
                className="absolute bottom-5 left-5 z-20"
                animate={{
                  x: isHovered ? 90 : 0,
                  y: isHovered ? -90 : 0,
                  scale: isHovered ? 1.2 : 1,
                  zIndex: isHovered ? 20 : 10,
                  filter: isHovered ? "drop-shadow(0px 0px 20px rgba(50,150,255,0.5))" : "drop-shadow(0px 0px 0px rgba(0,0,0,0))"
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Independent Floating Motion */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
