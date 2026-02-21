import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const AnnouncementBar = () => {
    const { userData } = useAuth();
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const barRef = useRef(null);

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
        if (isVisible && announcement && barRef.current) {
            const height = barRef.current.offsetHeight;
            document.documentElement.style.setProperty('--announcement-height', `${height}px`);
        } else {
            document.documentElement.style.setProperty('--announcement-height', '0px');
        }

        return () => {
            document.documentElement.style.setProperty('--announcement-height', '0px');
        }
    }, [isVisible, announcement]);

    if (!announcement || !isVisible) return null;

    const handleDismiss = () => {
        setIsVisible(false);
    };

    // Style Types
    const styles = {
        blue: "from-blue-600 via-indigo-600 to-blue-600",
        red: "from-red-600 via-red-500 to-red-600",
        green: "from-emerald-600 via-green-500 to-emerald-600",
        purple: "from-purple-600 via-pink-600 to-purple-600",
        // Default
        default: "from-blue-600 via-indigo-600 to-blue-600"
    };

    const gradientClass = styles[announcement.bgStyle] || styles.default;

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
                    className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r ${gradientClass} text-white overflow-hidden shadow-lg`}
                >
                    <div className="max-w-7xl mx-auto px-4 py-1 sm:py-1.5 flex items-center justify-between gap-3">

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-center gap-2 text-center text-[10px] sm:text-xs font-medium tracking-wide">
                            <Icon size={14} className="text-white/90 hidden sm:block animate-pulse" />
                            <span>{announcement.message}</span>

                            {/* CTA */}
                            {announcement.ctaText && announcement.ctaLink && (
                                <Link
                                    to={announcement.ctaLink}
                                    className="ml-2 px-2.5 py-0.5 bg-white/20 hover:bg-white/30 rounded-full text-[9px] sm:text-[10px] font-bold transition-all border border-white/20 whitespace-nowrap"
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
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementBar;
