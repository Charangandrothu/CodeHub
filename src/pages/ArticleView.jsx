import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { articles } from '../data/articles';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, ArrowRight, Check, Copy } from 'lucide-react';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, '');

    const copyToClipboard = () => {
        navigator.clipboard.writeText(codeString);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (inline) {
        return <code className="bg-white/10 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5" {...props}>{children}</code>;
    }

    return (
        <div className="relative group my-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-[#0d0d0d] rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-[rgba(20,20,20,0.8)] backdrop-blur-md border-b border-white/[0.05]">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        {className && (
                            <span className="text-xs font-mono text-gray-400 capitalize bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                {className.replace('language-', '')}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Copy code"
                    >
                        {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                </div>
                <div className="p-5 overflow-x-auto custom-scrollbar">
                    <pre className="text-[15px] font-mono text-gray-300 leading-relaxed"><code {...props}>{codeString}</code></pre>
                </div>
            </div>
        </div>
    );
};

const ArticleView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 5000);
    };

    const article = articles.find(a => a.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (article) {
            document.title = `${article.title} - CodeHubX`;
            const schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "description": article.excerpt,
                "datePublished": article.date,
                "author": { "@type": "Organization", "name": "CodeHubX" }
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
                <p className="text-gray-400 mb-8">The article you are looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/articles')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                >
                    <ArrowLeft size={18} /> Back to Articles
                </button>
            </div>
        );
    }

    const relatedArticles = articles.filter(a => a.slug !== slug).sort(() => 0.5 - Math.random()).slice(0, 3);

    const renderers = {
        h1: ({ children }) => <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-12 mb-6 tracking-tight leading-tight">{children}</h1>,
        h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mt-14 mb-6 flex items-center gap-3 relative before:content-[''] before:absolute before:-left-6 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1.5 before:bg-blue-500 before:rounded-full">
                {children}
            </h2>
        ),
        h3: ({ children }) => <h3 className="text-xl font-semibold text-gray-200 mt-10 mb-4 tracking-wide">{children}</h3>,
        p: ({ children }) => <p className="text-gray-300 text-lg leading-[1.8] mb-6 font-normal tracking-wide">{children}</p>,
        ul: ({ children }) => <ul className="list-none space-y-4 mb-8 ml-2 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-2xl p-6">{children}</ul>,
        li: ({ children }) => (
            <li className="flex items-start text-gray-300 text-[17px]">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mr-4 mt-0.5 text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">✓</span>
                <span className="leading-relaxed">{children}</span>
            </li>
        ),
        strong: ({ children }) => <strong className="font-bold text-white bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">{children}</strong>,
        code: CodeBlock,
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#0a0a0a]"
        >
            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 z-50 origin-left"
                style={{ scaleX }}
            />

            {/* Header Section */}
            <div className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-[rgba(10,10,10,0.8)] backdrop-blur-2xl border-b border-white/[0.05]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/15 blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <Link
                            to="/articles"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors mb-8 group bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to all articles
                        </Link>

                        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                            {article.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            {article.title}
                        </h1>

                        <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                            {article.excerpt}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm font-medium border-t border-white/10 pt-8 w-max mx-auto px-8">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Calendar size={16} className="text-blue-400" />
                                {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock size={16} className="text-purple-400" />
                                {article.readTime} read
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl"
                >
                    <ReactMarkdown components={renderers}>
                        {article.content}
                    </ReactMarkdown>
                </motion.div>

                {/* Share / Footer of Article */}
                <div className="mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-3xl">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <span className="font-semibold text-white">Share this article:</span>
                        <div className="flex gap-4">
                            <button
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-md border ${isLinkCopied
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                                onClick={handleCopyLink}
                            >
                                {isLinkCopied ? <Check size={14} /> : <Share2 size={14} />}
                                {isLinkCopied ? 'Link Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Content Section */}
            <div className="bg-[#0f0f0f] border-t border-white/5 py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <h2 className="text-3xl font-extrabold text-white mb-12 flex items-center gap-4">
                        <span className="w-1.5 h-8 bg-purple-500 block rounded-full"></span>
                        Keep Learning
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedArticles.map((related, index) => (
                            <motion.div
                                key={related.slug}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ scale: 1.03 }}
                                className="h-full group"
                            >
                                <Link to={`/articles/${related.slug}`} className="block h-full outline-none">
                                    <div className="h-full p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-white/[0.08] hover:border-blue-500/30 hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 flex flex-col group-hover:-translate-y-1">
                                        <div className="flex gap-2 mb-3">
                                            {related.tags?.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] uppercase font-bold text-gray-400 bg-black/50 px-2 py-1 rounded-md border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                                            {related.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                                            {related.excerpt}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                                <Clock size={12} /> {related.readTime}
                                            </span>
                                            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white text-gray-400 transition-all duration-300">
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
        </motion.div>
    );
};

export default ArticleView;
