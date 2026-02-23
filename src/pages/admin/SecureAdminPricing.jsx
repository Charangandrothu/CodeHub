import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, LogOut, ArrowLeft, Shield, DollarSign, Activity } from 'lucide-react';
import { API_URL } from '../../config';

const SecureAdminPricing = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Auth Headers
    const token = localStorage.getItem('admin_access_token');
    const csrfToken = localStorage.getItem('admin_csrf_token');

    useEffect(() => {
        if (!token) {
            navigate('/secure-admin-portal');
            return;
        }
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/pricing/plans`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-csrf-token': csrfToken
                }
            });
            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                // Token expired or invalid
                handleLogout();
                return;
            }

            if (data.success) {
                setPlans(data.plans);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_csrf_token');

        try {
            await fetch(`${API_URL}/api/admin/auth/logout`, { method: 'POST' });
        } catch (e) { }

        navigate('/secure-admin-portal');
    };

    const handlePriceChange = (planId, field, value) => {
        setPlans(plans.map(p => {
            if (p.id === planId) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const savePlan = async (plan) => {
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch(`${API_URL}/api/admin/pricing/plans/${plan.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-csrf-token': csrfToken
                },
                body: JSON.stringify({
                    monthly_inr_base: plan.monthly_inr_base,
                    monthly_inr_offer: plan.monthly_inr_offer,
                    yearly_inr_base: plan.yearly_inr_base,
                    yearly_inr_offer: plan.yearly_inr_offer,
                    monthly_usd_base: plan.monthly_usd_base,
                    monthly_usd_offer: plan.monthly_usd_offer,
                    yearly_usd_base: plan.yearly_usd_base,
                    yearly_usd_offer: plan.yearly_usd_offer,
                })
            });

            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                handleLogout();
                return;
            }

            if (data.success) {
                setMessage({ text: `✅ ${plan.name} Plan updated successfully! Changes go live globally instantly.`, type: 'success' });
            } else {
                setMessage({ text: '❌ Failed to save plan.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: '❌ Network connection error.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#06080d] flex items-center justify-center text-white font-mono">ESTABLISHING SECURE CONNECTION...</div>;

    return (
        <div className="min-h-screen bg-[#06080d] text-white font-sans p-6">

            {/* Header */}
            <header className="max-w-6xl mx-auto flex items-center justify-between py-6 border-b border-white/5 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                        <Shield className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">CodeHub Pricing Control</h1>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <Activity size={14} className="text-emerald-400 animate-pulse" /> Secure Admin Session Active
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <LogOut size={16} /> Terminate Session
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto">

                {message.text && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 mb-8 rounded-xl border font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {message.text}
                    </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-[#111622] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-xl">

                            {/* Accent Bar */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${plan.id === 'pro' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold capitalize flex items-center gap-2">
                                    {plan.name} Tier
                                </h2>
                                <span className="bg-white/5 px-3 py-1 text-xs rounded-full font-mono text-gray-400 uppercase tracking-widest">{plan.id} API</span>
                            </div>

                            <div className="space-y-6">
                                {/* INR Section */}
                                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 border-b border-white/5 pb-2">
                                        🇮🇳 INDIAN RUPEE (Paise)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2 font-semibold">Monthly Billing</label>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Base (MRP)</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.monthly_inr_base || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'monthly_inr_base', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-gray-400 font-mono focus:border-red-500 focus:outline-none strike-through line-through"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest pl-1">Offer Price</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.monthly_inr_offer || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'monthly_inr_offer', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-emerald-500/30 rounded-lg pl-8 pr-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1 block">Calculated: ₹{plan.monthly_inr_offer / 100}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2 font-semibold">Yearly Billing</label>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Base (MRP)</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.yearly_inr_base || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'yearly_inr_base', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-gray-400 font-mono focus:border-red-500 focus:outline-none strike-through line-through"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest pl-1">Offer Price</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.yearly_inr_offer || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'yearly_inr_offer', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-emerald-500/30 rounded-lg pl-8 pr-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1 block">Calculated: ₹{plan.yearly_inr_offer / 100}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* USD Section */}
                                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 border-b border-white/5 pb-2">
                                        🇺🇸 US DOLLAR (Cents)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2 font-semibold">Monthly Billing</label>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Base (MRP)</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.monthly_usd_base || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'monthly_usd_base', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-gray-400 font-mono focus:border-red-500 focus:outline-none strike-through line-through"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest pl-1">Offer Price</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.monthly_usd_offer || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'monthly_usd_offer', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-emerald-500/30 rounded-lg pl-8 pr-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1 block">Calculated: ${(plan.monthly_usd_offer / 100).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-2 font-semibold">Yearly Billing</label>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Base (MRP)</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.yearly_usd_base || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'yearly_usd_base', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-gray-400 font-mono focus:border-red-500 focus:outline-none strike-through line-through"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-emerald-500 uppercase tracking-widest pl-1">Offer Price</span>
                                                    <div className="relative">
                                                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                        <input
                                                            type="number"
                                                            value={plan.yearly_usd_offer || 0}
                                                            onChange={e => handlePriceChange(plan.id, 'yearly_usd_offer', e.target.value)}
                                                            className="w-full bg-[#0a0d14] border border-emerald-500/30 rounded-lg pl-8 pr-3 py-2 text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-500 mt-1 block">Calculated: ${(plan.yearly_usd_offer / 100).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => savePlan(plan)}
                                disabled={saving}
                                className={`w-full mt-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.id === 'pro' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'}`}
                            >
                                <Save size={18} /> Deploy {plan.name} Pricing
                            </button>

                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
};

export default SecureAdminPricing;
