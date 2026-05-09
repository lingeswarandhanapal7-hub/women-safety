import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, TrendingUp, AlertTriangle, Info, Loader2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import useLocationStore from '../store/useLocationStore';
import api from '../api';

const SafetyScorePage = () => {
  const { location } = useLocationStore();
  const [scoreData, setScoreData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchScore = async () => {
    try {
      const { data } = await api.get('/api/safety/score');
      setScoreData(data.score);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/api/safety/score/history');
      setHistory(data.scores.map(s => ({
        date: new Date(s.date).toLocaleDateString(),
        score: s.score
      })).reverse());
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchScore(), fetchHistory()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleManualAnalyze = async () => {
    if (!location) return;
    setIsAnalyzing(true);
    try {
      await api.post('/api/safety/analyze', {
        lat: location.lat,
        lng: location.lng
      });
      await Promise.all([fetchScore(), fetchHistory()]);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-teal" size={40} /></div>;
  }

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-end">
        <div>
          <h1 className="font-syne text-3xl font-bold text-ivory">Personal Safety Score</h1>
          <p className="text-ivory/50 mt-2">Dynamic risk evaluation based on your routine and surroundings.</p>
        </div>
        <button 
          onClick={handleManualAnalyze}
          disabled={isAnalyzing || !location}
          className="flex items-center gap-2 px-4 py-2 bg-teal/10 border border-teal/30 text-teal rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal/20 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Recalculate Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 glass p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`font-syne text-[6rem] font-black leading-none mb-2 ${
                  scoreData?.score > 70 ? 'text-teal' : scoreData?.score > 40 ? 'text-amber-500' : 'text-red'
                }`}
              >
                {scoreData?.score || 0}
              </motion.div>
              <h2 className="font-syne text-lg font-bold text-ivory/60 uppercase tracking-[0.3em]">SAFETY INDEX</h2>
           </div>
           
           <div className="mt-8 w-full space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                 <span className="text-[10px] font-bold text-ivory/40 uppercase tracking-widest">Status</span>
                 <span className="text-xs font-bold text-teal">{scoreData?.score > 70 ? 'SECURE' : 'CAUTION'}</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 glass p-8 flex flex-col">
          <h3 className="font-syne font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-teal" size={20} />
            7-Day Stability Trend
          </h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.length > 0 ? history : [{date: 'No Data', score: 0}]}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1F2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#2EC4B6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#2EC4B6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8">
           <h3 className="font-syne font-bold text-ivory mb-6 flex items-center gap-2">
              <Activity size={18} className="text-teal" />
              Risk Analysis Factors
           </h3>
           <div className="space-y-6">
              {[
                { label: 'Routine Deviation', value: scoreData?.factors?.routineDeviation || 0, weight: 0.4 },
                { label: 'Geospatial Risk', value: scoreData?.factors?.locationRisk || 0, weight: 0.3 },
                { label: 'Temporal Vulnerability', value: scoreData?.factors?.timeRisk || 0, weight: 0.2 },
                { label: 'Recent Alert Correlation', value: scoreData?.factors?.recentAlerts || 0, weight: 0.1 }
              ].map((factor) => (
                <div key={factor.label}>
                   <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-ivory/60 uppercase">{factor.label}</span>
                      <span className="text-xs font-bold text-ivory">{factor.value}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.value}%` }}
                        className={`h-full ${factor.value > 60 ? 'bg-red' : factor.value > 30 ? 'bg-amber-500' : 'bg-teal'}`}
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass p-8 bg-teal/5 border border-teal/20 flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <Shield className="text-teal" size={24} />
                 <h3 className="font-syne font-bold text-ivory">Guardian AI Recommendations</h3>
              </div>
              <p className="text-sm text-ivory/80 leading-relaxed mb-6 italic">
                "{scoreData?.recommendation || "Maintain your current routine. Your movement patterns indicate high predictability and safety."}"
              </p>
           </div>
           <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
              <Info size={16} className="text-teal flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-ivory/50 font-bold uppercase leading-relaxed">
                 Scores are calculated every 6 hours automatically. Your privacy is preserved through differential location noise.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyScorePage;
