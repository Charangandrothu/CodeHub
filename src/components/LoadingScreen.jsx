import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Server, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLongWaitMessage(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app-bg/95 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-8 text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-xl">
          <Code2 className="h-10 w-10" />
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 4 }} className="absolute -inset-2 rounded-[28px] border border-blue-400/40" />
        </div>

        <h2 className="mb-4 text-3xl font-bold text-app-text">CodeHubx</h2>

        <AnimatePresence mode="wait">
          {showLongWaitMessage ? (
            <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-amber-500">
                <Server className="h-4 w-4" /> Waking server...
              </div>
              <p className="text-sm text-app-muted">Cold start detected. This can take up to 60 seconds.</p>
            </motion.div>
          ) : (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2 text-app-muted">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Initializing application...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
