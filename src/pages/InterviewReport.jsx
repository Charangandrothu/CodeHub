import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, ArrowLeft, Volume2,
  Trophy, BarChart3, Share2, RefreshCw, ChevronDown, ChevronUp,
  Shield, AlertCircle, Clock, VolumeX, Check, FileText
} from 'lucide-react';
import { sarvamTTS } from '../services/sarvamTTS';

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useCountUp(target, duration = 1500, delay = 300) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.round(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

// ─── Confetti Particles ──────────────────────────────────────────────────────

const ConfettiEffect = () => {
  const particles = useMemo(() =>
    Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 6)],
      size: Math.random() * 5 + 3,
      delay: Math.random() * 1.5,
      duration: Math.random() * 2 + 1.8,
      rotation: Math.random() * 360,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -15,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
};

// ─── Circular Score Ring ─────────────────────────────────────────────────────

const ScoreRing = ({ value, size = 180, strokeWidth = 12, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const animatedValue = useCountUp(value, 1500, 500);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Dynamic rotating glowing ring back shadow */}
      <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse-slow pointer-events-none" />
      
      <svg className="-rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'cubicBezier(0.16, 1, 0.3, 1)', delay: 0.2 }}
          fill="none"
          style={{ filter: `drop-shadow(0 0 14px ${color}55)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter">{animatedValue}%</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Overall score</span>
      </div>
    </div>
  );
};

// ─── Skill Bar ───────────────────────────────────────────────────────────────

const SkillBar = ({ label, value, color, delay = 0 }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-xs">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}%</span>
    </div>
    <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      />
    </div>
  </div>
);

// ─── Pentagon Radar Helpers ──────────────────────────────────────────────────

function getCoord(index, value, center = 100, maxR = 65) {
  const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
  const r = (value / 100) * maxR;
  return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
}

// ─── Main Report Component ───────────────────────────────────────────────────

export default function InterviewReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const rawReport = localStorage.getItem('codehub-latest-interview-report');
    if (rawReport) {
      try { setReport(JSON.parse(rawReport)); } catch {}
    }
    const timer = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timer);
  }, [id]);

  const fallbackReport = useMemo(() => ({
    totalAnswers: 5,
    averageScore: 82,
    averageWpm: 125,
    totalFillers: 4,
    averageLatencyMs: 1800,
    questionBreakdown: [
      { question: 'Can you explain what dynamic programming is and how it differs from recursion?', answer: 'Dynamic programming is an optimization over recursion. It stores subproblem results to avoid recomputation, reducing time complexity from exponential to polynomial.', score: 88, metrics: { wordCount: 38, wpm: 130, fillerCount: 1, fillerWords: { basically: 1 }, latencyMs: 1500 } },
      { question: 'What is the time complexity of searching in a binary search tree?', answer: 'Search time in a BST is O(h) where h is the height. Average case is O(log n) for balanced trees, worst case O(n) for skewed trees.', score: 85, metrics: { wordCount: 43, wpm: 120, fillerCount: 0, fillerWords: {}, latencyMs: 2100 } },
      { question: 'How do you check if a linked list contains a cycle?', answer: "Use Floyd's Cycle Detection with a slow and fast pointer. If they meet, there's a cycle.", score: 92, metrics: { wordCount: 49, wpm: 140, fillerCount: 0, fillerWords: {}, latencyMs: 1200 } },
      { question: 'What is the difference between TCP and UDP?', answer: 'TCP is connection-oriented, guarantees delivery with handshakes. UDP is connectionless, faster but unreliable. UDP is used for streaming.', score: 78, metrics: { wordCount: 35, wpm: 110, fillerCount: 1, fillerWords: { basically: 1 }, latencyMs: 2500 } },
      { question: 'What is a hash collision and how do you resolve it?', answer: 'A collision happens when two keys map to the same index. Resolved with hashing chaining or open addressing like linear probing.', score: 72, metrics: { wordCount: 35, wpm: 125, fillerCount: 2, fillerWords: { um: 1, so: 1 }, latencyMs: 1700 } },
    ],
  }), []);

  const data = report || fallbackReport;

  const recommendation = useMemo(() => {
    const score = data.averageScore || 80;
    if (score >= 85) return { label: 'STRONG HIRE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' };
    if (score >= 70) return { label: 'HIRE', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    return { label: 'NEEDS PRACTICE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' };
  }, [data.averageScore]);

  // Radar chart computations
  const radarData = useMemo(() => {
    const score = data.averageScore || 80;
    const wpm = data.averageWpm || 120;
    const fillers = data.totalFillers || 0;

    const categories = [
      { label: 'Technical', val: score },
      { label: 'DSA Logic', val: Math.min(100, score + 4) },
      { label: 'Communication', val: Math.round(Math.min(100, (wpm / 150) * 100)) },
      { label: 'Clarity', val: Math.max(40, 100 - fillers * 6) },
      { label: 'Behavioral', val: 85 },
    ];

    const polygonPoints = categories.map((c, i) => {
      const p = getCoord(i, c.val);
      return `${p.x},${p.y}`;
    }).join(' ');

    const gridPolygons = [20, 40, 60, 80, 100].map(level =>
      categories.map((_, i) => {
        const p = getCoord(i, level);
        return `${p.x},${p.y}`;
      }).join(' ')
    );

    const axes = categories.map((c, i) => {
      const outer = getCoord(i, 100);
      const labelPos = getCoord(i, 125);
      const dot = getCoord(i, c.val);
      return { ...outer, label: c.label, lx: labelPos.x, ly: labelPos.y, val: c.val, dx: dot.x, dy: dot.y };
    });

    return { polygonPoints, gridPolygons, axes, categories };
  }, [data]);

  const handleShare = useCallback(() => {
    const text = `🎯 My AI Mock Placement Interview Score: ${data.averageScore}% | ${data.totalAnswers} Scenarios | CodeHubX`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [data]);

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#6366f1';
    if (score >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const getWpmLabel = (wpm) => {
    if (wpm < 90) return { label: 'Deliberate', color: 'text-amber-400' };
    if (wpm > 160) return { label: 'Fast Paced', color: 'text-amber-400' };
    return { label: 'Optimal', color: 'text-emerald-400' };
  };

  const wpmInfo = getWpmLabel(data.averageWpm);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 relative pb-28" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {showConfetti && <ConfettiEffect />}

      {/* Ambient backgrounds */}
      <div className="glow-spot-indigo top-[-10%] right-[-10%]" />
      <div className="glow-spot-emerald bottom-[-10%] left-[-10%]" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 pt-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navigation Actions bar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/8 hover:text-white transition-all cursor-pointer"
            >
              <FileText size={14} />
              Export PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/8 hover:text-white transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <button
              onClick={() => navigate('/interview')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:opacity-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
              }}
            >
              <RefreshCw size={14} />
              Retake Round
            </button>
          </div>
        </motion.div>

        {/* ─── Hero Summary Panel ────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="glass-panel rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden mb-8"
        >
          {/* Gloss overlay styling */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/35 to-transparent pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 blur-[90px] rounded-full pointer-events-none" />

          <div className="space-y-3 relative z-10 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <Trophy size={13} className="text-indigo-400" />
                Round Assessment Complete
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-extrabold uppercase tracking-widest backdrop-blur-md ${recommendation.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                REC: {recommendation.label}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
              Evaluation Metrics
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Assessment finished. Review the diagnostic breakdown, key conceptual markers, and spoken clarity summaries below.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <ScoreRing value={data.averageScore} size={190} strokeWidth={14} color={getScoreColor(data.averageScore)} />
          </div>
        </motion.div>

        {/* ─── Metric Details Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Key Diagnostics Panel */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-1.5">
              <BarChart3 size={12} className="text-indigo-400" /> Speech & Pacing Metrics
            </h3>

            <div className="grid grid-cols-2 gap-5.5 mb-6">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Speaking Rate</span>
                <div className="text-2xl font-extrabold text-white">{data.averageWpm} <span className="text-[10px] text-slate-500 font-bold uppercase ml-0.5">WPM</span></div>
                <p className={`text-[10px] font-bold ${wpmInfo.color}`}>{wpmInfo.label}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Avg Latency</span>
                <div className="text-2xl font-extrabold text-white">{(data.averageLatencyMs / 1000).toFixed(1)}s</div>
                <p className="text-[10px] text-slate-500 font-bold">Response delay</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Fluency Score</span>
                <div className="text-2xl font-extrabold text-white">{Math.max(40, 100 - data.totalFillers * 7)}%</div>
                <p className="text-[10px] text-slate-500 font-bold">Filler word checks</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Confidence</span>
                <div className="text-2xl font-extrabold text-white">85%</div>
                <p className="text-[10px] text-slate-500 font-bold">Volume stability</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/5 flex gap-3 items-start">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Response pacing ranks <strong className="text-white">Optimal</strong>. Try structuring responses using structural bullet points.
              </p>
            </div>
          </motion.div>

          {/* Pentagon Skill Map */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="w-full flex justify-between items-center mb-5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Shield size={12} className="text-indigo-400" /> Skill Map Radar
              </span>
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Pentagon</span>
            </div>

            <div className="relative w-full aspect-square max-w-[240px] flex-1 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                {radarData.gridPolygons.map((poly, idx) => (
                  <polygon key={idx} points={poly} className="fill-none stroke-white/5" strokeWidth="0.75" />
                ))}
                {radarData.axes.map((axis, idx) => (
                  <line key={idx} x1={100} y1={100} x2={axis.x} y2={axis.y} className="stroke-white/5" strokeWidth="0.75" />
                ))}
                <motion.polygon
                  points={radarData.polygonPoints}
                  className="fill-indigo-500/15 stroke-indigo-400"
                  strokeWidth="1.75"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  style={{ transformOrigin: '100px 100px' }}
                />
                {radarData.axes.map((axis, idx) => (
                  <motion.circle
                    key={idx}
                    cx={axis.dx} cy={axis.dy} r="3.5"
                    className="fill-indigo-400 stroke-[#050508]"
                    strokeWidth="1.5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + idx * 0.08 }}
                  />
                ))}
                {radarData.axes.map((axis, idx) => (
                  <text key={`label-${idx}`} x={axis.lx} y={axis.ly} textAnchor="middle" dominantBaseline="central" className="fill-slate-400 font-sans text-[7.5px] font-bold uppercase tracking-widest">
                    {axis.label}
                  </text>
                ))}
              </svg>
            </div>
          </motion.div>

          {/* Strengths & Focus Profiler */}
          <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-1.5">
              <AlertCircle size={12} className="text-indigo-400" /> Diagnostics Profile
            </h3>

            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Key Strengths
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc leading-relaxed font-medium">
                  <li>Structured explanations with modular examples</li>
                  <li>Speaking decibels and pace kept inside optimal values</li>
                  <li>No recurring hesitation gaps during logic descriptions</li>
                </ul>
              </div>

              <div className="space-y-2 pt-3.5 border-t border-white/5">
                <h4 className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <XCircle size={12} className="text-amber-400" /> Focus Areas
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc leading-relaxed font-medium">
                  <li>Detail runtime space complexities for recursive branches</li>
                  <li>Reference chaining and open addressing differences clearly</li>
                  <li>Reduce hesitation words during network definitions</li>
                </ul>
              </div>
            </div>

            {/* Sub-bars */}
            <div className="space-y-3 pt-5.5 border-t border-white/5 mt-5">
              {radarData.categories.map((cat, i) => (
                <SkillBar
                  key={cat.label}
                  label={cat.label}
                  value={cat.val}
                  color={['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'][i]}
                  delay={0.3 + i * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Corporate Benchmarks Section ──────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Industry Hiring Benchmarks</h3>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Placement Equivalencies</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {/* Candidate Card */}
            <div className="bg-indigo-500/10 border border-indigo-500/25 p-5 rounded-2xl text-center relative overflow-hidden shadow-inner flex flex-col justify-center min-h-[120px]">
              <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Your Average</span>
              <div className="text-4xl font-extrabold text-white">{data.averageScore}%</div>
              <div>
                <span className={`text-[7px] font-extrabold px-2 py-0.5 rounded mt-3 inline-block uppercase tracking-wider ${recommendation.label === 'STRONG HIRE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                  {recommendation.label}
                </span>
              </div>
            </div>

            {/* Benchmark 1 */}
            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl text-center flex flex-col justify-center min-h-[120px]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Google Level L3</span>
              <div className="text-3xl font-bold text-slate-400">86%</div>
              <div className="text-[8px] font-extrabold mt-3 uppercase tracking-wider">
                {data.averageScore >= 86 ? (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">✓ Match</span>
                ) : (
                  <span className="text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">Need +{86 - data.averageScore}%</span>
                )}
              </div>
            </div>

            {/* Benchmark 2 */}
            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl text-center flex flex-col justify-center min-h-[120px]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Amazon SDE-1</span>
              <div className="text-3xl font-bold text-slate-400">80%</div>
              <div className="text-[8px] font-extrabold mt-3 uppercase tracking-wider">
                {data.averageScore >= 80 ? (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">✓ Match</span>
                ) : (
                  <span className="text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">Need +{80 - data.averageScore}%</span>
                )}
              </div>
            </div>

            {/* Benchmark 3 */}
            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl text-center flex flex-col justify-center min-h-[120px]">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">TCS Digital</span>
              <div className="text-3xl font-bold text-slate-400">68%</div>
              <div className="text-[8px] font-extrabold mt-3 uppercase tracking-wider">
                {data.averageScore >= 68 ? (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">✓ Match</span>
                ) : (
                  <span className="text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">Need +{68 - data.averageScore}%</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Timeline Accordions Section ─────────────────────────────── */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Scenarios Transcript Timeline</h3>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Interactive Playback</span>
          </div>

          <div className="space-y-3">
            {data.questionBreakdown.map((q, idx) => {
              const isExpanded = idx === activeTimelineIndex;
              return (
                <motion.div
                  key={idx}
                  layout
                  className="glass-panel rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
                >
                  {/* Collapsed view header */}
                  <div
                    onClick={() => setActiveTimelineIndex(isExpanded ? null : idx)}
                    className="p-5 flex items-center justify-between cursor-pointer gap-4 relative"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">Question {idx + 1}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          q.score >= 85 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                            : q.score >= 70 
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}>
                          {q.score}% Match
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">{q.question}</h4>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); sarvamTTS.speak(q.question, 'en-IN', 'aditya'); }}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Replay Voice Narration"
                      >
                        <Volume2 size={13} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded view details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-5 bg-black/15">
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Candidate Transcript</span>
                            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.015] p-4.5 rounded-2xl border border-white/5 font-medium italic shadow-inner">
                              "{q.answer}"
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Speaking Speed', value: `${q.metrics.wpm} WPM` },
                              { label: 'Word count', value: q.metrics.wordCount },
                              { label: 'Filler count', value: q.metrics.fillerCount },
                              { label: 'Vocal Latency', value: `${(q.metrics.latencyMs / 1000).toFixed(1)}s` },
                            ].map(m => (
                              <div key={m.label} className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl text-center">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">{m.label}</span>
                                <span className="text-xs sm:text-sm font-bold text-white mt-1 block">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-12" />
      </motion.div>
    </div>
  );
}
