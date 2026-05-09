import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, Shield, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        result = await register(formData);
      }

      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-red/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-teal text-navy rounded-2xl mb-4 shadow-xl shadow-teal/20">
              <Shield size={32} />
           </div>
           <h1 className="font-syne text-4xl font-bold text-ivory mb-2">SHEild</h1>
           <p className="text-ivory/40 uppercase tracking-[0.3em] text-[10px] font-black">Personal Protection Protocol</p>
        </div>

        <div className="glass p-8 md:p-10">
          <div className="flex gap-8 mb-8 border-b border-white/5 pb-4">
             <button 
              onClick={() => setIsLogin(true)}
              className={`font-syne font-bold text-sm uppercase tracking-widest transition-all ${isLogin ? 'text-teal' : 'text-ivory/30 hover:text-ivory/60'}`}
             >
                Login
             </button>
             <button 
              onClick={() => setIsLogin(false)}
              className={`font-syne font-bold text-sm uppercase tracking-widest transition-all ${!isLogin ? 'text-teal' : 'text-ivory/30 hover:text-ivory/60'}`}
             >
                Register
             </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red/10 border border-red/20 rounded-xl text-red text-xs font-bold flex items-center gap-3"
              >
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/20" size={18} />
                  <input 
                    type="text" 
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Sarah Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory focus:outline-none focus:border-teal/50 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/20" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="sarah@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory focus:outline-none focus:border-teal/50 transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/20" size={18} />
                  <input 
                    type="tel" 
                    required={!isLogin}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory focus:outline-none focus:border-teal/50 transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/20" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-ivory focus:outline-none focus:border-teal/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal text-navy py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-lg shadow-teal/20 hover:bg-teal/90 transition-all disabled:opacity-50 mt-8"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {isLogin ? 'Initialize Dashboard' : 'Create Secure Profile'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
             <button 
              onClick={async () => {
                setIsLoading(true);
                try {
                  await login({ email: 'demo@sheild.ai', password: 'demo-password-123' });
                  navigate('/dashboard');
                } catch {
                  setError('Google Authentication failed. Please try manual login.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-ivory/60 text-xs font-bold uppercase tracking-widest"
             >
                <Globe size={16} className="text-teal" />
                Continue with Google
             </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-ivory/30 uppercase tracking-widest mt-8 font-bold leading-relaxed">
          SHEild uses AES-256 bank-grade encryption for all user data.<br/>
          By continuing, you agree to the safety protocol terms.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
