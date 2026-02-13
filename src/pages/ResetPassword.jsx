import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebase';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const oobCode = searchParams.get('oobCode');

    // UI States
    const [password, setPassword] = useState('');
    const [confirmAsync, setConfirmAsync] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Verify the reset code on mount
    useEffect(() => {
        const verifyCode = async () => {
            if (!oobCode) {
                setError("Invalid or missing reset code.");
                setIsVerifying(false);
                return;
            }

            try {
                const userEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(userEmail);
                setIsVerifying(false);
            } catch (err) {
                console.error("Invalid Code Error:", err);
                setError("This password reset link is invalid or has expired.");
                setIsVerifying(false);
            }
        };

        verifyCode();
    }, [oobCode]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (password !== confirmAsync) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsSubmitting(false);
            return;
        }

        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error("Reset Password Error:", err);
            setError("Failed to reset password. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-blue-500 animate-spin" />
                    <p className="text-gray-400 text-sm">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    if (error && !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-black font-medium py-2 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Return to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
            >
                {success ? (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 size={40} className="text-green-500" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                        <p className="text-gray-400 mb-6">Your password has been successfully updated. Redirecting to login...</p>
                        <Loader2 size={24} className="text-blue-500 animate-spin mx-auto" />
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                            <p className="text-gray-400 text-sm">
                                Enter a new password for <span className="text-white font-medium">{email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-5">
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

                            {/* Password Field */}
                            <div className="space-y-1.5 group">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-1.5 group">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmAsync}
                                        onChange={(e) => setConfirmAsync(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group mt-6"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Updating Password...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Reset Password</span>
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
            <style>{`
                @keyframes sweep {
                  0% { transform: translateX(-100%) skewX(-15deg); }
                  100% { transform: translateX(200%) skewX(-15deg); }
                }
            `}</style>
        </section>
    );
};

export default ResetPassword;
