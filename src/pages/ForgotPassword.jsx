import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(''); // Success message
    const [error, setError] = useState(''); // Error message

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        if (!email) {
            setError("Please enter your email address.");
            setIsLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset link sent! Check your inbox.');
            setEmail(''); // Clear text field on success
        } catch (err) {
            console.error("Forgot Password Error:", err);
            if (err.code === 'auth/user-not-found') {
                setError("No account found with this email.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-12">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80"
            >
                <div className="absolute inset-0 -z-10 rounded-3xl ring-1 ring-white/5 pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Reset Password</h1>
                        <p className="text-gray-400 text-sm">Enter your email to receive a password reset link.</p>
                    </motion.div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">

                    {/* Status Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-xl p-3 flex items-center gap-3"
                        >
                            <AlertCircle size={18} className="text-red-500 shrink-0" />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-500/10 border border-green-500/20 text-green-200 text-sm rounded-xl p-3 flex items-center gap-3"
                        >
                            <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                            <p>{message}</p>
                        </motion.div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1.5 group">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 group-focus-within:text-blue-400 transition-colors">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                                placeholder="name@gmail.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_ease-in-out_infinite]" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Sending Link...</span>
                                </>
                            ) : (
                                <span>Send Reset Link</span>
                            )}
                        </span>
                    </button>

                    {/* Back to Login */}
                    <div className="text-center mt-6">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </form>
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

export default ForgotPassword;
