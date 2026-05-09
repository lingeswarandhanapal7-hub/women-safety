import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Radar Pulse Background */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "linear"
            }}
            className="absolute w-96 h-96 border border-teal/20 rounded-full"
          />
        ))}
        <div className="absolute inset-0 bg-radial-gradient from-navy via-navy to-black opacity-60" />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container flex flex-col items-center text-center relative z-10"
      >
        <motion.div variants={item} className="mb-6">
          <span className="px-4 py-1.5 rounded-full border border-red/30 bg-red/5 text-red text-xs font-bold tracking-widest uppercase">
            AI-Powered Personal Safety
          </span>
        </motion.div>

        <motion.h1 
          variants={item}
          className="text-5xl md:text-7xl font-syne font-extrabold max-w-4xl mb-6 leading-[1.1]"
        >
          She Shouldn't Have To <br />
          Ask For Help. <br />
          <span className="text-teal">SHEild Makes Sure <br /> She Never Does.</span>
        </motion.h1>

        <motion.p 
          variants={item}
          className="text-ivory/60 text-lg md:text-xl max-w-xl mb-12"
        >
          Detects danger automatically. Responds instantly. <br className="hidden md:block" />
          Works even when you can't.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/auth" className="btn-red text-lg px-10 py-4 shadow-lg shadow-red/20">
            Activate SHEild
          </Link>
          <a href="#features" className="btn-teal-outline text-lg px-10 py-4">
            See It In Action
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={item}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-24 border-t border-border-dim pt-12 w-full max-w-4xl"
        >
          {[
            { val: '2.4M', label: 'women protected' },
            { val: '< 3 sec', label: 'response' },
            { val: '99.2%', label: 'uptime' },
            { val: '140', label: 'cities' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-syne font-bold text-ivory">{stat.val}</p>
              <p className="text-xs text-ivory/50 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
