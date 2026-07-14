import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Clock, AlertTriangle, Volume2, User,
  HelpCircle, Loader2, X, ChevronDown, ChevronUp,
  Camera, Pencil, BarChart3, MessageSquare,
  ArrowRight, Check, VolumeX, Sparkles
} from 'lucide-react';
import { InterviewEngine } from '../services/interviewEngine';
import { sarvamSTT } from '../services/sarvamSTT';
import { useAuth } from '../context/AuthContext';

// ─── Waveform Bar Component ──────────────────────────────────────────────────

const WaveformBar = ({ index, isActive, color }) => (
  <motion.div
    className="rounded-full"
    style={{ width: 3, background: color }}
    animate={{
      height: isActive ? [10, Math.random() * 36 + 8, 10] : 4,
    }}
    transition={{
      duration: 0.35 + (index % 4) * 0.08,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// ─── Audio Level Bars ────────────────────────────────────────────────────────

const AudioLevelBars = ({ isActive }) => (
  <div className="flex items-end gap-1 h-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"
        animate={{
          height: isActive ? [4, 12 + Math.random() * 14, 4] : 4,
          opacity: isActive ? 1 : 0.3,
        }}
        transition={{
          duration: 0.3 + i * 0.05,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

// ─── Metric Card ─────────────────────────────────────────────────────────────

const MetricCard = ({ label, value, unit, subtitle }) => (
  <div className="glass-panel rounded-2xl p-4 text-center relative overflow-hidden group hover:border-white/15 hover:shadow-[0_4px_20px_rgba(255,255,255,0.03)] transition-all duration-300">
    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</h4>
    <div className="text-xl font-extrabold text-white tracking-tight leading-none">
      {value}
      {unit && <span className="text-[10px] text-slate-500 font-semibold uppercase ml-1">{unit}</span>}
    </div>
    {subtitle && <p className="text-[9px] text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

// ─── Main Interview Live Component ───────────────────────────────────────────

export default function InterviewLive() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const engine = useMemo(() => new InterviewEngine(), []);

  // Engine state mirrors
  const [engineState, setEngineState] = useState('idle');
  const [activeQuestion, setActiveQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(1);
  const [chatHistory, setChatHistory] = useState([]);
  const [evalRecords, setEvalRecords] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Chat scroll
  const chatEndRef = useRef(null);

  // Notes
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Mobile drawer
  const [mobilePanel, setMobilePanel] = useState(null); // 'left' | 'right' | null

  // Waveform config
  const waveformBars = useMemo(() => Array.from({ length: 18 }), []);

  // Lobby/Lounge States & Refs
  const [isLobbyActive, setIsLobbyActive] = useState(true);

  // Simulated Eye-Contact Detector & Emotion Analyser
  const [eyeContact, setEyeContact] = useState('FOCUSED');
  const [currentEmotion, setCurrentEmotion] = useState('Focused');
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    if (isLobbyActive) return;

    // Simulate eye contact shifts occasionally
    const eyeInterval = setInterval(() => {
      const isFocused = Math.random() > 0.12; // 88% focused
      setEyeContact(isFocused ? 'FOCUSED' : 'DISTRACTED');
    }, 6000);

    // Simulate emotion shifting based on state
    const emotionInterval = setInterval(() => {
      if (engineState === 'listening') {
        const emotions = ['Confident', 'Focused', 'Smiling', 'Analyzing'];
        setCurrentEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
      } else if (engineState === 'speaking') {
        const emotions = ['Focused', 'Neutral'];
        setCurrentEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
      } else {
        setCurrentEmotion('Focused');
      }
      setLatency(Math.floor(Math.random() * 15) + 15);
    }, 4000);

    const handleFocus = () => setEyeContact('FOCUSED');
    const handleBlur = () => setEyeContact('DISTRACTED');

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearInterval(eyeInterval);
      clearInterval(emotionInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isLobbyActive, engineState]);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [devicesStream, setDevicesStream] = useState(null);
  const [micVolume, setMicVolume] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [selectedVoice, setSelectedVoice] = useState('aditya');
  const [speakerTested, setSpeakerTested] = useState(false);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const videoRef = useRef(null);
  const candidateVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const voicesMap = {
    'en-IN': [
      { id: 'aditya', name: 'Aditya (Male - Expressive)' },
      { id: 'deepika', name: 'Deepika (Female - Professional)' },
      { id: 'arvind', name: 'Arvind (Male - Clear Accent)' }
    ],
    'hi-IN': [
      { id: 'shubh', name: 'Shubh (Male - Hindi)' },
      { id: 'deepika', name: 'Deepika (Female - Hindi)' },
      { id: 'aditya', name: 'Aditya (Male - Hindi)' }
    ],
    'ta-IN': [
      { id: 'arvind', name: 'Arvind (Male - Tamil)' },
      { id: 'deepika', name: 'Deepika (Female - Tamil)' }
    ],
    'te-IN': [
      { id: 'arvind', name: 'Arvind (Male - Telugu)' },
      { id: 'deepika', name: 'Deepika (Female - Telugu)' }
    ]
  };

  // ─── Lobby Devices Handlers ──────────────────────────────────────────────

  const startDevices = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setDevicesStream(stream);
      setMicPermission('granted');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 200);

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Failed to get audio and video streams:", err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setDevicesStream(audioStream);
        setMicPermission('granted');
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (audioErr) {
        console.error("Failed to get audio stream:", audioErr);
        setMicPermission('denied');
        setErrorMsg("Camera or microphone permission was denied. Please update browser permissions to start the interview.");
      }
    }
  };

  const stopDevices = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    if (isLobbyActive) {
      startDevices();
    }
    return () => {
      stopDevices();
      if (devicesStream) {
        devicesStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLobbyActive]);

  const handleTestSpeaker = async () => {
    if (isTestingSpeaker) return;
    setIsTestingSpeaker(true);
    try {
      const testText = "Welcome to CodeHub AI. Your audio is set up successfully.";
      const { sarvamTTS } = await import('../services/sarvamTTS');
      await sarvamTTS.speak(testText, selectedLanguage, selectedVoice);
      setSpeakerTested(true);
    } catch (err) {
      console.error("Speaker test failed:", err);
      setErrorMsg("Audio output test failed. Please check your system speaker.");
    } finally {
      setIsTestingSpeaker(false);
    }
  };

  const handleStartInterview = async () => {
    stopDevices();
    if (devicesStream) {
      devicesStream.getAudioTracks().forEach(track => track.stop());
    }

    setIsLobbyActive(false);

    engine.languageCode = selectedLanguage;
    engine.speaker = selectedVoice;

    await startInterviewSession();

    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    sarvamSTT.toggleMute(nextMuted);
  };

  const handleReplayQuestion = async () => {
    if (engineState === 'speaking' || isProcessing) return;
    setEngineState('speaking');
    await engine.replayActiveQuestion();
    syncState();
  };

  // ─── State Sync ──────────────────────────────────────────────────────────

  const syncState = useCallback(() => {
    setEngineState(engine.state);
    setActiveQuestion(engine.activeQuestion);
    setQuestionIndex(engine.activeQuestionIndex);
    setChatHistory([...engine.history]);
    setEvalRecords([...engine.evaluationHistory]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [engine]);

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    engine.onSync = syncState;
    return () => {
      engine.onSync = undefined;
      if (timerRef.current) clearInterval(timerRef.current);
      engine.finishSession();
    };
  }, [engine, syncState]);

  const startInterviewSession = async () => {
    setErrorMsg(null);
    try {
      const config = JSON.parse(localStorage.getItem('codehub-interview-config') || '{}');
      const topic = config.interviewType === 'dsa'
        ? 'Data Structures & Algorithms'
        : config.interviewType === 'hr'
          ? 'Human Resources & Behavioral'
          : config.interviewType === 'system-design'
            ? 'System Design & Architecture'
            : 'Software Engineering Core & Algorithms';
      await engine.startSession(topic);
      syncState();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate voice connection.');
    }
  };

  const handleMicToggle = async () => {
    if (engine.state === 'listening') {
      try {
        await engine.stopAndSubmitAnswer();
        syncState();
        if (engine.activeQuestionIndex >= 5) {
          handleFinishInterview();
        } else {
          await engine.proceedToNextQuestion();
          syncState();
        }
      } catch (err) {
        setErrorMsg(err.message || 'Transcription failed. Please speak again.');
        syncState();
      }
    } else if (engine.state === 'speaking' || engine.state === 'idle') {
      try {
        await engine.startListening();
        syncState();
      } catch (err) {
        setErrorMsg(err.message);
        syncState();
      }
    }
  };

  const handleFinishInterview = () => {
    const report = engine.finishSession();
    try {
      const history = JSON.parse(localStorage.getItem('codehub-interview-history') || '[]');
      history.unshift({
        id: Date.now().toString(),
        name: `${engine.topic} Interview`,
        date: new Date().toLocaleDateString(),
        ...report,
      });
      localStorage.setItem('codehub-interview-history', JSON.stringify(history.slice(0, 20)));
    } catch {}
    localStorage.setItem('codehub-latest-interview-report', JSON.stringify(report));
    navigate('/interview/report/latest');
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ─── Computed Metrics ────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    if (evalRecords.length === 0) {
      return { wpm: 0, latency: 0, fillers: 0, accuracy: 0, fluency: 0 };
    }
    const last = evalRecords[evalRecords.length - 1];
    const totalFillers = evalRecords.reduce((acc, r) => acc + r.metrics.fillerCount, 0);
    return {
      wpm: last.metrics.wpm,
      latency: last.metrics.latencyMs,
      fillers: totalFillers,
      accuracy: last.score,
      fluency: Math.max(40, 100 - last.metrics.fillerCount * 10),
    };
  }, [evalRecords]);

  // ─── State Config (visual mapping) ──────────────────────────────────────

  const stateConfig = useMemo(() => {
    const configs = {
      initializing: { label: 'Connecting...', glow: 'bg-blue-500/20', border: 'border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]', waveColor: '#3b82f6' },
      speaking: { label: 'AI Recruiter Speaking', glow: 'bg-indigo-500/25', border: 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.25)]', waveColor: '#818cf8' },
      listening: { label: 'Listening to Candidate...', glow: 'bg-emerald-500/20', border: 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.25)]', waveColor: '#34d399' },
      transcribing: { label: 'Transcribing Audio...', glow: 'bg-cyan-500/20', border: 'border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)]', waveColor: '#22d3ee' },
      scoring: { label: 'Analyzing Response...', glow: 'bg-amber-500/20', border: 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]', waveColor: '#fbbf24' },
      generating_next: { label: 'Structuring Next Scenario...', glow: 'bg-purple-500/20', border: 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]', waveColor: '#a78bfa' },
    };
    return configs[engineState] || { label: 'Idle State', glow: 'bg-zinc-700/10', border: 'border-zinc-700/40', waveColor: '#71717a' };
  }, [engineState]);

  const progressPercent = Math.round(((questionIndex - 1) / 5) * 100);
  const isProcessing = ['initializing', 'generating_next', 'scoring', 'transcribing'].includes(engineState);

  useEffect(() => {
    if (!isLobbyActive && devicesStream && candidateVideoRef.current) {
      candidateVideoRef.current.srcObject = devicesStream;
    }
  }, [isLobbyActive, devicesStream]);

  if (isLobbyActive) {
    return (
      <div className="fixed inset-0 bg-[#040408] flex flex-col text-slate-200 z-50 overflow-y-auto" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Glow elements */}
        <div className="glow-spot-indigo top-[10%] left-[10%]" />
        <div className="glow-spot-purple bottom-[15%] right-[10%]" />

        {/* Lobby Header */}
        <header className="h-16 border-b border-white/10 bg-[#06060c]/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400">CodeHubX Placement Lounge</h1>
          </div>
          <button 
            onClick={() => navigate('/interview')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X size={14} /> Exit Lounge
          </button>
        </header>

        {/* Lobby Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="max-w-4xl w-full glass-panel rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10">
            {/* Mirror line shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            
            {/* Left Side: Camera & Mic Diagnosis */}
            <div className="flex-1 flex flex-col space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Setup Workspace</h2>
                <p className="text-xs text-slate-400 mt-1">Calibrate audio streams and permissions before entering.</p>
              </div>
              
              {/* Camera Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#06060c] shadow-2xl flex items-center justify-center">
                {devicesStream?.getVideoTracks().length > 0 ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]" 
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-3 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 animate-pulse">
                      <Camera size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Camera Feed Blocked</span>
                    <span className="text-[10px] text-slate-500 max-w-[220px]">
                      AI avatar representation active if camera input is disabled.
                    </span>
                  </div>
                )}
                
                {/* Tech targeting guide overlay */}
                <div className="absolute inset-4 border border-dashed border-white/5 pointer-events-none rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 border-t border-l border-indigo-500/40 absolute top-0 left-0" />
                  <div className="w-6 h-6 border-t border-r border-indigo-500/40 absolute top-0 right-0" />
                  <div className="w-6 h-6 border-b border-l border-indigo-500/40 absolute bottom-0 left-0" />
                  <div className="w-6 h-6 border-b border-r border-indigo-500/40 absolute bottom-0 right-0" />
                </div>

                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-indigo-400 uppercase tracking-widest border border-white/5">
                  Lobby Preview
                </div>
              </div>

              {/* Mic Check level meters */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold tracking-wide">Audio Input Check</span>
                  <span className={`text-[9px] uppercase font-bold tracking-widest ${micPermission === 'granted' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {micPermission === 'granted' ? 'Connected' : 'Awaiting Input'}
                  </span>
                </div>
                
                <div className="flex gap-[4px] h-3 items-end">
                  {Array.from({ length: 20 }).map((_, idx) => {
                    const threshold = (idx / 20) * 100;
                    const isActive = micVolume > threshold;
                    return (
                      <div 
                        key={idx} 
                        className={`flex-1 h-full rounded-full transition-all duration-100 ${
                          isActive 
                            ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' 
                            : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Please speak aloud. The indicator lights should react in real time.
                </p>
              </div>
            </div>

            {/* Right Side: Setup Options */}
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Settings</h2>

                {/* Language Select */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 block">Interview Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => {
                      const lang = e.target.value;
                      setSelectedLanguage(lang);
                      setSelectedVoice(voicesMap[lang][0].id);
                    }}
                    className="w-full bg-[#06060c]/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/40 hover:border-white/15 transition-colors cursor-pointer"
                  >
                    <option value="en-IN">English (India Accent)</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                  </select>
                </div>

                {/* Voice Select */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 block">AI Agent Voice Profile</label>
                  <div className="grid grid-cols-1 gap-2">
                    {voicesMap[selectedLanguage]?.map((voice) => {
                      const isSelected = selectedVoice === voice.id;
                      return (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-left text-xs transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.05)]' 
                              : 'bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.03]'
                          }`}
                        >
                          <span className="font-semibold">{voice.name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Speaker Sound Check */}
                <div className="space-y-2.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 block">Audio Sound Check</label>
                  <button
                    onClick={handleTestSpeaker}
                    disabled={isTestingSpeaker}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      speakerTested 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-white/5 border-white/8 hover:bg-white/10 text-white shadow-md'
                    }`}
                  >
                    {isTestingSpeaker ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-indigo-400" />
                        Testing Audio System...
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} className={speakerTested ? 'text-emerald-400' : 'text-slate-400'} />
                        {speakerTested ? 'System Calibrated (Recheck)' : 'Run Sound Test'}
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-slate-500 leading-snug">
                    * Plays voice check to initialize system autoplay.
                  </p>
                </div>
              </div>

              {/* Start Room Call Action */}
              <div className="pt-4">
                <button
                  disabled={micPermission !== 'granted' || !speakerTested}
                  onClick={handleStartInterview}
                  className={`w-full relative px-6 py-4.5 rounded-2xl text-xs font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    micPermission === 'granted' && speakerTested
                      ? 'shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-98'
                      : 'opacity-40 cursor-not-allowed bg-zinc-800/80 border border-zinc-700/80 text-zinc-500'
                  }`}
                  style={micPermission === 'granted' && speakerTested ? {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                  } : {}}
                >
                  <span>Start Placement Session</span>
                  <ArrowRight size={14} />
                </button>
                
                {micPermission !== 'granted' && (
                  <p className="text-center text-[10px] text-amber-500 mt-2 font-semibold tracking-wide">Microphone permission required.</p>
                )}
                {micPermission === 'granted' && !speakerTested && (
                  <p className="text-center text-[10px] text-indigo-400 mt-2 font-semibold tracking-wide">Audio sound test required.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#040408] overflow-hidden flex flex-col text-slate-200 z-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient backgrounds */}
      <div className="glow-spot-indigo top-[-10%] left-[-10%]" />
      <div className="glow-spot-emerald bottom-[-15%] right-[-10%]" />

      {/* ─── Page Header ─────────────────────────────────────────── */}
      <header className="h-15 border-b border-white/10 bg-[#06060c]/60 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-40">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-500 hidden sm:block">AI Placement Simulation</h1>
          <span className="text-white/10 hidden sm:block">|</span>
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider truncate max-w-[200px]">{engine.topic || 'Active Session'}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Timer Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 font-mono text-xs tracking-wider">
            <Clock size={13} className="text-slate-500" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Progress Tracker bar */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-28 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{questionIndex - 1} / 5 Qs</span>
          </div>

          {/* Mobile buttons */}
          <button
            onClick={() => setMobilePanel(mobilePanel === 'left' ? null : 'left')}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <User size={14} />
          </button>
          <button
            onClick={() => setMobilePanel(mobilePanel === 'right' ? null : 'right')}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <BarChart3 size={14} />
          </button>

          {/* End Interview */}
          <button
            onClick={handleFinishInterview}
            className="px-4 py-1.5.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
          >
            Finish Round
          </button>
        </div>
      </header>

      {/* ─── Error Notification ──────────────────────────────────── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 bg-red-500/15 border border-red-500/25 rounded-2xl p-4 max-w-md w-[calc(100%-32px)] z-50 shadow-2xl flex items-start gap-3.5 backdrop-blur-xl"
          >
            <AlertTriangle className="text-red-400 shrink-0 mt-0.5 animate-bounce" size={16} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-200 font-semibold leading-relaxed">{errorMsg}</p>
              <button onClick={() => setErrorMsg(null)} className="text-[10px] text-red-400 underline font-bold mt-1.5 cursor-pointer block">Dismiss Notification</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Room Workspace ─────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ─── Left Side: Recruiter Panel ──────────────────────────── */}
        <div className={`${mobilePanel === 'left' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative inset-y-15 left-0 z-30 md:z-auto w-72 md:w-72 lg:w-80 shrink-0 flex flex-col bg-[#06060a]/95 md:bg-[#06060a]/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recruiter Panel</span>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-bold uppercase tracking-wider">AI Representative</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
            {/* Dynamic backdrop glows matching state */}
            <div className={`absolute w-36 h-36 rounded-full blur-[45px] transition-all duration-700 pointer-events-none ${stateConfig.glow}`} />

            {/* Recruiter Avatar Orb */}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{ scale: engineState === 'speaking' ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border flex items-center justify-center transition-all duration-500 pointer-events-none ${stateConfig.border}`}
              >
                {/* Rotating gradient glowing ring */}
                <motion.div
                  className="absolute -inset-[2px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute inset-[2px] rounded-full bg-[#06060c] z-0" />
                <User size={36} className="text-slate-200 opacity-80 relative z-10" />

                {/* Pulsing state visual rings */}
                {(engineState === 'speaking' || engineState === 'listening') && (
                  <>
                    <span className={`absolute inset-0 rounded-full border opacity-25 animate-ping ${engineState === 'listening' ? 'border-emerald-400' : 'border-indigo-400'}`} style={{ animationDuration: '1.8s' }} />
                    <span className={`absolute -inset-3 rounded-full border opacity-15 animate-pulse ${engineState === 'listening' ? 'border-emerald-400' : 'border-indigo-400'}`} />
                  </>
                )}
              </motion.div>

              {/* Animated Thinking progress dots */}
              {isProcessing && (
                <div className="absolute -bottom-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase tracking-widest animate-pulse z-20 backdrop-blur-md">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span>Thinking</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 relative z-10">
              <h3 className="font-bold text-white text-sm tracking-tight capitalize">Recruiter {selectedVoice}</h3>
              <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">{stateConfig.label}</p>
            </div>

            {/* Speaking Waveforms */}
            <div className="h-8 w-full flex items-center justify-center gap-[4px] px-4 relative z-10">
              {waveformBars.map((_, i) => (
                <WaveformBar
                  key={i}
                  index={i}
                  isActive={engineState === 'speaking' || engineState === 'listening'}
                  color={stateConfig.waveColor}
                />
              ))}
            </div>

            {/* Live Question Card */}
            {activeQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full px-1"
              >
                <div className="glass-panel border-white/5 rounded-2xl p-4 relative text-left">
                  <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 block">Vocal Scenario</span>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 font-medium italic">"{activeQuestion}"</p>
                  
                  <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/5">
                    <button
                      onClick={handleReplayQuestion}
                      className="flex items-center gap-1.5 text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={engineState === 'speaking' || isProcessing}
                    >
                      <Volume2 size={12} /> Replay
                    </button>
                    {engineState === 'speaking' && (
                      <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-md border border-indigo-500/25 animate-pulse uppercase tracking-wider">Narration</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Progress details & Navigation Map */}
          <div className="p-4 bg-[#06060c]/60 border-t border-white/5 shrink-0 space-y-4">
            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Question Progression</span>
              <span className="text-white font-bold">{Math.min(5, questionIndex)} / 5</span>
            </div>
            
            {/* Visual Node Sequence Mapping */}
            <div className="flex items-center justify-between relative px-2.5 py-1">
              <div className="absolute top-1/2 left-[18px] right-[18px] h-0.5 bg-white/5 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-[18px] h-0.5 bg-indigo-500/50 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, ((Math.min(5, questionIndex) - 1) / 4) * 100))}%` }} />

              {[1, 2, 3, 4, 5].map((num) => {
                const isCompleted = num < questionIndex;
                const isActive = num === questionIndex;
                return (
                  <div key={num} className="relative z-10 flex flex-col items-center">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.12, 1], borderColor: ['#6366f1', '#a855f7', '#6366f1'] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                          : isActive
                            ? 'bg-[#06060c] border-indigo-500 text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.35)]'
                            : 'bg-[#06060c] border-white/5 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : num}
                    </motion.div>
                    <span className="text-[7px] text-slate-500 font-mono mt-1">Q{num}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Center: Chat Workspace ──────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-[#040408]/30">

          {/* Transcript/Dialog messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5" style={{ scrollbarWidth: 'thin' }}>
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 size={24} className="text-indigo-500" />
                </motion.div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Booting AI Stream...</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <HelpCircle size={13} />
                      </div>
                    )}
                    <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4.5 py-3.5 text-xs leading-relaxed border shadow-md font-medium ${
                      isUser
                        ? 'bg-[#10b981]/5 border-[#10b981]/20 text-emerald-300 rounded-tr-sm'
                        : 'bg-white/[0.02] border-white/8 text-slate-300 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <User size={13} />
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}

            {/* Waiting indicator */}
            {(engineState === 'generating_next' || engineState === 'scoring') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-slate-400 shrink-0 animate-pulse">
                  <MessageSquare size={13} />
                </div>
                <div className="glass-panel rounded-2xl px-4 py-3.5 flex gap-1.5 items-center rounded-tl-sm border-white/5 bg-[#06060a]/40">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom action controls */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#06060c]/60 backdrop-blur-xl shrink-0">
            <div className="flex flex-col items-center gap-4">
              {/* Voice state status banner */}
              <div className="text-center">
                {engineState === 'listening' ? (
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {isMicMuted ? "Audio Input Muted" : "Stream Active — Respond verbally now"}
                  </p>
                ) : engineState === 'speaking' ? (
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    Recruiter narrating scenario
                  </p>
                ) : isProcessing ? (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 justify-center">
                    <Loader2 size={12} className="animate-spin text-indigo-400" /> Adapting next question...
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Calibrated</p>
                )}
              </div>

              {/* Float controls bar */}
              <div className="flex items-center gap-5">
                {/* Mute Button */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleMuteToggle}
                  disabled={engineState !== 'listening'}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    engineState !== 'listening'
                      ? 'bg-white/[0.01] border-white/5 text-slate-700 cursor-not-allowed'
                      : isMicMuted
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                  title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMicMuted ? <VolumeX size={18} /> : <MicOff size={18} />}
                </motion.button>

                {/* Core Speak/Check CTA */}
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleMicToggle}
                  disabled={isProcessing}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center border shadow-2xl transition-all duration-500 cursor-pointer ${
                    engineState === 'listening'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]'
                      : engineState === 'speaking'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                        : isProcessing
                          ? 'bg-zinc-800/40 text-zinc-600 border-zinc-700 cursor-not-allowed'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {engineState === 'listening' && (
                    <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-35" />
                  )}
                  {engineState === 'listening' ? <Check size={26} /> : <Mic size={26} />}
                </motion.button>

                {/* Replay voice narration */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleReplayQuestion}
                  disabled={engineState === 'speaking' || isProcessing || !activeQuestion}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    engineState === 'speaking' || isProcessing || !activeQuestion
                      ? 'bg-white/[0.01] border-white/5 text-slate-700 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                  }`}
                  title="Replay Recruiter voice"
                >
                  <Volume2 size={18} />
                </motion.button>
              </div>

              <p className="text-[10px] text-slate-500 font-bold tracking-wide">
                {engineState === 'listening' 
                  ? 'Click check mark button when finished speaking' 
                  : engineState === 'speaking' 
                    ? 'Wait for scenario narration' 
                    : 'System active'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Right Side: Candidate Panel ──────────────────────────── */}
        <div className={`${mobilePanel === 'right' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} fixed md:relative inset-y-15 right-0 z-30 md:z-auto w-72 md:w-72 lg:w-80 shrink-0 flex flex-col bg-[#06060a]/95 md:bg-[#06060a]/50 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 overflow-hidden`}>
          <div className="p-4 border-b border-white/5 shrink-0 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Candidate Panel</span>
            <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold uppercase">Online</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5.5 space-y-6" style={{ scrollbarWidth: 'thin' }}>
            {/* Webcam Feed Frame */}
            {devicesStream && devicesStream.getVideoTracks().length > 0 ? (
              <div className="aspect-video bg-[#06060c] border border-white/10 rounded-2xl relative overflow-hidden shadow-xl">
                <video 
                  ref={candidateVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]" 
                />
                
                {/* Tech scanline visual lines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-45 z-10" />

                {/* Overlay widgets on camera feed */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center z-20 pointer-events-none">
                  {/* Eye Contact Indicator */}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border flex items-center gap-1 backdrop-blur-md transition-all ${
                    eyeContact === 'FOCUSED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${eyeContact === 'FOCUSED' ? 'bg-emerald-400 shadow-[0_0_4px_#10b981]' : 'bg-amber-400 animate-ping'}`} />
                    EYE: {eyeContact}
                  </span>

                  {/* Emotion Indicator */}
                  <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[8px] font-bold flex items-center gap-1 backdrop-blur-md shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                    <Sparkles size={8} /> {currentEmotion}
                  </span>
                </div>

                {/* Device indicators overlay at bottom */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-20 pointer-events-none">
                  {/* Mic status badge */}
                  <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold border flex items-center gap-1 backdrop-blur-md ${
                    isMicMuted ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {isMicMuted ? 'MIC: OFF' : 'MIC: ON'}
                  </span>
                  
                  {/* Camera status badge */}
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[7px] font-bold flex items-center gap-1 backdrop-blur-md">
                    CAM: ACTIVE
                  </span>

                  {/* Latency badge */}
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[7px] font-bold flex items-center gap-1 backdrop-blur-md">
                    {latency}ms
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 text-[8px] text-indigo-400 font-bold uppercase tracking-widest border border-white/5 z-20">
                  Webcam Feed
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
                <Camera size={22} className="mb-2 text-slate-600 relative z-10 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider relative z-10 text-slate-500">Video Signal Disabled</span>
              </div>
            )}

            {/* Mic Signal Decibel tracker */}
            <div className="flex items-center justify-between glass-panel border-white/5 rounded-2xl p-4.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  engineState === 'listening' 
                    ? isMicMuted ? 'bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]' : 'bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]' 
                    : 'bg-zinc-600'
                }`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {isMicMuted ? 'Muted' : 'Audio Feed'}
                </span>
              </div>
              <AudioLevelBars isActive={engineState === 'listening' && !isMicMuted} />
            </div>

            {/* Performance Indicators */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Session Diagnostics</span>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Accuracy" value={`${metrics.accuracy}%`} />
                <MetricCard label="Vocal Speed" value={metrics.wpm} unit="WPM" />
                <MetricCard label="Fluency" value={`${metrics.fluency}%`} />
                <MetricCard label="Filler words" value={metrics.fillers} />
              </div>
              
              {/* Real-time speaking pacing speedometer */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Real-Time Pacing Rate</span>
                  <span className={metrics.wpm >= 110 && metrics.wpm <= 150 ? "text-emerald-400" : metrics.wpm === 0 ? "text-slate-500" : "text-amber-400"}>
                    {metrics.wpm === 0 ? "Awaiting Input" : metrics.wpm >= 110 && metrics.wpm <= 150 ? "Optimal Pacing" : "Adjust Speed"}
                  </span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="absolute top-0 bottom-0 left-[35%] w-[45%] bg-emerald-500/10 border-l border-r border-emerald-500/20" />
                  <motion.div 
                    className="absolute top-0 bottom-0 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_6px_#6366f1]"
                    animate={{ 
                      left: `${Math.min(96, Math.max(4, metrics.wpm === 0 ? 50 : (metrics.wpm / 200) * 100))}%` 
                    }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                </div>
                <div className="flex justify-between text-[7px] text-slate-500 font-bold uppercase font-mono">
                  <span>Slow (90)</span>
                  <span>Optimal (125)</span>
                  <span>Fast (160)</span>
                </div>
              </div>

              <div className="mt-2.5">
                <MetricCard label="Response Latency" value={`${(metrics.latency / 1000).toFixed(1)}s`} subtitle="AI latency measurement" />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center justify-between w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 cursor-pointer hover:text-slate-400 transition-colors"
              >
                <span className="flex items-center gap-2"><Pencil size={11} className="text-indigo-400" /> Scratch Notes</span>
                {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Jot down formulas or key system blocks here..."
                      className="w-full h-32 bg-[#06060c]/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/30 transition-colors shadow-inner"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile background panel overlay */}
      {mobilePanel && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm" onClick={() => setMobilePanel(null)} />
      )}
    </div>
  );
}

