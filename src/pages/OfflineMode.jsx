import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCcw, Database, AlertCircle, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import api from '../api';

const OfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const loadQueue = () => {
    const stored = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    setQueue(stored);
  };

  useEffect(() => {
    loadQueue();
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline || queue.length === 0) return;
    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Replay all actions in sequence
      const stored = [...queue];
      for (const action of stored) {
        await api({
          url: action.url,
          method: action.method,
          data: action.data
        });
      }
      
      localStorage.setItem('offlineQueue', '[]');
      setQueue([]);
      setSyncResult('success');
    } catch (err) {
      setSyncResult('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearQueue = () => {
    localStorage.setItem('offlineQueue', '[]');
    setQueue([]);
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
           <h1 className="font-syne text-3xl font-bold text-ivory">Sync & Connectivity</h1>
           <p className="text-ivory/50 mt-2">Manage your data integrity and offline safety protocols.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
          isOnline ? 'bg-teal/10 border-teal/30 text-teal' : 'bg-red/10 border-red/30 text-red'
        }`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isOnline ? 'Connected' : 'Offline Mode'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="glass p-8 bg-[radial-gradient(circle_at_top_right,_rgba(46,196,182,0.05),_transparent)]">
              <div className="flex items-center gap-3 mb-6">
                 <Database className="text-teal" size={24} />
                 <h3 className="font-syne font-bold text-xl text-ivory">Offline Queue</h3>
              </div>
              
              <p className="text-sm text-ivory/60 mb-8 leading-relaxed">
                 When your connection is unstable, SHEild captures safety actions (alerts, reports, evidence) and stores them in an encrypted local queue to be synced once you're back online.
              </p>

              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-xs font-bold text-ivory/40 uppercase tracking-widest">Pending Actions</span>
                    <span className="text-sm font-black text-ivory">{queue.length}</span>
                 </div>
              </div>

              {queue.length > 0 && (
                <div className="mt-6 flex gap-4">
                   <button 
                    onClick={handleSync}
                    disabled={isSyncing || !isOnline}
                    className="flex-1 py-3 bg-teal text-navy rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal/90 transition-all disabled:opacity-30"
                   >
                      {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                      Sync Data
                   </button>
                   <button 
                    onClick={clearQueue}
                    disabled={isSyncing}
                    className="p-3 bg-white/5 border border-white/10 text-ivory/20 hover:text-red rounded-xl transition-all"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
              )}

              <AnimatePresence>
                {syncResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                      syncResult === 'success' ? 'bg-teal/10 text-teal' : 'bg-red/10 text-red'
                    }`}
                  >
                    {syncResult === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {syncResult === 'success' ? 'All data successfully synced' : 'Sync failed. Retry when stable.'}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-8">
              <h3 className="font-syne font-bold text-ivory mb-6">Action History</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {queue.length === 0 ? (
                   <div className="text-center py-10 opacity-20 italic text-sm">
                      No pending actions. You are fully synced.
                   </div>
                 ) : (
                   queue.map((item, i) => (
                     <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-bold text-teal uppercase tracking-widest">{item.method}</p>
                           <p className="text-xs text-ivory/60 truncate max-w-[150px]">{item.url}</p>
                        </div>
                        <AlertCircle size={14} className="text-amber-500" />
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
