import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="bg-navy min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Social Proof / Trust Bar Ticker */}
      <div className="bg-navy border-y border-border-dim py-10 overflow-hidden relative">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 items-center"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-20">
               <span className="text-ivory/40 font-syne font-bold text-lg">"Finally a safety app that doesn't feel intrusive." — Priya, Chennai</span>
               <span className="text-ivory/40 font-syne font-bold text-lg">"The smart routing saved me from an uncomfortable walk home." — Ananya, Mumbai</span>
               <span className="text-ivory/40 font-syne font-bold text-lg">"Silent distress is a game changer. I feel more confident traveling." — Sarah, London</span>
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-navy to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-navy to-transparent z-10" />
      </div>

      <FeatureGrid />
      <HowItWorks />
      
      {/* Final CTA Section */}
      <section className="section bg-navy overflow-hidden relative">
        <div className="container relative z-10">
          <div className="glass p-12 md:p-20 text-center max-w-4xl mx-auto border-red/20 shadow-[0_0_50px_rgba(230,57,70,0.1)]">
            <h2 className="text-4xl md:text-5xl font-syne font-extrabold mb-6">Start Your Protection Cycle Today</h2>
            <p className="text-ivory/60 text-lg mb-10 max-w-xl mx-auto">
              Join 2.4 million women who trust SHEild to keep them safe automatically.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-red text-xl px-12 py-5"
            >
              Get Protected Now
            </motion.button>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-red/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-teal/10 blur-[120px] rounded-full" />
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
