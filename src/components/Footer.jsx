import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-navy border-t border-border-dim pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-red w-8 h-8" />
              <span className="font-syne text-2xl font-bold tracking-tight">
                <span className="text-red">SHE</span>
                <span className="text-ivory">ild</span>
              </span>
            </div>
            <p className="text-ivory/50 max-w-sm mb-8 leading-relaxed">
              "She Shouldn't Have To Ask For Help. <br />
              SHEild Makes Sure She Never Does."
            </p>
            <div className="flex gap-4">
              {[Shield, Shield, Shield].map((Icon, i) => (
                <motion.a 
                  key={i}
                  href="#"
                  whileHover={{ y: -4, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-ivory/60 hover:text-ivory hover:border-ivory/20 transition-all"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-syne font-bold text-ivory mb-6 uppercase tracking-widest text-xs">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Dashboard</a></li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Community</a></li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Privacy Vault</a></li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Safety Map</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-bold text-red mb-6 uppercase tracking-widest text-xs">Emergency</h4>
            <ul className="space-y-4">
              <li className="text-ivory text-sm font-bold">In an emergency always call 112</li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Find Nearest Police</a></li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Legal Assistance</a></li>
              <li><a href="#" className="text-ivory/60 hover:text-red transition-colors text-sm">Report Incident</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-ivory/30">
          <p>© 2025 SHEild. Built for her.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-ivory transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ivory transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
