import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Navigation, Phone, Map as MapIcon, Info, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocationStore from '../store/useLocationStore';
import useAlertStore from '../store/useAlertStore';
import api from '../api';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ShadowMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { location, history } = useLocationStore();
  const { triggerAlert, addHistory } = useAlertStore();
  const analysisIntervalRef = useRef(null);

  const position = location?.lat && location?.lng ? [location.lat, location.lng] : [13.0827, 80.2707];
  const historyPath = history.map(h => [h.lat, h.lng]);

  useEffect(() => {
    if (isActive) {
      analysisIntervalRef.current = setInterval(async () => {
        if (history.length < 5) return;
        
        setIsAnalyzing(true);
        try {
          const { data } = await api.post('/api/safety/shadow', {
            locationHistory: history.slice(-20)
          });
          
          setConfidence(data.confidence * 100);
          
          if (data.followingDetected && data.confidence > 0.8) {
            triggerAlert(1, 'ai_behavior', location);
            addHistory({ 
              type: 'danger', 
              message: `Shadow Mode: Persistent tail detected (${(data.confidence * 100).toFixed(0)}% confidence)`, 
              timestamp: new Date() 
            });
          }
        } catch (err) {
          console.error("Shadow analysis failed", err);
        } finally {
          setIsAnalyzing(false);
        }
      }, 10000); // Analyze every 10 seconds
    } else {
      clearInterval(analysisIntervalRef.current);
      setConfidence(0);
    }
    return () => clearInterval(analysisIntervalRef.current);
  }, [isActive, history, location]);

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-start">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
              <Eye size={24} />
           </div>
           <div>
              <h1 className="font-syne text-3xl font-bold text-ivory">Shadow Mode</h1>
              <p className="text-ivory/50 mt-1">Detects and alerts you if you're being followed using behavioral ML.</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
           <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-teal animate-pulse' : 'bg-ivory/20'}`} />
           <span className="text-[10px] font-bold text-ivory/60 uppercase tracking-widest">
             {isActive ? 'Scanning' : 'Standby'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="glass p-10 flex flex-col items-center text-center">
              <div className="relative mb-8">
                 <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-teal rounded-full blur-2xl"
                      />
                    )}
                 </AnimatePresence>
                 <div className={`relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                   isActive ? 'bg-teal/10 border-teal text-teal shadow-[0_0_30px_rgba(46,196,182,0.2)]' : 'bg-white/5 border-white/10 text-ivory/20'
                 }`}>
                    {isAnalyzing ? <Loader2 size={40} className="animate-spin" /> : <Eye size={40} />}
                 </div>
              </div>

              <h2 className="text-xl font-syne font-bold text-ivory mb-2">Tail Detection</h2>
              <p className="text-sm text-ivory/50 mb-8 max-w-xs">
                Analyzing movement patterns to identify persistent proximity from unknown sources.
              </p>

              <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
                  isActive ? 'bg-red text-white' : 'btn-red'
                }`}
              >
                 {isActive ? 'Disable Protection' : 'Enable Shadow Mode'}
              </button>
           </div>

           <div className="glass p-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-syne font-bold text-ivory text-sm uppercase tracking-widest">Risk Level</h3>
                 <span className={`text-sm font-bold ${confidence > 70 ? 'text-red' : confidence > 40 ? 'text-amber-500' : 'text-teal'}`}>{Math.round(confidence)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${confidence}%` }}
                   className={`h-full transition-colors duration-1000 ${confidence > 70 ? 'bg-red' : confidence > 40 ? 'bg-amber-500' : 'bg-teal'}`}
                 />
              </div>
              <p className="text-[10px] text-ivory/40 font-bold uppercase leading-relaxed">
                {confidence < 40 ? 'No suspicious patterns detected in your movement.' : 'Suspicious pattern detected. Change your direction or find a safe zone.'}
              </p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="map-container relative z-0 h-[300px] rounded-2xl overflow-hidden border border-white/5">
              <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {historyPath.length > 1 && (
                  <Polyline pathOptions={{ color: '#2EC4B6', weight: 4, dashArray: '10, 10' }} positions={historyPath} />
                )}
                <CircleMarker center={position} radius={8} pathOptions={{ color: '#2EC4B6', fillColor: '#2EC4B6', fillOpacity: 0.8 }} />
              </MapContainer>
           </div>

           <div className="glass p-8 space-y-4">
              <h3 className="font-syne font-bold text-ivory flex items-center gap-2">
                 <ShieldAlert size={18} className="text-red" />
                 Evasive Actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                 <button 
                  onClick={() => window.location.hash = '#/dashboard/route'}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                    <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center text-teal flex-shrink-0">
                       <Navigation size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-ivory">Route to Safe Place</p>
                       <p className="text-[10px] text-ivory/40 uppercase font-bold">Find nearest safe haven</p>
                    </div>
                 </button>
                 <button 
                  onClick={() => window.location.href = 'tel:911'}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
                >
                    <div className="w-10 h-10 bg-red/10 rounded-lg flex items-center justify-center text-red flex-shrink-0">
                       <Phone size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-ivory">Emergency Call</p>
                       <p className="text-[10px] text-ivory/40 uppercase font-bold">Direct line to authorities</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowMode;
