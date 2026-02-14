import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Cookie, UserCheck, Mail, Server, Eye, Lock, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const Section = ({ icon: Icon, title, children, index }) => (
    <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        className="relative group"
    >
        <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-500">
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Icon size={20} className="text-emerald-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
                </div>
                <div className="text-gray-400 text-sm sm:text-base leading-relaxed space-y-3">
                    {children}
                </div>
            </div>
        </div>
    </motion.div>
);

const BulletItem = ({ children }) => (
    <div className="flex items-start gap-2">
        <ChevronRight size={16} className="text-emerald-400 mt-0.5 shrink-0" />
        <span>{children}</span>
    </div>
);

const PrivacyPolicy = () => {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] pt-28 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-900/15 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[120px] opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <Shield size={14} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">Your Privacy Matters</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-emerald-300 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Last updated: February 14, 2026
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    <Section icon={Eye} title="1. Introduction" index={0}>
                        <p>
                            Welcome to <strong className="text-white">CodeHubX</strong> — a structured placement preparation platform focused on helping students
                            improve problem-solving skills through curated DSA problems, AI-powered solution analysis, and performance analytics.
                        </p>
                        <p>
                            We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and
                            responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information
                            when you use our platform.
                        </p>
                    </Section>

                    <Section icon={Database} title="2. Information We Collect" index={1}>
                        <p>We may collect the following types of information:</p>
                        <div className="space-y-2 mt-2">
                            <BulletItem><strong className="text-gray-200">Account Information:</strong> Name, email address, profile picture, and username provided during registration.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Usage Data:</strong> Information about how you interact with the platform, including problems attempted, solutions submitted, and features accessed.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Performance Analytics:</strong> Data related to your coding performance, accuracy, time taken, and progress metrics.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Device & Technical Information:</strong> Browser type, IP address, device information, operating system, and access times for security and analytics purposes.</BulletItem>
                        </div>
                    </Section>

                    <Section icon={Server} title="3. How We Use Information" index={2}>
                        <p>Your information is used to:</p>
                        <div className="space-y-2 mt-2">
                            <BulletItem>Improve platform performance, user experience, and content quality.</BulletItem>
                            <BulletItem>Provide AI-based solution analysis and personalized coding insights.</BulletItem>
                            <BulletItem>Enable premium features such as advanced analytics and optimization guidance.</BulletItem>
                            <BulletItem>Serve relevant content and advertisements (Google Ads, if enabled).</BulletItem>
                            <BulletItem>Communicate important updates, feature releases, and service notifications.</BulletItem>
                        </div>
                    </Section>

                    <Section icon={Lock} title="4. Data Security" index={3}>
                        <p>
                            We implement industry-standard security measures to protect your personal information. This includes encrypted
                            database storage, secure API communications, and access controls. We use MongoDB Atlas with encryption at rest
                            and in transit to safeguard your data.
                        </p>
                        <p>
                            While we strive to use commercially acceptable means to protect your information, no method of transmission
                            over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </Section>

                    <Section icon={Server} title="5. Third-Party Services" index={4}>
                        <p>We utilize the following third-party services to deliver our platform:</p>
                        <div className="space-y-2 mt-2">
                            <BulletItem><strong className="text-gray-200">MongoDB Atlas:</strong> For secure, cloud-hosted database storage.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Judge0 API:</strong> For secure code compilation and execution.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Firebase Authentication:</strong> For secure user authentication and account management.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Google Ad Services:</strong> For serving relevant advertisements (if enabled).</BulletItem>
                            <BulletItem><strong className="text-gray-200">AI Provider APIs (NVIDIA, Gemini, Claude, DeepSeek):</strong> For AI-powered solution analysis.</BulletItem>
                        </div>
                        <p className="mt-3 text-gray-500 text-xs">
                            Please note that these third-party services may collect data in accordance with their own privacy policies,
                            which are independent of ours.
                        </p>
                    </Section>

                    <Section icon={Cookie} title="6. Cookies Policy" index={5}>
                        <p>CodeHubX uses cookies to enhance your browsing experience:</p>
                        <div className="space-y-2 mt-2">
                            <BulletItem><strong className="text-gray-200">Essential Cookies:</strong> Required for core functionality such as authentication, session management, and security features.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Analytics Cookies:</strong> Help us understand how users interact with the platform to improve performance and usability.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Advertising Cookies:</strong> Used by Google Ads to serve relevant advertisements based on your interests.</BulletItem>
                        </div>
                        <p className="mt-3">
                            You can manage your ad preferences through{' '}
                            <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/30 hover:decoration-emerald-300 transition-colors">
                                Google Ads Settings
                            </a>.
                        </p>
                    </Section>

                    <Section icon={UserCheck} title="7. User Rights" index={6}>
                        <p>As a user of CodeHubX, you have the right to:</p>
                        <div className="space-y-2 mt-2">
                            <BulletItem><strong className="text-gray-200">Request Account Deletion:</strong> You may request the permanent deletion of your account and all associated data at any time.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Request Data Correction:</strong> If any of your personal information is inaccurate, you can request corrections through your account settings or by contacting support.</BulletItem>
                            <BulletItem><strong className="text-gray-200">Data Inquiry:</strong> You may contact our support team to inquire about what personal data we hold about you.</BulletItem>
                        </div>
                    </Section>

                    <Section icon={Mail} title="8. Contact Information" index={7}>
                        <p>
                            If you have any questions or concerns regarding this Privacy Policy or your personal data,
                            please contact us at:
                        </p>
                        <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Mail size={18} className="text-emerald-400" />
                            <a href="mailto:codehubx.org@gmail.com" className="text-emerald-300 font-medium hover:text-emerald-200 transition-colors">
                                codehubx.org@gmail.com
                            </a>
                        </div>
                    </Section>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
