import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    GraduationCap,
    Link as LinkIcon,
    Github,
    Linkedin,
    Code2,
    Terminal,
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
        leetcode: "alexlc",
        codeforces: "alexcf",
        skills: ["React", "Node.js", "TypeScript", "GraphQL", "AWS"]
    },
    theme = {
        accentColor: "#00f2ff"
    },
    cta = {
        editProfileText: "Edit Profile"
    },
    className,
    onEdit
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
                        style={{ color: theme.accentColor, borderColor: `${theme.accentColor}33` }}
                    >
                        {user.status}
                    </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                    {user.college && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="p-2 rounded-lg bg-white/5">
                                <GraduationCap size={18} className="text-gray-400" />
                            </div>
                            <span>{user.college}</span>
                        </div>
                    )}
                </div>

                {/* Social Links Row */}
                <div className="flex items-center justify-center gap-3 py-2">
                    {user.github && (
                        <a
                            href={user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            title="GitHub"
                        >
                            <Github size={20} />
                        </a>
                    )}
                    {user.linkedin && (
                        <a
                            href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all"
                            title="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                    )}
                    {user.leetcode && (
                        <a
                            href={user.leetcode.startsWith('http') ? user.leetcode : `https://leetcode.com/${user.leetcode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-yellow-500 transition-all"
                            title="LeetCode"
                        >
                            <Code2 size={20} />
                        </a>
                    )}
                    {user.codeforces && (
                        <a
                            href={user.codeforces.startsWith('http') ? user.codeforces : `https://codeforces.com/profile/${user.codeforces}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-500 transition-all"
                            title="CodeForces"
                        >
                            <Terminal size={20} />
                        </a>
                    )}
                    {user.portfolioUrl && (
                        <a
                            href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-green-400 transition-all"
                            title="Portfolio"
                        >
                            <LinkIcon size={20} />
                        </a>
                    )}
                </div>


                {/* Skills Tags */}
                <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                        {user.skills.slice(0, 6).map((skill, i) => (
                            <span
                                key={i}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 transition-colors"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Edit Button */}
                {onEdit && (
                    <Button
                        onClick={onEdit}
                        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-500/20"
                    >
                        <Edit3 size={16} />
                        {cta.editProfileText}
                    </Button>
                )}

            </div>
        </aside>
    );
};

export default ProfileSidebar;
