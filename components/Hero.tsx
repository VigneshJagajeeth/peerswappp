
import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative bg-transparent overflow-hidden min-h-[80vh] flex items-center justify-center">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Buy Smart. Rent Easy. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Exchange Skills.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-2xl text-gray-300 font-light">
            PeerSwap is where students connect. Exchange skills for goods, rent what you need, or find great deals. All powered by cash or your own talents.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-10 py-4 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300 transform hover:scale-105"
            >
              Get Started Now
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050510]/50 to-[#050510] z-0 pointer-events-none"></div>
    </div>
  );
};

export default Hero;
