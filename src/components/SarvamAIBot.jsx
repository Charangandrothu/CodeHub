import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, MinusCircle, Maximize2, Code2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import logo_img from '../assets/logo_img.png';

export default function SarvamAIBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const handleSend = async (text = input) => {
        if (!text.trim() || isLoading) return;

        const userMessage = text.trim();
        setInput("");
        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const response = await axios.post(`${apiBaseUrl}/api/sarvam/chat`, {
                message: userMessage,
                history: messages
            });

            setMessages([...newMessages, { role: 'assistant', text: response.data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'assistant', text: "I'm sorry, I'm having trouble connecting right now. Please try again later.", isError: true }]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4 origin-bottom-right ${isExpanded ? 'w-[calc(100vw-48px)] h-[calc(100vh-100px)] md:w-[600px] md:h-[800px]' : 'w-[calc(100vw-48px)] sm:w-[400px] h-[600px] max-h-[80vh]'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0">
                                    <img src={logo_img} alt="CodeHub AI" className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-[15px] tracking-tight">AI Assistant</h3>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Sarvam AI Premium
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors hidden sm:block">
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-gradient-to-b from-[#111827] to-[#0f1117]">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                        <Code2 size={28} className="text-indigo-400" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-2 text-lg">How can I help you?</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-[240px]">
                                        Debug your code, explain logic, analyze complexity, or explore platform features.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                        {['Explain quicksort', 'Debug my code', 'How to use mock tests?'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => handleSend(q)}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative group ${msg.role === 'user'
                                            ? 'bg-[#2563eb] text-white rounded-tr-sm shadow-blue-900/20'
                                            : msg.isError
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm'
                                                : 'bg-[#1f2937] text-gray-200 rounded-tl-sm border border-white/5'
                                            }`}
                                    >
                                        {msg.role === 'assistant' && !msg.isError ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-a:text-indigo-400">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap font-sans text-[13.5px]">
                                                {msg.text}
                                            </div>
                                        )}
                                        {/* Provider label on AI messages */}
                                        {msg.role === 'assistant' && !msg.isError && (
                                            <div className="mt-2 text-[9px] text-gray-500 font-medium uppercase tracking-wider">
                                                via Sarvam AI
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-[#1f2937] rounded-2xl rounded-tl-sm p-4 border border-white/5 flex gap-1.5 items-center w-fit shadow-lg">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                        <span className="ml-2 text-[10px] text-gray-500">
                                            Sarvam AI
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-[#111827] shrink-0">
                            <div className="relative flex items-center bg-[#1f2937] border border-white/5 rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 px-4 py-3.5 pr-12"
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/25 flex items-center justify-center border border-white/10 group relative"
                >
                    <img src={logo_img} alt="CodeHub AI" className="w-7 h-7 object-cover opacity-90 brightness-200" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#0a0a0a]"></span>
                    </span>
                </motion.button>
            )}
        </div>
    );
}
