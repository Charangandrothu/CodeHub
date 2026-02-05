import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Quote } from 'lucide-react';

const QUOTES = [
    { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "Java is to JavaScript what car is to Carpet.", author: "Chris Heilmann" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday’s code.", author: "Dan Salomon" },
    { text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author: "Antoine de Saint-Exupery" },
    { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
    { text: "Optimism is an occupational hazard of programming: feedback is the treatment.", author: "Kent Beck" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
    { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Programming is the art of algorithm design and the craft of debugging logic.", author: "Unknown" },
    { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" }
];

const DailyQuote = () => {
    const [quote, setQuote] = useState(null);

    useEffect(() => {
        // Calculate day of year to preserve same quote for 24h
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);

        // Select quote based on day
        setQuote(QUOTES[day % QUOTES.length]);
    }, []);

    if (!quote) return null;

    return (
        <div className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/10 to-blue-900/10 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen size={20} className="text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400/70">Daily Wisdom</span>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className="text-gray-300 text-sm italic leading-relaxed relative">
                    <Quote size={12} className="inline-block mr-1 -mt-2 opacity-50 text-purple-400" />
                    {quote.text}
                </p>
                <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-gray-700"></span>
                    {quote.author}
                </p>
            </motion.div>
        </div>
    );
};

export default DailyQuote;
