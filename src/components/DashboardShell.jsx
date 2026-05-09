import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import useUserStore from '../store/useUserStore';

const DashboardShell = () => {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-navy pt-16 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-60 p-6 md:p-10 min-w-0 overflow-x-hidden">
        {/* Dashboard Top Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-border-dim">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal/10 rounded-full border border-teal/20">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-semibold text-teal tracking-wide">AI SHIELD ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-ivory/50 font-bold uppercase tracking-wider">Safety Score</p>
              <p className="text-xl font-syne font-bold text-teal leading-none">84</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-border-dim flex items-center justify-center border border-white/10 overflow-hidden">
                <User className="text-ivory/60" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-ivory">{user?.name || 'Shield User'}</p>
                <p className="text-[10px] text-ivory/50">{user?.email || 'Protected Member'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-glass backdrop-blur-xl border-t border-border-dim flex items-center justify-around px-4 z-50">
        {/* Mobile menu items */}
      </div>
    </div>
  );
};

export default DashboardShell;
