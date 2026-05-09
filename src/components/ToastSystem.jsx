import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const toast = {
    success: (msg) => addToast('success', msg),
    warning: (msg) => addToast('warning', msg),
    danger: (msg) => addToast('danger', msg),
    info: (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 w-full max-w-[320px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`glass p-4 border-l-4 flex items-start gap-4 shadow-2xl ${
                t.type === 'success' ? 'border-teal' :
                t.type === 'warning' ? 'border-amber-500' :
                t.type === 'danger' ? 'border-red' : 'border-ivory/20'
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${
                t.type === 'success' ? 'text-teal' :
                t.type === 'warning' ? 'text-amber-500' :
                t.type === 'danger' ? 'text-red' : 'text-ivory/60'
              }`}>
                {t.type === 'success' && <CheckCircle size={18} />}
                {t.type === 'warning' && <AlertTriangle size={18} />}
                {t.type === 'danger' && <AlertCircle size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-ivory leading-tight">{t.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                className="text-ivory/20 hover:text-ivory transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
