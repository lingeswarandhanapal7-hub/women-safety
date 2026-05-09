import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mic, MapPin, Video, Bell, ArrowRight } from 'lucide-react';

const PermissionsGate = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [permissions, setPermissions] = useState({
    microphone: false,
    location: false,
    camera: false,
    notifications: false,
  });

  useEffect(() => {
    const hasSeenGate = localStorage.getItem('sheild_permissions_seen');
    if (!hasSeenGate) {
      setShowModal(true);
    }
  }, []);

  const handleGrant = (key) => {
    setPermissions(prev => ({ ...prev, [key]: true }));
  };

  const handleComplete = () => {
    localStorage.setItem('sheild_permissions_seen', 'true');
    setShowModal(false);
  };

  const permsList = [
    { key: 'microphone', icon: Mic, label: 'Microphone', desc: 'Required for silent distress detection and voice AI.' },
    { key: 'location', icon: MapPin, label: 'Location', desc: 'Allows live tracking and safe route generation.' },
    { key: 'camera', icon: Video, label: 'Camera', desc: 'Used for evidence collection during emergency alerts.' },
    { key: 'notifications', icon: Bell, label: 'Notifications', desc: 'Critical for safety check-ins and alert updates.' },
  ];

  return (
    <>
      {children}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-navy/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass max-w-[500px] w-full p-10 border-red/20 shadow-[0_0_50px_rgba(230,57,70,0.2)]"
            >
              <div className="flex flex-col items-center text-center mb-10">
                 <Shield className="text-red w-16 h-16 mb-4" />
                 <h2 className="font-syne text-2xl font-bold text-ivory mb-2">Initialize Your Shield</h2>
                 <p className="text-sm text-ivory/50">To protect you fully, SHEild needs the following permissions to be active.</p>
              </div>

              <div className="space-y-4 mb-10">
                 {permsList.map((perm) => (
                   <div key={perm.key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${permissions[perm.key] ? 'bg-teal/20 text-teal' : 'bg-white/5 text-ivory/20'}`}>
                            <perm.icon size={20} />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-bold text-ivory">{perm.label}</p>
                            <p className="text-[10px] text-ivory/30 font-bold uppercase">{perm.desc}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleGrant(perm.key)}
                        disabled={permissions[perm.key]}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                          permissions[perm.key] ? 'text-teal bg-teal/10' : 'text-ivory/40 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                         {permissions[perm.key] ? 'Granted' : 'Grant'}
                      </button>
                   </div>
                 ))}
              </div>

              <button 
                onClick={handleComplete}
                className="btn-red w-full flex items-center justify-center gap-3 py-4"
              >
                 <span className="uppercase tracking-widest text-sm font-bold">Secure My Device</span>
                 <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => setShowModal(false)}
                className="w-full mt-4 text-[10px] font-bold text-ivory/20 uppercase tracking-widest hover:text-ivory/40 transition-colors"
              >
                Skip for now (Limited features)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PermissionsGate;
