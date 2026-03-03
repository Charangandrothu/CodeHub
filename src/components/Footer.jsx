import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Mail, ArrowRight, Github, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import logo_img from '../assets/logo_img.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const footerLinks = {
        product: [
            { name: 'Features', path: '/#features' },
            { name: 'Pricing', path: '/#pricing' },
            { name: 'Articles & Guides', path: '/articles' },
            { name: 'Mock Tests', path: null, badge: 'Soon' },
        ],
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'Careers', path: null, badge: 'Hiring' },
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy-policy' },
            { name: 'Terms & Conditions', path: '/terms-and-conditions' },
            { name: 'Disclaimer', path: '/disclaimer' },
        ]
    };

    const handleInternalLink = (e, path) => {
        if (path && path.startsWith('/#')) {
            e.preventDefault();
            const id = path.substring(2);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/');
                setTimeout(() => {
                    const delayedElement = document.getElementById(id);
                    if (delayedElement) delayedElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setTimeout(() => {
                setSubscribed(false);
                setEmail('');
            }, 3000);
        }
    };

    return (
        <footer className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-b from-transparent to-[#05060A]">
            {/* Animated Glow Behind Footer */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/20 blur-[120px] pointer-events-none" />

            {/* Floating Glass Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="relative rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">

                    {/* Animated Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-80" />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                        className="absolute top-0 left-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 p-10 lg:p-14">

                        {/* Brand Column */}
                        <div className="lg:col-span-4 flex flex-col justify-between">
                            <div>
                                <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={logo_img}
                                            alt="CodeHubX"
                                            className="w-10 h-10 rounded-xl shadow-lg border border-white/10 relative z-10 group-hover:scale-105 transition-transform duration-300 object-cover"
                                        />
                                    </div>
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight">
                                        CodeHubX
                                    </span>
                                </Link>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                                    Engineering simplicity at scale. High-performance preparation, analytics, and execution platform.
                                </p>
                            </div>

                            {/* Newsletter */}
                            <div className="mt-8">
                                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Mail size={16} className="text-indigo-400" /> Stay Updated
                                </h4>
                                <form onSubmit={handleSubscribe} className="relative max-w-sm group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative flex items-center bg-white/[0.03] border border-white/[0.1] rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:bg-white/[0.05] transition-all">
                                        <input
                                            type="email"
                                            placeholder="Enter your email" required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-3 bg-white/[0.05] hover:bg-white/[0.1] border-l border-white/[0.1] text-indigo-300 hover:text-white transition-colors"
                                        >
                                            {subscribed ? <Sparkles size={18} className="text-emerald-400 animate-pulse" /> : <ArrowRight size={18} />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Navigation Columns */}
                        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
                            {/* Product */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-6 tracking-wide">Product</h3>
                                <ul className="space-y-4">
                                    {footerLinks.product.map(link => (
                                        <li key={link.name}>
                                            {link.path ? (
                                                <Link
                                                    to={link.path}
                                                    onClick={(e) => handleInternalLink(e, link.path)}
                                                    className="group relative inline-flex text-sm text-gray-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    <span className="relative z-10">{link.name}</span>
                                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-400/50 group-hover:w-full transition-all duration-300" />
                                                </Link>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm text-gray-500 cursor-not-allowed">
                                                    {link.name}
                                                    {link.badge && (
                                                        <span className="text-[10px] font-medium text-emerald-400/70 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Company */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-6 tracking-wide">Company</h3>
                                <ul className="space-y-4">
                                    {footerLinks.company.map(link => (
                                        <li key={link.name}>
                                            {link.path ? (
                                                <Link
                                                    to={link.path}
                                                    className="group relative inline-flex text-sm text-gray-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    <span className="relative z-10">{link.name}</span>
                                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-400/50 group-hover:w-full transition-all duration-300" />
                                                </Link>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm text-gray-500 cursor-not-allowed">
                                                    {link.name}
                                                    {link.badge && (
                                                        <span className="text-[10px] font-medium text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                            {link.badge}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal */}
                            <div className="col-span-2 md:col-span-1">
                                <h3 className="text-sm font-semibold text-white mb-6 tracking-wide">Legal</h3>
                                <ul className="space-y-4">
                                    {footerLinks.legal.map(link => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.path}
                                                className="group relative inline-flex text-sm text-gray-400 hover:text-indigo-300 transition-colors"
                                            >
                                                <span className="relative z-10">{link.name}</span>
                                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-indigo-400/50 group-hover:w-full transition-all duration-300" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="px-10 py-6 border-t border-white/[0.05] bg-white/[0.01]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-500 font-medium tracking-wide">
                                © {currentYear} CodeHubX Inc. All rights reserved.
                            </p>

                            {/* Socials */}
                            <div className="flex items-center gap-3">
                                {[
                                    { icon: Twitter, href: 'https://x.com/CodeHubx', label: 'Twitter' },
                                    { icon: Linkedin, href: 'https://www.linkedin.com/company/111519342/', label: 'LinkedIn' },
                                    { icon: Github, href: '#', label: 'GitHub' }
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative p-2 rounded-lg text-gray-400 hover:text-white transition-colors group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <social.icon size={18} className="relative z-10" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
