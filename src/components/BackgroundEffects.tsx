import React from 'react';
import { motion } from 'motion/react';
import { Cloud } from 'lucide-react';

export default function BackgroundEffects() {
  const renderShootingStars = () => {
    return Array.from({ length: 12 }).map((_, i) => {
      const top = Math.random() * 60 - 10;
      const left = Math.random() * 100;
      const duration = Math.random() * 2 + 2;
      const delay = Math.random() * 10;
      return (
        <motion.div
          key={`shooting-star-${i}`}
          className="absolute h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_2px_rgba(34,211,238,0.4)] pointer-events-none"
          style={{ 
            top: `${top}%`, 
            left: `${left}%`, 
            width: `${Math.random() * 100 + 50}px`,
            rotate: '-45deg'
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: -800,
            y: 800,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Light Mode: Sunrise & Clouds */}
      <div className="absolute inset-0 z-0 block dark:hidden overflow-hidden pointer-events-none">
        {/* Half Sunrise */}
        <motion.div 
          className="absolute bottom-[-128px] left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 blur-[2px] opacity-90 shadow-[0_0_60px_rgba(251,146,60,0.8)]"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-400/30 blur-3xl"
        />
        {/* Continuous Looping Clouds */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute text-white/90"
            style={{
              top: `${Math.random() * 40 + 5}%`,
            }}
            initial={{ x: '-20vw' }}
            animate={{ x: '120vw' }}
            transition={{ 
              duration: Math.random() * 60 + 60, 
              repeat: Infinity, 
              ease: "linear",
              delay: -(Math.random() * 60)
            }}
          >
            <Cloud size={Math.random() * 70 + 50} className="fill-current drop-shadow-lg" />
          </motion.div>
        ))}
      </div>

      {/* Dark Mode: Video Background & Shooting Stars */}
      <div className="absolute inset-0 z-0 hidden dark:block pointer-events-none overflow-hidden bg-[#040114]">
        {/* Looping Starry Night Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
        >
          {/* Using a visually similar starry night placeholder video since the local upload URL is unavailable */}
          <source src="https://www.pexels.com/video/interstellar-28295445/" type="video/mp4" />
        </video>
        
        {renderShootingStars()}
        
        {/* Overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040114] via-transparent to-transparent opacity-80"></div>
      </div>
    </>
  );
}
