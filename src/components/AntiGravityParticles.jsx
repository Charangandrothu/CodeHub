import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AntiGravityParticles = () => {
  const [viewportHeight, setViewportHeight] = useState(1000);

  useEffect(() => {
    // Set initial viewport height
    setViewportHeight(window.innerHeight);

    // Update on resize
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate random particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-sm"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -(viewportHeight + 100)],
            x: [0, Math.sin(particle.id) * 50],
            opacity: [0, 0.8, 0.8, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default AntiGravityParticles;
