import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';
import useUserStore from '../store/useUserStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Community', href: '/#community' },
    { name: 'Download', href: '/#download' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        isScrolled ? 'bg-navy border-b border-border-dim' : 'bg-navy-glass backdrop-blur-xl border-b border-border-dim'
      }`}
    >
      <div className="container h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
             <Shield className="text-red w-8 h-8" />
             <div className="absolute inset-0 bg-red-glow rounded-full blur-md -z-10" />
          </div>
          <span className="font-syne text-2xl font-bold tracking-tight">
            <span className="text-red">SHE</span>
            <span className="text-ivory">ild</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-ivory/70 hover:text-ivory transition-colors font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/auth" className="text-ivory font-medium px-4 py-2 border border-ivory/20 rounded-lg hover:bg-ivory/10 transition-all">
                Sign In
              </Link>
              <Link to="/auth" className="btn-red">
                Get SHEild
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn-red">
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden text-ivory p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-navy border-b border-border-dim lg:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-ivory/80 text-lg py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-border-dim my-2" />
              <Link to="/auth" className="text-center py-3 border border-border-dim rounded-lg" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
              <Link to="/auth" className="btn-red text-center" onClick={() => setIsOpen(false)}>
                Get SHEild
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
