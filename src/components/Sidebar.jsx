import React from 'react';
import { NavLink } from 'react-router-dom';
import { FEATURES } from '../constants/features';
import { 
  LayoutDashboard, Bell, Settings, LogOut, 
  ShieldCheck, AlertCircle, TrendingUp,
  Watch, Phone, Archive
} from 'lucide-react';
import useUserStore from '../store/useUserStore';

const Sidebar = ({ onClose }) => {
  const { logout } = useUserStore();

  const sections = [
    {
      label: 'PROTECTION',
      items: [
        { name: 'Alert Center', icon: Bell, path: '/dashboard/alerts' },
        { name: 'Distress Monitor', icon: FEATURES[0].icon, path: '/dashboard/distress' },
        { name: 'Safety Score', icon: TrendingUp, path: '/dashboard/score' },
      ]
    },
    {
      label: 'NAVIGATION',
      items: [
        { name: 'Safe Route', icon: FEATURES[2].icon, path: '/dashboard/route' },
        { name: 'Shadow Mode', icon: FEATURES[6].icon, path: '/dashboard/shadow' },
      ]
    },
    {
      label: 'COMMUNITY',
      items: [
        { name: 'Community Shield', icon: FEATURES[4].icon, path: '/dashboard/community' },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { name: 'Evidence Vault', icon: Archive, path: '/dashboard/evidence' },
        { name: 'Fake Call', icon: Phone, path: '/dashboard/fakecall' },
        { name: 'Wearable Panel', icon: Watch, path: '/dashboard/wearable' },
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
      ]
    }
  ];

  return (
    <aside className="h-full w-full border-r border-border-dim bg-navy overflow-y-auto">
      <div className="py-6">
        <div className="px-6 mb-8 md:hidden flex items-center justify-between">
           <span className="font-syne font-bold text-teal tracking-widest text-lg italic">SHEild</span>
        </div>

        {sections.map((section) => (
          <div key={section.label} className="mb-8">
            <h3 className="px-6 mb-3 text-[10px] font-bold tracking-widest text-ivory/40 uppercase">
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-6 py-2.5 transition-all group relative ${
                      isActive 
                        ? 'text-red bg-red/5' 
                        : 'text-ivory/60 hover:text-ivory hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red" />
                      )}
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red' : 'group-hover:text-ivory'}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
        
        <div className="px-6 mt-8">
          <button 
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 text-ivory/60 hover:text-red transition-colors w-full text-left py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
