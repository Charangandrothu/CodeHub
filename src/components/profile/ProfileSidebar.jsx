import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    GraduationCap,
    Link as LinkIcon,
    Github,
    Linkedin,
    Edit3
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const ProfileSidebar = ({
    user = {
        profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        isVerified: true,
        username: "alex_dev",
        role: "Full Stack Developer",
        status: "Pro Member",
        college: "Stanford University",
        portfolioUrl: "alexdev.io",
        github: "alexcode",
        linkedin: "alex-professional",
        skills: ["React", "Node.js", "TypeScript", "GraphQL", "AWS"]
    },
    theme = {
        accentColor: "#00f2ff"
    },
    cta = {
        editProfileText: "Edit Profile"
    },
    className
}) => {
    return (
        <aside className={cn(
            "relative w-full max-w-[320px] overflow-hidden rounded-3xl",
            "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]",
            "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
            className
        )}>
            {/* Top ambient glow */}
            <div
                className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-[80px] opacity-40 pointer-events-none"
                style={{ background: theme.accentColor }}
            />
            <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none"
            />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col p-6 space-y-6">

                {/* Top Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative group">
                        {/* Avatar Ring */}
                        <div
                            className="absolute -inset-1 rounded-full opacity-60 blur-md transition-all duration-500 group-hover:opacity-100"
                            style={{ background: `linear-gradient(45deg, ${theme.accentColor}, transparent)` }}
                        />

                        {/* Avatar Image */}
                        <div className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-br from-white/20 to-white/5">
                            <img
                                src={user.profileImageUrl}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>

                        {/* Verified Badge */}
                        {user.isVerified && (
                            <div
                                className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg"
                                title="Verified User"
                            >
                                <CheckCircle2
                                    size={16}
                                    style={{ color: theme.accentColor }}
                                    fill="rgba(0,0,0,0.2)"
                                />
                            </div>
                        )}
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-2xl font-bold text-white tracking-tight"
                    >
                        {user.username}
                    </motion.h2>

                    <p className="text-sm font-medium text-gray-400 mt-1">
                        {user.role}
                    </p>

                    <div
                        className="mt-3 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border bg-white/5 border-white/10"
                        style={{
                            color: theme.accentColor,
                            borderColor: `${theme.accentColor}33`,
                            boxShadow: `0 0 20px -10px ${theme.accentColor}`
                        }}
                    >
                        {user.status}
                    </div>
                </div>

                {/* Primary Action */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group border border-white/10"
                    style={{
                        background: `linear-gradient(90deg, ${theme.accentColor}1a, transparent)`,
                        color: theme.accentColor
                    }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <Edit3 size={16} />
                        {cta.editProfileText}
                    </span>
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ background: theme.accentColor }}
                    />
                </motion.button>

                {/* Info Rows */}
                <div className="space-y-4 pt-2">
                    <InfoRow icon={GraduationCap} text={user.college} />
                    {user.portfolioUrl && (
                        <InfoRow
                            icon={LinkIcon}
                            text={user.portfolioUrl}
                            href={`https://${user.portfolioUrl}`}
                            color="#3b82f6"
                        />
                    )}
                    {user.github && (
                        <InfoRow
                            icon={Github}
                            text={user.github}
                            href={`https://github.com/${user.github}`}
                        />
                    )}
                    {user.linkedin && (
                        <InfoRow
                            icon={Linkedin}
                            text={user.linkedin}
                            href={`https://linkedin.com/in/${user.linkedin}`}
                            color="#0a66c2"
                        />
                    )}
                </div>

                {/* Skills Section */}
                {user.skills && user.skills.length > 0 && (
                    <div className="pt-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                            Top Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-colors duration-200 cursor-default"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </aside>
    );
};

const InfoRow = ({ icon: Icon, text, href, color }) => {
    const content = (
        <div className="flex items-center gap-3 group text-gray-400 hover:text-white transition-colors duration-200">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <Icon size={16} style={{ color: color }} className={!color ? "text-gray-400 group-hover:text-white" : ""} />
            </div>
            <span className="text-sm truncate">{text}</span>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        );
    }

    return content;
};

export default ProfileSidebar;
