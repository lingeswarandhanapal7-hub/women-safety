import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Watch, Bluetooth, Battery, Heart, Zap, ShieldAlert, Loader2, Link, Link2Off } from 'lucide-react';
import useAlertStore from '../store/useAlertStore';
import useLocationStore from '../store/useLocationStore';
import api from '../api';

const WearablePanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [battery, setBattery] = useState(88);
  const [heartRate, setHeartRate] = useState(72);
  const [bpmHistory, setBpmHistory] = useState([70, 72, 75, 72, 70, 72, 74, 76, 74, 72]);
  const { triggerAlert, addHistory } = useAlertStore();
  const { location } = useLocationStore();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate Web Bluetooth API flow
      // if (navigator.bluetooth) {
      //   const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
      //   ...
      // }
      await new Promise(r => setTimeout(r, 1500));
      
      const { data } = await api.post('/api/wearable/connect', { deviceId: 'SHEild-WATCH-42' });
      if (data.success) {
        setIsConnected(true);
        addHistory({ type: 'info', message: 'Safety wearable connected via Bluetooth', timestamp: new Date() });
      }
    } catch (err) {
      console.error("Connection failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(async () => {
        // Randomly simulate heart rate spikes for demo
        const newBpm = Math.floor(70 + Math.random() * 10);
        setHeartRate(newBpm);
        setBpmHistory(prev => [...prev.slice(1), newBpm]);
        setBattery(b => Math.max(0, b - 0.01));

        // Randomly trigger stress alert if BPM > 150 (simulated)
        if (newBpm > 150) { // In demo mode, this won't hit often
           await api.post('/api/wearable/heartrate', { 
              bpm: newBpm, 
              lat: location?.lat, 
              lng: location?.lng 
           });
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isConnected, location]);

  const triggerSOS = async () => {
    await api.post('/api/wearable/trigger', { 
      lat: location?.lat, 
      lng: location?.lng 
    });
    triggerAlert(3, 'wearable', location);
    addHistory({ type: 'danger', message: 'Emergency SOS triggered from wearable device', timestamp: new Date() });
  };

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
          <h1 className="font-syne text-3xl font-bold text-ivory">Wearable Hub</h1>
          <p className="text-ivory/50 mt-2">Connect and manage your SHEild safety hardware.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <Bluetooth size={14} className={isConnected ? 'text-teal' : 'text-ivory/20'} />
          <span className="text-[10px] font-bold text-ivory/60 uppercase tracking-widest">
            {isConnected ? 'Syncing' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass p-10 flex flex-col items-center text-center relative overflow-hidden">
             {isConnected && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0.05, 0.1, 0.05] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-teal"
               />
             )}
             
             <div className="relative z-10">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border-2 transition-all duration-500 ${
                  isConnected ? 'bg-teal/10 border-teal text-teal shadow-[0_0_30px_rgba(46,196,182,0.2)]' : 'bg-white/5 border-white/10 text-ivory/20'
                }`}>
                   <Watch size={48} />
                </div>
                
                <h2 className="text-xl font-syne font-bold text-ivory mb-2">SHEild Watch v1</h2>
                <p className="text-sm text-ivory/50 mb-8">Biometric monitoring & instant SOS trigger.</p>

                {!isConnected ? (
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="btn-red w-full flex items-center justify-center gap-3 py-4"
                  >
                    {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Link size={18} />}
                    <span className="uppercase tracking-widest text-xs font-bold">Connect via Bluetooth</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={triggerSOS}
                      className="w-full py-4 bg-red text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-red/20"
                    >
                      Instant SOS Trigger
                    </button>
                    <button 
                      onClick={() => setIsConnected(false)}
                      className="w-full py-2 text-ivory/20 hover:text-ivory/40 text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Disconnect Device
                    </button>
                  </div>
                )}
             </div>
          </div>

          {isConnected && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 grid grid-cols-2 gap-8"
            >
               <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2 text-red">
                     <Heart size={20} className="animate-pulse" />
                     <span className="font-syne font-black text-2xl">{heartRate}</span>
                  </div>
                  <p className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Heart Rate (BPM)</p>
               </div>
               <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2 text-teal">
                     <Battery size={20} />
                     <span className="font-syne font-black text-2xl">{Math.floor(battery)}%</span>
                  </div>
                  <p className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Battery Level</p>
               </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
           <div className="glass p-8 flex flex-col h-full">
              <h3 className="font-syne font-bold text-ivory mb-8 flex items-center gap-2">
                 <Zap size={18} className="text-teal" />
                 Live Biometric Feed
              </h3>
              
              <div className="flex-1 flex items-end justify-between gap-1 h-32 mb-8">
                 {bpmHistory.map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${(h / 200) * 100}%` }}
                     className={`w-full rounded-t-sm ${h > 100 ? 'bg-red' : 'bg-teal/40'}`}
                   />
                 ))}
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                    <ShieldAlert size={20} className="text-amber-500" />
                    <div>
                       <p className="text-sm font-bold text-ivory">Auto-SOS Protocol</p>
                       <p className="text-[10px] text-ivory/40 uppercase font-bold">Triggers alert if BPM exceeds 160</p>
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4">
                    <Zap size={20} className="text-teal" />
                    <div>
                       <p className="text-sm font-bold text-ivory">Quick Action Gesture</p>
                       <p className="text-[10px] text-ivory/40 uppercase font-bold">Double-tap watch face to alert contacts</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WearablePanel;
