import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, MapPin, Video, UserCheck, Shield, Zap } from 'lucide-react';
import useAlertStore from '../store/useAlertStore';
import useLocationStore from '../store/useLocationStore';
import useSocketStore from '../store/useSocketStore';
import confetti from 'canvas-confetti';

const AlertPanel = () => {
  const { alertLevel, activeAlert, triggerAlert, resolve, escalate, history, autoEscalateAt, addHistory } = useAlertStore();
  const { location, startTracking } = useLocationStore();
  const { emit: socketEmit, socket } = useSocketStore();
  const [countdown, setCountdown] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const streamIntervalRef = useRef(null);

  // Real countdown from autoEscalateAt timestamp
  useEffect(() => {
    if (!autoEscalateAt) { setCountdown(null); return; }
    const tick = setInterval(() => {
      const remaining = new Date(autoEscalateAt) - Date.now();
      if (remaining <= 0) { setCountdown('0:00'); clearInterval(tick); return; }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(tick);
  }, [autoEscalateAt]);

  // Stream location to socket when alert active
  useEffect(() => {
    if (alertLevel >= 2 && activeAlert && socket) {
      startTracking();
      streamIntervalRef.current = setInterval(() => {
        const loc = useLocationStore.getState().location;
        if (loc && activeAlert?._id) {
          socket.emit('location:update', { ...loc, alertId: activeAlert._id });
        }
      }, 5000);
    }
    return () => clearInterval(streamIntervalRef.current);
  }, [alertLevel, activeAlert, socket]);

  const handleTrigger = async (level) => {
    const alertChime = new Audio();
    alertChime.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq4FHDjVWl8LIpWVAGCxPjMvepIJYJSY4dLvkuIpeOho4a7PqqZFnOCU5bqzpp5VrPC07cLDosJduRys6dLDoppZtPi47dLLoqJluQSw8eLLpqJluQy08eLLpqZluRC07eLLpqJluRC07eLHpqJduQy08d7Hpqplu';
    alertChime.play().catch(() => {});

    const data = await triggerAlert(level, 'manual', location);
    addHistory({ type: 'danger', message: `Level ${level} alert triggered`, timestamp: new Date() });
    if (data?.notifiedCount > 0) {
      addHistory({ type: 'info', message: `SMS sent to ${data.notifiedCount} contact(s)`, timestamp: new Date() });
    }
    if (level >= 2) {
      startTracking();
      addHistory({ type: 'info', message: 'Live GPS tracking started', timestamp: new Date() });
    }
  };

  const handleEscalate = async () => {
    await escalate();
    addHistory({ type: 'danger', message: `Escalated to Level ${(alertLevel || 1) + 1}`, timestamp: new Date() });
    if ((alertLevel || 1) >= 1) {
      startTracking();
      addHistory({ type: 'info', message: 'Live location streaming active', timestamp: new Date() });
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    await resolve();
    clearInterval(streamIntervalRef.current);
    addHistory({ type: 'success', message: 'Alert resolved — confirmed safe', timestamp: new Date() });
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2EC4B6', '#F4F1DE', '#0D1F2D'] });
    setIsResolving(false);
  };

  const getLevelColor = () => {
    if (alertLevel === 1) return 'text-teal shadow-[0_0_40px_rgba(46,196,182,0.3)]';
    if (alertLevel === 2) return 'text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]';
    if (alertLevel === 3) return 'text-red shadow-[0_0_60px_rgba(230,57,70,0.5)] animate-pulse';
    return 'text-ivory/20';
  };

  const countdownPercent = autoEscalateAt
    ? Math.max(0, (new Date(autoEscalateAt) - Date.now()) / (5 * 60 * 1000))
    : 0;

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
          <h1 className="font-syne text-3xl font-bold text-ivory">Alert Center</h1>
          <p className="text-ivory/50 mt-2">Manage emergency escalation and monitoring.</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest ${alertLevel ? 'bg-red text-white border-red' : 'text-ivory/40'}`}>
          {alertLevel ? `LEVEL ${alertLevel} ACTIVE` : 'SYSTEM STANDBY'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Alert View */}
        <div className="glass p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {alertLevel === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red z-0"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <motion.div
              key={alertLevel}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`font-syne text-[8rem] font-black leading-none mb-4 ${getLevelColor()}`}
            >
              {alertLevel || 0}
            </motion.div>

            <h2 className="font-syne text-xl font-bold mb-8 uppercase tracking-[0.3em] text-ivory/60">
              {alertLevel ? 'Emergency Level' : 'No Active Threats'}
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {!alertLevel ? (
                <>
                  <button onClick={() => handleTrigger(1)} className="px-6 py-3 bg-teal/10 border border-teal/30 text-teal rounded-xl font-bold hover:bg-teal/20 transition-all uppercase tracking-wider text-xs">
                    Trigger Level 1
                  </button>
                  <button onClick={() => handleTrigger(2)} className="px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl font-bold hover:bg-amber-500/20 transition-all uppercase tracking-wider text-xs">
                    Trigger Level 2
                  </button>
                  <button onClick={() => handleTrigger(3)} className="px-6 py-3 bg-red/10 border border-red/30 text-red rounded-xl font-bold hover:bg-red/20 transition-all uppercase tracking-wider text-xs">
                    Trigger Level 3
                  </button>
                </>
              ) : (
                <div className="w-full space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest mb-2">Status Report</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
                      <span className="flex items-center gap-2 text-teal"><ShieldCheck size={14} /> SMS Sent</span>
                      {alertLevel >= 2 && <span className="flex items-center gap-2 text-teal"><MapPin size={14} /> GPS Live</span>}
                      {alertLevel >= 3 && <span className="flex items-center gap-2 text-red"><Video size={14} /> Community Alerted</span>}
                      {location && (
                        <span className="text-ivory/40 text-[10px]">
                          {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>

                  {countdown && alertLevel < 3 && (
                    <div className="text-center">
                      <p className="text-xs text-ivory/40 mb-2 font-bold uppercase">Auto-escalating in {countdown}</p>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${countdownPercent * 100}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${countdownPercent < 0.2 ? 'bg-red' : 'bg-amber-500'}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleResolve}
                      disabled={isResolving}
                      className="btn-red w-full bg-teal hover:bg-teal/90 shadow-[0_0_20px_rgba(46,196,182,0.3)] disabled:opacity-50"
                    >
                      {isResolving ? 'Resolving...' : "I'M SAFE — RESOLVE ALERT"}
                    </button>
                    {alertLevel < 3 && (
                      <button onClick={handleEscalate} className="w-full py-3 border border-red/30 text-red rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red/5 transition-all flex items-center justify-center gap-2">
                        <Zap size={16} /> Escalate to Level {alertLevel + 1}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass p-8 flex flex-col">
          <h3 className="font-syne font-bold text-lg mb-6 flex items-center gap-2">
            <UserCheck className="text-teal" size={20} />
            Protection Log
          </h3>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
            <AnimatePresence initial={false}>
              {history.length === 0 ? (
                <p className="text-ivory/20 italic text-sm text-center py-10">No recent activity</p>
              ) : (
                history.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 items-start"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      event.type === 'danger' ? 'bg-red' :
                      event.type === 'success' ? 'bg-teal' :
                      event.type === 'info' ? 'bg-amber-400' : 'bg-ivory/40'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ivory/80 leading-tight mb-1">{event.message}</p>
                      <p className="text-[10px] text-ivory/30 uppercase font-bold tracking-widest">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] text-ivory/40 font-bold uppercase tracking-widest leading-relaxed">
              All data is encrypted and stored in the SHEild Evidence Vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
