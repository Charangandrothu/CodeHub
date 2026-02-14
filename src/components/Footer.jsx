import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import logo_img from '../assets/logo_img.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Privacy Policy', path: '/privacy-policy' },
        ],
        product: [
            { name: 'Features', path: '/#features' },
            { name: 'Pricing', path: '/#pricing' },
            { name: 'Mock Tests', path: null, badge: 'Coming Soon' },
            { name: 'SQL Practice', path: null, badge: 'Coming Soon' },
            { name: 'Aptitude', path: null, badge: 'Coming Soon' },
        ],
        social: [
            {
                name: 'X (Twitter)',
                href: 'https://x.com/CodeHubx',
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                )
            },
            {
                name: 'LinkedIn',
                href: 'https://www.linkedin.com/company/111519342/',
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                )
            }
        ]
    };

    const handleInternalLink = (e, path) => {
        if (path && path.startsWith('/#')) {
            // Let React Router handle hash links from LandingPage
        }
    };

    return (
        <footer className="relative bg-[#060810] border-t border-white/[0.05]">
            {/* Emerald gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                    {/* Brand Column */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                            <img
                                src={logo_img}
                                alt="CodeHubX Logo"
                                className="w-8 h-8 rounded-lg shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300 object-cover"
                            />
                            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                CodeHubX
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Structured placement preparation powered by AI, analytics, and curated learning paths.
                        </p>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map(link => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-300"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map(link => (
                                <li key={link.name}>
                                    {link.path ? (
                                        <Link
                                            to={link.path}
                                            onClick={(e) => handleInternalLink(e, link.path)}
                                            className="text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-300"
                                        >
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <span className="flex items-center gap-2 text-sm text-gray-600">
                                            {link.name}
                                            {link.badge && (
                                                <span className="text-[10px] font-medium text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                                                    {link.badge}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Social</h3>
                        <ul className="space-y-3">
                            {footerLinks.social.map(link => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-300 group"
                                    >
                                        <span className="text-gray-600 group-hover:text-emerald-400 transition-colors">
                                            {link.icon}
                                        </span>
                                        {link.name}
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-14 pt-6 border-t border-white/[0.04]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-gray-600">
                            © {currentYear} CodeHubX. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy-policy" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <span className="text-gray-800">·</span>
                            <Link to="/about" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors">
                                About
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
