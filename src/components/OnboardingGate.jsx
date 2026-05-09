import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Phone, ArrowRight, Heart } from 'lucide-react';
import useSettingsStore from '../store/useSettingsStore';
import { useToast } from './ToastSystem';

const OnboardingGate = ({ children }) => {
  const { contacts, addContact } = useSettingsStore();
  const toast = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.warning("Please provide both name and phone number.");
      return;
    }
    
    setIsSubmitting(true);
    // Add small delay for dramatic effect
    setTimeout(() => {
      addContact({ name, phone });
      toast.success("Guardian Shield activated! Your contact has been saved.");
      setIsSubmitting(false);
    }, 1000);
  };

  if (contacts.length > 0) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-navy flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md w-full p-10 relative z-10 border-teal/20"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-teal/10 rounded-3xl flex items-center justify-center text-teal mb-6 border border-teal/20 shadow-[0_0_40px_rgba(46,196,182,0.1)]">
            <Heart size={40} className="animate-pulse" />
          </div>
          <h2 className="font-syne text-3xl font-bold text-ivory mb-3">Add Your Guardian</h2>
          <p className="text-ivory/50 text-sm leading-relaxed">
            Who should we alert first if you're in danger? SHEild needs at least one emergency contact to keep you safe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
            <input 
              type="text" 
              placeholder="Guardian's Name (e.g. Mom)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory placeholder:text-ivory/20 focus:border-teal/50 focus:outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
            <input 
              type="tel" 
              placeholder="Guardian's Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory placeholder:text-ivory/20 focus:border-teal/50 focus:outline-none transition-all"
            />
          </div>

          <button 
            disabled={isSubmitting}
            type="submit" 
            className="btn-red w-full bg-teal text-navy hover:bg-teal/90 py-4 mt-6 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="font-syne font-bold uppercase tracking-widest">
              {isSubmitting ? 'Securing...' : 'Activate Protection'}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-[10px] text-center mt-8 text-ivory/30 font-bold uppercase tracking-widest leading-relaxed">
          Your contact's data is end-to-end encrypted and only used during Level 1-3 emergency alerts.
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingGate;
