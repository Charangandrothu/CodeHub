import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { articles } from '../data/articles';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Articles = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20 relative overflow-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <BookOpen size={14} className="text-blue-400" />
                        <span className="text-xs font-medium text-blue-300">DSA Blog</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-emerald-200 mb-6">
                        Articles & Guides
                    </h1>
                    <p className="text-gray-400 text-base max-w-2xl mx-auto">
                        Deep dive into Data Structures and Algorithms with our comprehensive long-form articles. Learn patterns, optimize solutions, and master technical interviews.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={`/articles/${article.slug}`} className="block h-full">
                                <div className="h-full p-6 rounded-2xl bg-[#111111]/80 border border-white/5 hover:border-blue-500/30 hover:bg-[#151515] transition-all duration-300 group flex flex-col">
                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
                                        {article.excerpt}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                            <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-blue-400 transition-colors">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default Articles;
