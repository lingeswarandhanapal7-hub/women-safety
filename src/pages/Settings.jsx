import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Shield, Lock, Bell, Moon, LogOut, Save, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import useSettingsStore from '../store/useSettingsStore';
import useUserStore from '../store/useUserStore';

const Settings = () => {
  const { contacts, addContact, removeContact, biometricsEnabled, setBiometrics, syncFromBackend } = useSettingsStore();
  const { user, logout, updateProfile } = useUserStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    syncFromBackend();
  }, []);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      addContact(newContact);
      setNewContact({ name: '', phone: '', email: '' });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[800px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
           <h1 className="font-syne text-3xl font-bold text-ivory">Security Settings</h1>
           <p className="text-ivory/50 mt-2">Configure your protection protocols and trusted network.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red/10 border border-red/20 text-red rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red/20 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="glass p-8">
           <div className="flex items-center gap-3 mb-8">
              <User className="text-teal" size={24} />
              <h3 className="font-syne font-bold text-xl text-ivory">Identity Profile</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Full Name</label>
                 <input 
                  type="text" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-ivory focus:outline-none focus:border-teal/50"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Your Phone</label>
                 <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-ivory focus:outline-none focus:border-teal/50"
                 />
              </div>
           </div>

           <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  saveSuccess ? 'bg-teal text-navy' : 'bg-white/5 border border-white/10 text-ivory hover:bg-white/10'
                }`}
              >
                 {isSaving ? <Loader2 size={16} className="animate-spin" /> : (saveSuccess ? <Check size={16} /> : <Save size={16} />)}
                 {saveSuccess ? 'Profile Updated' : 'Save Changes'}
              </button>
           </div>
        </div>

        {/* Trusted Contacts */}
        <div className="glass p-8">
           <div className="flex items-center gap-3 mb-8">
              <Shield className="text-teal" size={24} />
              <h3 className="font-syne font-bold text-xl text-ivory">Emergency Contacts</h3>
           </div>

           <div className="space-y-4 mb-8">
              <AnimatePresence initial={false}>
                {contacts.length === 0 ? (
                  <p className="text-center py-6 text-ivory/20 italic text-sm border border-dashed border-white/10 rounded-xl">No emergency contacts added yet.</p>
                ) : (
                  contacts.map((contact) => (
                    <motion.div 
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold uppercase">
                             {contact.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-ivory">{contact.name}</p>
                             <p className="text-[10px] text-ivory/30 font-bold uppercase">{contact.phone}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => removeContact(contact.id)}
                        className="p-2 text-ivory/20 hover:text-red transition-colors"
                       >
                          <Trash2 size={18} />
                       </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
           </div>

           <form onSubmit={handleAddContact} className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <h4 className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest mb-4">Add New Trusted Guardian</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <input 
                  type="text" 
                  placeholder="Contact Name" 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="bg-navy/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-ivory focus:outline-none focus:border-teal/50"
                 />
                 <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="bg-navy/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-ivory focus:outline-none focus:border-teal/50"
                 />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-teal text-navy rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal/90 transition-all"
              >
                 <Plus size={18} /> Add Contact
              </button>
           </form>
        </div>

        {/* Security Preferences */}
        <div className="glass p-8">
           <div className="flex items-center gap-3 mb-8">
              <Lock className="text-teal" size={24} />
              <h3 className="font-syne font-bold text-xl text-ivory">Protocols</h3>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-bold text-ivory">Biometric Validation</p>
                    <p className="text-[10px] text-ivory/40 uppercase font-bold">Require Fingerprint/FaceID to dismiss alerts</p>
                 </div>
                 <button 
                  onClick={() => setBiometrics(!biometricsEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-all ${biometricsEnabled ? 'bg-teal' : 'bg-white/10'}`}
                 >
                    <motion.div 
                      animate={{ x: biometricsEnabled ? 26 : 4 }}
                      className={`absolute top-1 w-4 h-4 rounded-full ${biometricsEnabled ? 'bg-navy' : 'bg-ivory/20'}`}
                    />
                 </button>
              </div>

              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-sm font-bold text-ivory">Stealth Logging</p>
                    <p className="text-[10px] text-ivory/40 uppercase font-bold">Log GPS data silently during high-risk times</p>
                 </div>
                 <div className="w-12 h-6 bg-teal rounded-full relative">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-navy rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
