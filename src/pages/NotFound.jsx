import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 max-w-md w-full"
            >
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                        <AlertCircle className="w-24 h-24 text-red-500 relative z-10" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    404
                </h1>

                <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>

                <p className="text-gray-400">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back Home
                </motion.button>
            </motion.div>
        </div>
    );
};

export default NotFound;
