import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { User, Menu, X, Shield, MapPin, AlertTriangle, Settings, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../store/useUserStore';

const DashboardShell = () => {
  const { user } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { icon: LayoutGrid, path: '/dashboard/alerts', label: 'Alerts' },
    { icon: MapPin, path: '/dashboard/route', label: 'Route' },
    { icon: Shield, path: '/dashboard/community', label: 'Community' },
    { icon: Settings, path: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-navy/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[60]">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-ivory/80"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-syne font-bold text-teal tracking-widest text-sm italic">SHEild</span>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <User size={18} className="text-ivory/60" />
        </div>
      </div>

      {/* Desktop Sidebar / Mobile Menu Overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-[55] w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Overlay Background */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[50] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-x-hidden mt-16 md:mt-0 mb-20 md:mb-0">
        {/* Dashboard Top Header (Desktop only) */}
        <header className="hidden md:flex items-center justify-between mb-8 pb-6 border-b border-border-dim">
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
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-navy-glass backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[60]">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-teal' : 'text-ivory/40'}`}
            >
              <item.icon size={20} className={isActive ? 'scale-110' : ''} />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div layoutId="mobileActive" className="absolute -top-[1px] w-8 h-1 bg-teal rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardShell;
