import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUpContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const fadeUpItem = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Articles = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 relative overflow-hidden"
        >
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <BookOpen size={14} className="text-blue-400" />
                        <span className="text-xs font-medium text-blue-300">DSA Guide</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight">
                        Articles & Guides
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Deep dive into Data Structures and Algorithms with our premium long-form learning guides. Master core patterns, optimize solutions, and ace technical interviews.
                    </p>
                </motion.div>

                <motion.div
                    variants={fadeUpContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.slug}
                            variants={fadeUpItem}
                            whileHover={{ scale: 1.03 }}
                            className="h-full group"
                        >
                            <Link to={`/articles/${article.slug}`} className="block h-full outline-none">
                                <div className="h-full p-7 rounded-3xl relative overflow-hidden bg-[rgba(20,20,20,0.6)] backdrop-blur-[12px] border border-white/[0.08] hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 flex flex-col group-hover:-translate-y-1">

                                    {/* Hover Glow Effect inside card */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {article.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-colors">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(!article.tags || article.tags.length === 0) && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-colors">
                                                    Concept
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                                            {article.title}
                                        </h2>

                                        <p className="text-gray-400 text-sm mb-8 flex-grow leading-relaxed">
                                            {article.excerpt}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white text-gray-400 transition-all duration-300 shadow-sm group-hover:shadow-blue-500/25">
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </motion.div>
    );
};

export default Articles;
