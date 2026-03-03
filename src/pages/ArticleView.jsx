import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { articles } from '../data/articles';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, ArrowRight } from 'lucide-react';

const ArticleView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Find the current article
    const article = articles.find(a => a.slug === slug);

    // Scroll to top and add Schema
    useEffect(() => {
        window.scrollTo(0, 0);

        if (article) {
            // Document Title
            document.title = `${article.title} - CodeHubX`;

            // Schema.org JSON-LD
            const schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "description": article.excerpt,
                "datePublished": article.date,
                "author": {
                    "@type": "Organization",
                    "name": "CodeHubX"
                }
            };

            let scriptData = document.querySelector('#article-schema');
            if (!scriptData) {
                scriptData = document.createElement('script');
                scriptData.id = 'article-schema';
                scriptData.type = 'application/ld+json';
                document.head.appendChild(scriptData);
            }
            scriptData.innerHTML = JSON.stringify(schema);
        }

        return () => {
            document.title = 'CodeHubX - Learn DSA';
            const scriptData = document.querySelector('#article-schema');
            if (scriptData) scriptData.remove();
        };
    }, [slug, article]);

    if (!article) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
                <p className="text-gray-400 mb-8">The article you are looking for doesn't exist or has been moved.</p>
                <button
                    onClick={() => navigate('/articles')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back to Articles
                </button>
            </div>
        );
    }

    // Related Content (Simple Random/Next items for now)
    const relatedArticles = articles
        .filter(a => a.slug !== slug)
        .slice(0, 3); // Just pick first 3 for simplicity, or we could randomize

    // Custom renderers for markdown
    const renderers = {
        h1: ({ children }) => <h1 className="text-3xl sm:text-4xl font-bold text-white mt-10 mb-6 font-display">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl sm:text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3"><span className="w-8 h-1 rounded-full bg-blue-500 block"></span>{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-8 mb-4">{children}</h3>,
        p: ({ children }) => <p className="text-gray-300 text-base leading-relaxed mb-6">{children}</p>,
        ul: ({ children }) => <ul className="list-none space-y-3 mb-8 ml-2">{children}</ul>,
        li: ({ children }) => (
            <li className="flex items-start text-gray-300">
                <span className="text-blue-500 mr-3 mt-1.5 text-lg leading-none">•</span>
                <span className="leading-relaxed">{children}</span>
            </li>
        ),
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
                return <code className="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5" {...props}>{children}</code>;
            }
            return (
                <div className="relative group my-8">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-[#111111] rounded-xl border border-white/10 overflow-hidden">
                        <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            {className && (
                                <span className="ml-4 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                    {className.replace('language-', '')}
                                </span>
                            )}
                        </div>
                        <div className="p-4 overflow-x-auto custom-scrollbar">
                            <pre className="text-sm font-mono text-gray-300 leading-relaxed"><code {...props}>{children}</code></pre>
                        </div>
                    </div>
                </div>
            );
        },
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Header / Hero Section */}
            <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/15 blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link
                            to="/articles"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to all articles
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                <BookOpen size={14} />
                                DSA Guide
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Calendar size={14} />
                                {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Clock size={14} />
                                {article.readTime} read
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight font-display">
                            {article.title}
                        </h1>

                        <p className="text-xl text-gray-400 leading-relaxed mb-8 max-w-3xl">
                            {article.excerpt}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-a:text-blue-400 hover:prose-a:text-blue-300"
                >
                    <ReactMarkdown components={renderers}>
                        {article.content}
                    </ReactMarkdown>
                </motion.div>

                {/* Share / Footer of Article */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-400">
                        <span className="font-semibold text-white">Share this article:</span>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }}>
                                <Share2 size={18} />
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Content Section */}
            <div className="bg-[#111111] border-t border-white/5 py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <h2 className="text-3xl font-bold text-white mb-10 font-display">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedArticles.map((related, index) => (
                            <motion.div
                                key={related.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={`/articles/${related.slug}`} className="block h-full group">
                                    <div className="h-full p-6 rounded-2xl bg-[#1a1a1a] border border-white/5 hover:border-blue-500/30 hover:bg-[#222222] transition-all duration-300 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                                            {related.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                                            {related.excerpt}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                <Clock size={12} /> {related.readTime}
                                            </span>
                                            <span className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-1">
                                                Read more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ArticleView;
