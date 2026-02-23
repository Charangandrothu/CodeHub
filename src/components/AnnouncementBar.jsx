import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { API_URL } from '../config';

const AnnouncementBar = () => {
    const { userData } = useAuth();
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const barRef = useRef(null);
    const location = useLocation();

    // Check if we are on the question page to hide the announcement entirely
    const isQuestionPage = location.pathname.startsWith('/problem/');

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                // Fetch active announcement from backend
                const res = await fetch(`${API_URL}/api/announcements/active`);
                if (!res.ok) return;

                const data = await res.json();
                if (!data) return;

                // Dismissal logic removed so it reappears on refresh

                // Role Logic from userData (MongoDB)
                const userRole = userData?.role || 'user';
                const isPro = userData?.isPro || false;
                const isAdmin = userRole === 'admin';
                const isElite = userRole === 'elite';

                let shouldShow = false;

                if (data.audience === 'all') {
                    shouldShow = true;
                } else if (data.audience === 'free') {
                    if (!isPro && !isElite) shouldShow = true;
                } else if (data.audience === 'pro') {
                    if (isPro || isElite) shouldShow = true;
                } else if (data.audience === 'elite') {
                    if (isElite) shouldShow = true;
                }

                // Admin Override: Always show active announcement to admins for testing
                if (isAdmin) shouldShow = true;

                if (shouldShow) {
                    setAnnouncement(data);
                } else {
                    // If no announcement matches, clear it (in case we had one before)
                    setAnnouncement(null);
                }

            } catch (err) {
                console.error("Failed to fetch announcement", err);
            }
        };

        fetchAnnouncement();

        // Poll every 60 seconds
        const interval = setInterval(fetchAnnouncement, 60000);
        return () => clearInterval(interval);

    }, [userData]);

    // Manage CSS variable for Navbar offset
    useEffect(() => {
        if (isVisible && announcement && !isQuestionPage && barRef.current) {
            const height = barRef.current.offsetHeight;
            document.documentElement.style.setProperty('--announcement-height', `${height}px`);
        } else {
            document.documentElement.style.setProperty('--announcement-height', '0px');
        }

        return () => {
            document.documentElement.style.setProperty('--announcement-height', '0px');
        }
    }, [isVisible, announcement, isQuestionPage]);

    if (!announcement || !isVisible || isQuestionPage) return null;

    const handleDismiss = () => {
        setIsVisible(false);
    };

    // Role-based Glassmorphism Theme
    const isElite = userData?.isElite;
    const isPro = userData?.isPro;

    const glassStyle = isElite
        ? "bg-emerald-950/40 backdrop-blur-xl text-emerald-50"
        : isPro
            ? "bg-blue-950/40 backdrop-blur-xl text-blue-50"
            : "bg-[#050505]/40 backdrop-blur-xl text-zinc-100";

    const glowStyle = isElite
        ? "bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        : isPro
            ? "bg-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            : "bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]";

    const btnStyle = isElite
        ? "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30"
        : isPro
            ? "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30"
            : "bg-white/10 hover:bg-white/20 border-white/20";

    // Icons
    const Icons = {
        offer: Sparkles,
        maintenance: AlertTriangle,
        feature: Megaphone,
        alert: Info
    };
    const Icon = Icons[announcement.type] || Info;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={barRef}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onAnimationComplete={() => {
                        if (barRef.current && isVisible) {
                            const height = barRef.current.offsetHeight;
                            document.documentElement.style.setProperty('--announcement-height', `${height}px`);
                        }
                    }}
                    className={`fixed top-0 left-0 right-0 z-[60] ${glassStyle} overflow-hidden shadow-2xl`}
                >
                    <div className="max-w-7xl mx-auto px-4 py-1 sm:py-1.5 flex items-center justify-between gap-3 relative z-10">

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-center gap-2 text-center text-[10px] sm:text-xs font-medium tracking-wide">
                            <Icon size={14} className="opacity-90 hidden sm:block animate-pulse" />
                            <span>{announcement.message}</span>

                            {/* CTA */}
                            {announcement.ctaText && announcement.ctaLink && (
                                <Link
                                    to={announcement.ctaLink}
                                    className={`ml-2 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold transition-all border whitespace-nowrap ${btnStyle}`}
                                >
                                    {announcement.ctaText} &rarr;
                                </Link>
                            )}
                        </div>

                        {/* Dismiss */}
                        <button
                            onClick={handleDismiss}
                            className="p-0.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
                            aria-label="Dismiss"
                        >
                            <X size={12} />
                        </button>
                    </div>

                    {/* Bottom Glow Border */}
                    <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${glowStyle}`} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementBar;
