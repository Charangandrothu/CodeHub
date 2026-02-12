import React, { useState, useEffect, useRef } from 'react';
import { updateProfile, updatePassword } from "firebase/auth";
import { auth } from '../firebase';
import { checkUsernameExists, completeUserProfile } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Key, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, ArrowRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompleteProfile = () => {
    const { currentUser, userData, refreshUserData } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(null); // null = nothing, true = available, false = taken
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Use a ref to store the timeout ID for debouncing
    const debounceTimeout = useRef(null);

    useEffect(() => {
        // If user is already verified and has completed profile, redirect to their profile page
        if (userData?.profileCompleted && userData?.username) {
            navigate(`/${userData.username}`);
        }
    }, [userData, navigate]);

    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase().trim();
        setUsername(val);
        // Reset state while typing
        setUsernameAvailable(null);
        setError('');
        setIsCheckingUsername(false);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (!val) return;

        if (val.length < 3) {
            return;
        }

        setIsCheckingUsername(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const exists = await checkUsernameExists(val);
                setUsernameAvailable(!exists); // If exists is true, available is false
            } catch (err) {
                console.error("Error checking username:", err);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 800); // Wait 800ms after typing stops
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (usernameAvailable !== true) {
            setError(usernameAvailable === false ? "Username is already taken" : "Please enter a valid username");
            return;
        }

        setIsLoading(true);

        try {
            // Check again on submit just in case
            if (usernameAvailable === null) {
                const exists = await checkUsernameExists(username);
                if (exists) {
                    setUsernameAvailable(false);
                    setError("Username is already taken");
                    setIsLoading(false);
                    return;
                }
            }
            // 1. Update Auth Profile (Display Name) - If needed
            if (currentUser) {
                // Update Password if provided (Firebase requires this separate call)
                // Note: This might require re-authentication if it's been a while, but for new signups it should work.
                // Update Password if provided
                // This will link the password provider to the account if not already present
                await updatePassword(currentUser, password);

                await updateProfile(currentUser, { displayName: username });
            }

            // 2. Update Backend / Database
            await completeUserProfile(currentUser.uid, { username });

            // 3. Refresh Context to get updated marks
            await refreshUserData();

            navigate(`/${username}`);
        } catch (err) {
            console.error("Error completing profile:", err);
            setError(err.message || "Failed to complete profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate password strength
    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length > 5) score += 1;
        if (pass.length > 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // 0 to 5
    };

    const strength = getPasswordStrength(password);
    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';
    const strengthText = strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden px-4 pt-24 pb-12">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Glassmorphic Container */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow-2xl rounded-3xl overflow-hidden relative">

                    {/* Header Section */}
                    <div className="relative p-6 pb-2 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Sparkles className="text-blue-400" size={24} />
                        </div>
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Final Step</h1>
                            <p className="text-gray-400">Secure your account with a unique username & password.</p>
                        </motion.div>
                    </div>

                    <div className="p-6 pt-4 space-y-4">
                        {/* Avatar / Identity Preview (Optional Touch) */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
                                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                                        <img
                                            src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${username || 'dev'}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username || 'dev'}`;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full border-4 border-[#0a0a0a]">
                                    <ShieldCheck size={12} className="text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl p-3 flex items-center gap-3"
                                    >
                                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                                        <p>{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Username Input */}
                            <div className="space-y-2 group">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-400 transition-colors">
                                    Choose Username
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={handleUsernameChange} // Now correctly debounced
                                        className={`w-full bg-black/20 border-2 rounded-xl py-3.5 pl-12 pr-10 text-white font-medium placeholder:text-gray-600 focus:outline-none transition-all duration-300
                                            ${usernameAvailable === false
                                                ? 'border-red-500/30 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                                                : usernameAvailable === true
                                                    ? 'border-green-500/30 focus:border-green-500/50 focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                                    : 'border-white/5 focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                            }
                                        `}
                                        placeholder="username"
                                        autoComplete="off"
                                    />
                                    {/* Username Status Indicator */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {isCheckingUsername ? (
                                            <Loader2 size={18} className="animate-spin text-blue-500" />
                                        ) : usernameAvailable === true ? (
                                            <CheckCircle2 size={18} className="text-green-500 animate-in zoom-in spin-in-90 duration-300" />
                                        ) : usernameAvailable === false ? (
                                            <XCircle size={18} className="text-red-500 animate-in zoom-in duration-300" />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="min-h-[20px] px-1">
                                    {usernameAvailable === false && (
                                        <p className="text-xs text-red-400 font-medium animate-in fade-in slide-in-from-top-1">Username is already taken.</p>
                                    )}
                                    {usernameAvailable === true && (
                                        <p className="text-xs text-green-400 font-medium animate-in fade-in slide-in-from-top-1">Username is available!</p>
                                    )}
                                </div>
                            </div>

                            {/* Password Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/20 border-2 border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
                                        Confirm
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/20 border-2 border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white font-medium placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password Strength Meter */}
                            {password.length > 0 && (
                                <div className="space-y-1.5 px-1 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-medium">Strength: <span className={`${strengthColor.replace('bg-', 'text-')}`}>{strengthText}</span></span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(strength / 5) * 100}%` }}
                                            className={`h-full rounded-full ${strengthColor}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading || !usernameAvailable || !password || !confirmPassword}
                                    className="group relative w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>Setting up...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Get Started</span>
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 rounded-xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </button>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    By continuing, you agree to our Terms of Service & Privacy Policy.
                                </p>
                            </div>

                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CompleteProfile;
