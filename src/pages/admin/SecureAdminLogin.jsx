import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const SecureAdminLogin = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // We navigate them specifically to the secure pricing dashboard if successful
    const navigate = useNavigate();

    const handleLoginStepOne = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else if (data.step === 2) {
                setStep(2);
            }
        } catch (err) {
            setError("Internal Server Connection Error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/admin/auth/login/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else if (data.accessToken) {
                // Here we store the short-lived access token strictly
                // Refresh token is automatically stored in HttpOnly cookies
                localStorage.setItem('admin_access_token', data.accessToken);
                localStorage.setItem('admin_csrf_token', data.csrfToken);

                // Immediately navigate to the secure pricing interface!
                navigate('/secure-admin/pricing');
            }
        } catch (err) {
            setError("OTP Verification Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#06080d] flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Lock Icon Header */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-[#1a1f2e] border border-red-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-2xl" />
                        <ShieldCheck className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">CodeHub Sentinel</h1>
                    <p className="text-red-400 mt-2 text-sm font-medium">RESTRICTED SYSTEMS ACCESS PROTOCOL</p>
                </div>

                <div className="bg-[#0f141e] border border-white/5 p-8 rounded-[24px] shadow-2xl relative overflow-hidden">

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleLoginStepOne} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 pl-1 flex items-center gap-2">
                                    <Mail size={14} /> Admin Identifier
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 pl-1 flex items-center gap-2">
                                    <Lock size={14} /> Authorization Key
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                                    placeholder="••••••••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? 'AUTHENTICATING...' : 'INITIATE HANDSHAKE'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                    <KeyRound className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Two-Factor Authentication</h3>
                                <p className="text-gray-400 text-sm mt-2">
                                    An encrypted 6-digit OTP has been dispatched to your secure email.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[1em] focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all font-mono placeholder:tracking-normal placeholder:text-gray-600 placeholder:text-lg"
                                    placeholder="Enter OTP"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-gray-500 hover:text-white text-sm transition-colors mt-4"
                            >
                                Cancel & Return
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SecureAdminLogin;
