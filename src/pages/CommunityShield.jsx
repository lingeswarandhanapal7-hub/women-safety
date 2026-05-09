import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, AlertTriangle, MessageSquare, Plus, Navigation, Filter, Loader2, ThumbsUp } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocationStore from '../store/useLocationStore';
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

const CommunityShield = () => {
  const { location } = useLocationStore();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddReport, setShowAddReport] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newReport, setNewReport] = useState({ type: 'unsafe_area', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const center = location?.lat && location?.lng ? [location.lat, location.lng] : [13.0827, 80.2707];

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/community/heatmap');
      setReports(data.reports || []);
    } catch (err) {
      console.error("Failed to fetch community reports", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return;
    setIsSubmitting(true);
    try {
      await api.post('/api/community/report', {
        ...newReport,
        lat: location.lat,
        lng: location.lng
      });
      setShowAddReport(false);
      setNewReport({ type: 'unsafe_area', description: '' });
      fetchReports();
    } catch (err) {
      console.error("Failed to submit report", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      await api.patch(`/api/community/upvote/${id}`);
      setReports(prev => prev.map(r => r._id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
    } catch {}
  };

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.type === filter);

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
          <h1 className="font-syne text-3xl font-bold text-ivory">Community Shield</h1>
          <p className="text-ivory/50 mt-2">Real-time safety crowdsourcing from local members.</p>
        </div>
        <button 
          onClick={() => setShowAddReport(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal text-navy rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-teal/90 transition-all"
        >
          <Plus size={18} /> Report Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="map-container relative z-0 h-[400px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <MapContainer center={center} zoom={14} className="h-full w-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {filteredReports.map((report) => (
                <CircleMarker 
                  key={report._id}
                  center={[report.location.coordinates[1], report.location.coordinates[0]]} 
                  radius={12}
                  pathOptions={{ 
                    color: report.type === 'well_lit' || report.type === 'safe_zone' ? '#2EC4B6' : '#E63946',
                    fillColor: report.type === 'well_lit' || report.type === 'safe_zone' ? '#2EC4B6' : '#E63946',
                    fillOpacity: 0.6 
                  }}
                >
                  <Popup>
                    <div className="p-2 text-navy">
                      <p className="font-bold uppercase text-[10px] mb-1">{report.type.replace('_', ' ')}</p>
                      <p className="text-sm">{report.description}</p>
                      <p className="text-[10px] mt-2 opacity-50">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {location && <CircleMarker center={[location.lat, location.lng]} radius={6} pathOptions={{ color: '#FFFFFF', fillColor: '#FFFFFF', fillOpacity: 1 }} />}
            </MapContainer>
          </div>

          <div className="glass p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-syne font-bold text-ivory text-sm uppercase tracking-widest">Local Activity</h3>
               <div className="flex gap-2">
                 <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold px-3 py-1.5 text-ivory focus:outline-none"
                 >
                   <option value="all">All Alerts</option>
                   <option value="unsafe_area">Unsafe Areas</option>
                   <option value="harassment">Harassment</option>
                   <option value="well_lit">Well Lit</option>
                   <option value="safe_zone">Safe Zones</option>
                 </select>
               </div>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal" /></div>
              ) : filteredReports.length === 0 ? (
                <p className="text-center py-10 text-ivory/20 italic">No reports in this area yet.</p>
              ) : (
                filteredReports.map((report) => (
                  <div key={report._id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4 hover:bg-white/10 transition-all">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      report.type === 'well_lit' || report.type === 'safe_zone' ? 'bg-teal/10 text-teal' : 'bg-red/10 text-red'
                    }`}>
                      {report.type === 'well_lit' || report.type === 'safe_zone' ? <Shield size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-ivory uppercase tracking-wider">{report.type.replace('_', ' ')}</p>
                        <span className="text-[10px] text-ivory/30 font-bold">{new Date(report.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-ivory/60 mb-3">{report.description}</p>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleUpvote(report._id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-teal hover:text-teal/80 transition-all"
                        >
                          <ThumbsUp size={12} /> {report.upvotes || 0} CONFIRMATIONS
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-8">
              <h3 className="font-syne font-bold text-ivory mb-6 flex items-center gap-2">
                 <Filter size={18} className="text-teal" />
                 Safety Legend
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red shadow-[0_0_10px_rgba(230,57,70,0.5)]" />
                    <span className="text-xs text-ivory/60 font-medium">Active Threat / Unsafe</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-xs text-ivory/60 font-medium">Caution Advised</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-teal shadow-[0_0_10px_rgba(46,196,182,0.5)]" />
                    <span className="text-xs text-ivory/60 font-medium">Verified Safe Zone</span>
                 </div>
              </div>
           </div>

           <div className="glass p-8 bg-teal/5 border border-teal/20">
              <h3 className="font-syne font-bold text-teal mb-4 text-xs uppercase tracking-widest">Member Status</h3>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center text-teal border border-teal/30">
                    <Shield size={24} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-ivory">Verified Member</p>
                    <p className="text-[10px] text-teal font-bold uppercase tracking-widest">Level 4 Guardian</p>
                 </div>
              </div>
              <p className="text-[10px] text-ivory/40 leading-relaxed uppercase font-bold">
                 Your contributions help keep 4,281 women in your area safe. Thank you for your service.
              </p>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-8 w-full max-w-md"
            >
              <h2 className="font-syne text-2xl font-bold text-ivory mb-6">Report Incident</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-ivory/40 uppercase tracking-widest block mb-2">Incident Type</label>
                  <select 
                    value={newReport.type}
                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-ivory focus:outline-none focus:border-teal/50"
                  >
                    <option value="unsafe_area">Unsafe Area</option>
                    <option value="harassment">Harassment</option>
                    <option value="well_lit">Well Lit</option>
                    <option value="safe_zone">Safe Zone</option>
                    <option value="crowd_alert">Crowd Alert</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-ivory/40 uppercase tracking-widest block mb-2">Description</label>
                  <textarea 
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-ivory focus:outline-none focus:border-teal/50 resize-none"
                    placeholder="Briefly describe what happened or what you saw..."
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddReport(false)}
                    className="flex-1 py-3 border border-white/10 text-ivory/60 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-red text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red/90 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityShield;
