import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Play, ArrowRight, Sparkles, Trophy,
  Brain, MessageSquare, Shield, Zap, ChevronRight, Users,
  Building2, Timer, Volume2, TrendingUp, AlertCircle,
  FileText, Upload, CheckCircle2, History, ArrowUpRight,
  TrendingDown, UserCheck, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── CountUp Animation Component ─────────────────────────────────────────────

const CountUp = ({ to, duration = 1.5, suffix = '', delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(to, 10);
    if (isNaN(end)) return;

    const delayTimeout = setTimeout(() => {
      const startTime = performance.now();

      const update = (now) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        
        setCount(Math.floor(start + easeProgress * (end - start)));

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(update);
    }, delay * 1000);

    return () => clearTimeout(delayTimeout);
  }, [to, duration, delay]);

  return <span>{count}{suffix}</span>;
};

// ─── Floating Particles Component ─────────────────────────────────────────────

const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -10,
      opacity: Math.random() * 0.2 + 0.05,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [p.opacity, p.opacity * 2.2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ─── Custom SVG Weekly Analytics Trend ──────────────────────────────────────

const WeeklyPerformanceChart = () => {
  const points = "0,80 40,65 80,72 120,40 160,55 200,20 240,45 280,15 320,30 360,10";
  const areaPath = "M0,80 L40,65 L80,72 L120,40 L160,55 L200,20 L240,45 L280,15 L320,30 L360,10 L360,100 L0,100 Z";
  
  return (
    <div className="w-full relative h-[140px] mt-4">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 360 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGrad)" />
        <motion.polyline
          points={points}
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />
        {/* Animated points */}
        <circle cx="200" cy="20" r="5" className="fill-indigo-400 stroke-[#050508]" strokeWidth="2" />
        <circle cx="280" cy="15" r="5" className="fill-indigo-400 stroke-[#050508]" strokeWidth="2" />
        <circle cx="360" cy="10" r="5" className="fill-indigo-400 stroke-[#050508]" strokeWidth="2" />
      </svg>
      {/* Chart grid indicators */}
      <div className="absolute top-0 right-0 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
        <TrendingUp size={8} className="text-emerald-400" /> +14.2% pacing
      </div>
    </div>
  );
};

// ─── Circular Progress Gauge ─────────────────────────────────────────────────

const CircularProgress = ({ value, size = 180, strokeWidth = 12, color = '#6366f1', label = 'Readiness Index' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse-slow pointer-events-none" />
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'cubicBezier(0.16, 1, 0.3, 1)' }}
          fill="none"
          style={{ filter: `drop-shadow(0 0 10px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold text-white tracking-tighter">
          <CountUp to={value} suffix="%" />
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  { id: 'hr', label: 'HR Interview', icon: Users, description: 'Behavioral & behavioral questions' },
  { id: 'technical', label: 'Technical', icon: Brain, description: 'Core CS concepts & system design basics' },
  { id: 'dsa', label: 'DSA', icon: Zap, description: 'Algorithms & data structures coding' },
  { id: 'system-design', label: 'System Design', icon: Building2, description: 'Scalability & architectural design' },
  { id: 'mixed', label: 'Mixed Round', icon: Sparkles, description: 'Combined tech & HR challenge' },
];

const DIFFICULTIES = [
  { id: 'beginner', label: 'Beginner', color: 'emerald', description: 'Entry-level foundation' },
  { id: 'intermediate', label: 'Intermediate', color: 'amber', description: 'Standard industry level' },
  { id: 'advanced', label: 'Advanced', color: 'rose', description: 'Senior engineering challenge' },
];

const DURATIONS = [
  { id: 10, label: '10 min', desc: 'Short check' },
  { id: 20, label: '20 min', desc: 'Standard round' },
  { id: 30, label: '30 min', desc: 'Deep dive' },
];

const COMPANIES = [
  { id: 'tcs', label: 'TCS', color: '#1A73E8' },
  { id: 'infosys', label: 'Infosys', color: '#007CC3' },
  { id: 'accenture', label: 'Accenture', color: '#A100FF' },
  { id: 'amazon', label: 'Amazon', color: '#FF9900' },
  { id: 'google', label: 'Google', color: '#4285F4' },
  { id: 'microsoft', label: 'Microsoft', color: '#00A4EF' },
];

// ─── Main Dashboard Redesign ─────────────────────────────────────────────────

export default function InterviewDashboard() {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const fileInputRef = useRef(null);

  // Setup states
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(20);
  const [company, setCompany] = useState(null);

  // Resume states
  const [resumeScore, setResumeScore] = useState(72);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeName, setResumeName] = useState(null);

  // Load previous interviews
  const [previousInterviews, setPreviousInterviews] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('codehub-interview-history') || '[]');
      setPreviousInterviews(stored);
    } catch { setPreviousInterviews([]); }
  }, []);

  // Compute stats
  const readiness = useMemo(() => {
    if (previousInterviews.length === 0) {
      return { overall: 78, technical: 75, communication: 82, confidence: 80, problemSolving: 72 };
    }
    const scores = previousInterviews.map(i => i.averageScore || 70);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return {
      overall: avg,
      technical: Math.min(100, avg + 2),
      communication: Math.min(100, avg + 5),
      confidence: Math.min(100, avg - 1),
      problemSolving: Math.min(100, avg + 1),
    };
  }, [previousInterviews]);

  const displayInterviews = useMemo(() => {
    if (previousInterviews.length > 0) return previousInterviews;
    return [
      { id: 'sess-1', name: 'Technical Round · DSA & Logic', date: '2 days ago', averageScore: 85, totalAnswers: 5, duration: '20m', status: 'Hired' },
      { id: 'sess-2', name: 'HR Interview · Behavioral Pacing', date: '5 days ago', averageScore: 78, totalAnswers: 4, duration: '10m', status: 'Hired' },
      { id: 'sess-3', name: 'System Design · Basics Scale', date: '1 week ago', averageScore: 72, totalAnswers: 5, duration: '20m', status: 'Needs Improvement' },
      { id: 'sess-4', name: 'Mixed Round · General Tech', date: '2 weeks ago', averageScore: 88, totalAnswers: 5, duration: '30m', status: 'Hired' },
    ];
  }, [previousInterviews]);

  const handleLaunchInterview = () => {
    const config = { interviewType, difficulty, duration, company };
    localStorage.setItem('codehub-interview-config', JSON.stringify(config));
    navigate('/interview/live');
  };

  const handleResumeUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      setIsUploadingResume(true);
      // Simulate recruiter scanning calculations
      setTimeout(() => {
        setIsUploadingResume(false);
        setResumeScore(86);
      }, 2500);
    }
  };

  // Stagger configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const candidateName = userData?.displayName || currentUser?.displayName || 'Candidate';

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden relative pb-24">
      {/* Background visual spot lights */}
      <div className="glow-spot-indigo top-[5%] left-[5%]" />
      <div className="glow-spot-purple top-[35%] right-[5%]" />
      <div className="glow-spot-emerald bottom-[15%] left-[10%]" />
      
      {/* Tech line mapping overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-grid-white/[0.02] pointer-events-none" />

      <motion.div
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-28 space-y-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Hero Welcome Grid ────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Banner */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} /> Recruiter Ready Suite
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Welcome back, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {candidateName}.
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                Your placement readiness metrics have improved. AI analysis reports that your speech latency is in the recruiter-optimal zone. Optimize your Resume Match below for higher hiring rates.
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-button-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                <Mic size={14} /> New Practice Session
              </button>
              <button
                onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="glass-button-secondary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <History size={14} /> View History logs
              </button>
            </div>
          </div>

          {/* Resume Strength Gauge */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
            
            <div className="w-full flex items-center justify-between text-left mb-2 shrink-0">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                <FileText size={11} className="text-purple-400" /> Resume Strength
              </h4>
              <span className="text-[9px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded font-bold uppercase">ATS Scanner</span>
            </div>

            <div className="relative my-4 flex-1 flex items-center justify-center">
              <CircularProgress value={resumeScore} size={150} strokeWidth={11} color="#a855f7" label="Match Strength" />
            </div>

            <div className="w-full space-y-4">
              {resumeName ? (
                <div className="text-[10px] font-bold text-emerald-400 truncate bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12} /> {resumeName}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">
                  Upload your CV to compute alignment percentages against top tech roles.
                </p>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleResumeChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              <button
                onClick={handleResumeUploadClick}
                disabled={isUploadingResume}
                className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.02] text-xs font-bold text-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isUploadingResume ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-purple-400" />
                    Calculating ATS Metrics...
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    {resumeName ? 'Upload New CV' : 'Upload Resume'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Animated KPI Stats Row ─────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Completed Rounds', val: displayInterviews.length, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Average Score', val: readiness.overall, suffix: '%', icon: Trophy, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Communication Rate', val: readiness.communication, suffix: '%', icon: Volume2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Technical Depth', val: readiness.technical, suffix: '%', icon: Brain, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Speech Confidence', val: readiness.confidence, suffix: '%', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-panel rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-md">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 block">
                    <CountUp to={stat.val} suffix={stat.suffix} delay={i * 0.15} />
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ─── Analytics & Insights Grid ──────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance Analytics */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <BarChart3 size={13} className="text-indigo-400" /> Weekly Pacing Trend
              </h3>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">10-Session History</span>
            </div>
            
            <WeeklyPerformanceChart />
            
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-4 border-t border-white/5 mt-4">
              <span>Current WPM: 128 (Optimal)</span>
              <span>Avg Latency: 1.8s</span>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-400" /> AI Diagnostic Insights
              </h3>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Live</span>
            </div>

            <div className="space-y-4 my-5 flex-1 overflow-y-auto pr-1">
              {[
                { title: 'DSA & Mathematical Complexities', desc: 'Concept accuracy is high (88%). Protip: Elaborate runtime space bounds on tree balances to reach the advanced senior band.', status: 'positive' },
                { title: 'Response Delay Pacing', desc: 'Vocal response latency has decreased by 12%. Transition delays average 1.8 seconds, displaying professional deliberation.', status: 'positive' },
                { title: 'Filler Hesitations Tracker', desc: 'Filler index detected basically / um twice. Reduce hesitation keywords under networking definitions for cleaner delivery.', status: 'needs-work' }
              ].map((ins, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-3 items-start hover:border-white/10 transition-colors duration-300">
                  {ins.status === 'positive' ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">{ins.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ins.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Skills, Activities & Recommendations Grid ────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skill Progress Charts */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-1.5">
              <Brain size={12} className="text-indigo-400" /> Capabilities Profile
            </h3>
            
            <div className="space-y-4 flex-1 justify-center flex flex-col">
              {[
                { name: 'Technical Depth', val: readiness.technical, color: 'bg-indigo-500' },
                { name: 'Communication Pacing', val: readiness.communication, color: 'bg-purple-500' },
                { name: 'Vocal Confidence', val: readiness.confidence, color: 'bg-emerald-500' },
                { name: 'Logic Complexity', val: readiness.problemSolving, color: 'bg-pink-500' },
              ].map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{skill.name}</span>
                    <span>{skill.val}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      className={`h-full rounded-full ${skill.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.val}%` }}
                      transition={{ duration: 1.2, delay: index * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-1.5">
              <History size={12} className="text-indigo-400" /> Activity Timeline
            </h3>

            <div className="space-y-4.5 flex-1 relative pl-4 border-l border-white/5">
              {[
                { time: '2 days ago', title: 'DSA Practice Completed', val: 'Score: 85%', dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]' },
                { time: '5 days ago', title: 'HR Mock Session Done', val: 'Score: 78%', dot: 'bg-indigo-500 shadow-[0_0_6px_#6366f1]' },
                { time: '1 week ago', title: 'System Design Session', val: 'Score: 72%', dot: 'bg-purple-500 shadow-[0_0_6px_#8b5cf6]' },
              ].map((act, i) => (
                <div key={i} className="relative space-y-1">
                  <span className={`absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full ${act.dot}`} />
                  <span className="text-[8px] text-slate-500 block font-bold tracking-wider">{act.time}</span>
                  <h4 className="text-[10px] font-bold text-white tracking-wide">{act.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{act.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrades Suggestions Recommendations */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-1.5">
              <Zap size={12} className="text-indigo-400" /> Suggested Targets
            </h3>

            <div className="space-y-3.5 flex-1 flex flex-col justify-center">
              {[
                { title: 'TCS Intermediate Adaptation', desc: 'Mixed technology scenarios & HR behavioral rounds.', type: 'Intermediate' },
                { title: 'Google Advanced placement', desc: 'Graph optimizations and systems design architectures.', type: 'Advanced' }
              ].map((rec, i) => (
                <div 
                  key={i} 
                  className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer flex justify-between items-center group"
                  onClick={() => {
                    setCompany(rec.title.toLowerCase().includes('tcs') ? 'tcs' : 'google');
                    setDifficulty(rec.type.toLowerCase());
                    document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        rec.type === 'Advanced' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>{rec.type}</span>
                      <h4 className="text-[10px] font-bold text-white group-hover:text-indigo-300 transition-colors leading-none">{rec.title}</h4>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-snug">{rec.desc}</p>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Session History Log Table ─────────────────────────────────── */}
        <motion.div id="history-section" variants={itemVariants} className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-5 shrink-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Session History Logs</h3>
              <p className="text-[10px] text-slate-500 mt-1">Recruiter-ready transcripts, scores, and diagnostics metadata</p>
            </div>
            {previousInterviews.length === 0 && (
              <span className="text-[9px] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-widest">Reference Demo</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase text-slate-500 tracking-widest">
                  <th className="pb-4 font-bold">Round Description</th>
                  <th className="pb-4 font-bold">Assessment Date</th>
                  <th className="pb-4 font-bold">Duration</th>
                  <th className="pb-4 font-bold text-center">Questions</th>
                  <th className="pb-4 font-bold text-right">Score Badge</th>
                  <th className="pb-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayInterviews.map((sess, idx) => (
                  <tr key={sess.id || idx} className="group hover:bg-white/[0.01] transition-all duration-200">
                    <td className="py-4.5 font-bold text-white group-hover:text-indigo-300 transition-colors">{sess.name}</td>
                    <td className="py-4.5 text-slate-400 font-semibold">{sess.date}</td>
                    <td className="py-4.5 text-slate-400 font-semibold">{sess.duration || '20m'}</td>
                    <td className="py-4.5 text-slate-400 font-semibold text-center">{sess.totalAnswers || 5} answers</td>
                    <td className="py-4.5 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                        sess.averageScore >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                          : sess.averageScore >= 65 
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {sess.averageScore}%
                      </span>
                    </td>
                    <td className="py-4.5 text-right">
                      <button
                        onClick={() => navigate(`/interview/report/${sess.id}`)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all cursor-pointer"
                        title="View diagnostic report"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ─── Configurator Console Section ─────────────────────────────── */}
        <motion.section id="configurator" variants={itemVariants} className="glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-indigo-500/5 blur-[90px] pointer-events-none" />

          <div className="relative z-10 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Configure Adaptation Round</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Adapt the mock interview settings. Selecting target companies activates localized system datasets.</p>
            </div>

            {/* Type Select */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Select Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {INTERVIEW_TYPES.map(type => {
                  const Icon = type.icon;
                  const isActive = interviewType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`relative group px-5 py-4.5 rounded-2xl text-left border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isActive
                          ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                          : 'bg-[#06060c]/40 border-white/5 text-slate-400 hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTypeHighlight"
                          className="absolute inset-0 border border-indigo-400/40 rounded-2xl pointer-events-none"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <Icon size={20} className={`mb-3 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                      <h4 className="text-xs font-bold mb-1 text-white">{type.label}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Select */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Select Difficulty</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {DIFFICULTIES.map(d => {
                  const isActive = difficulty === d.id;
                  const colorClasses = {
                    emerald: isActive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'hover:border-emerald-500/20 hover:bg-emerald-500/[0.02]',
                    amber: isActive ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' : 'hover:border-amber-500/20 hover:bg-amber-500/[0.02]',
                    rose: isActive ? 'bg-rose-500/10 border-rose-500/50 text-rose-300' : 'hover:border-rose-500/20 hover:bg-rose-500/[0.02]',
                  };
                  const dotColors = {
                    emerald: isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-emerald-600',
                    amber: isActive ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-amber-600',
                    rose: isActive ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-rose-600',
                  };
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`relative px-5 py-4 rounded-2xl text-left border bg-[#06060c]/40 border-white/5 text-slate-400 transition-all duration-300 cursor-pointer overflow-hidden ${colorClasses[d.color]}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeDiffHighlight"
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColors[d.color]}`} />
                        <h4 className="text-xs font-bold text-white">{d.label}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">{d.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Select */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Select Duration</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {DURATIONS.map(d => {
                  const isActive = duration === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id)}
                      className={`relative px-5 py-4.5 rounded-2xl text-left border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isActive
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-200'
                          : 'bg-[#06060c]/40 border-white/5 text-slate-400 hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeDurHighlight"
                          className="absolute inset-0 border border-purple-400/40 rounded-2xl pointer-events-none"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        <Timer size={14} className={isActive ? 'text-purple-400' : 'text-slate-500'} />
                        <h4 className="text-xs font-bold text-white">{d.label}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Company Select */}
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Target Company <span className="text-slate-600 font-normal lowercase">(optional adaptation)</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {COMPANIES.map(c => {
                  const isActive = company === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCompany(isActive ? null : c.id)}
                      className={`px-4 py-3.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'text-white border-opacity-60'
                          : 'bg-[#06060c]/40 border-white/5 text-slate-400 hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                      style={isActive ? {
                        background: `${c.color}18`,
                        borderColor: c.color,
                        boxShadow: `0 0 15px ${c.color}15`,
                        color: c.color,
                      } : {}}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Launch */}
            <div className="pt-6 border-t border-white/5">
              <button
                onClick={handleLaunchInterview}
                className="group relative px-10 py-5.5 rounded-2xl text-xs font-bold transition-all cursor-pointer overflow-hidden shadow-[0_12px_40px_rgba(99,102,241,0.25)] active:scale-98"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white uppercase tracking-wider">
                  <Mic size={15} />
                  Launch Placement Room
                  <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}


