import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Activity, ShieldAlert, Settings, AlertTriangle } from 'lucide-react';
import useAlertStore from '../store/useAlertStore';
import useLocationStore from '../store/useLocationStore';
import api from '../api';

const DISTRESS_KEYWORDS = ['help', 'stop', 'leave me alone', 'no please', 'let me go', 'bachao', 'danger'];

const DistressDetector = () => {
  const [isListening, setIsListening] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.75);
  const [transcript, setTranscript] = useState([]);
  const [detectedKeyword, setDetectedKeyword] = useState(null);
  const [distressScore, setDistressScore] = useState(0);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const { triggerAlert, addHistory } = useAlertStore();
  const { location } = useLocationStore();
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const startRealListening = async () => {
    // 1. Speech Recognition (keyword detection)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (e) => {
        const words = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
        setTranscript(prev => [words.slice(-60), ...prev].slice(0, 5));
        const found = DISTRESS_KEYWORDS.find(k => words.includes(k));
        if (found) {
          setDetectedKeyword(found);
          addHistory({ type: 'danger', message: `Distress keyword detected: "${found}"`, timestamp: new Date() });
          triggerAlert(1, 'voice', location);
        }
      };
      recognition.onerror = () => {};
      recognition.start();
      recognitionRef.current = recognition;
    }

    // 2. Microphone audio level + AI analysis
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio level analyser
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Send 5s audio chunks to backend for AI analysis
      const recorder = new MediaRecorder(stream, { timeslice: 5000 });
      recorder.ondataavailable = async (e) => {
        if (e.data.size === 0) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result.split(',')[1];
            const { data } = await api.post('/api/alerts/silent', {
              audioBase64: base64,
              lat: location?.lat,
              lng: location?.lng
            });
            setDistressScore(data.distressScore || 0);
            if (data.shouldTrigger) {
              triggerAlert(1, 'voice', location);
              addHistory({ type: 'danger', message: 'AI detected distress in voice pattern', timestamp: new Date() });
            }
          } catch {}
        };
        reader.readAsDataURL(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.log('Mic not available:', err.message);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setAudioLevel(0);
    setDetectedKeyword(null);
  };

  // Motion shake detection
  useEffect(() => {
    if (!motionEnabled) return;
    const handleMotion = (e) => {
      const { x = 0, y = 0, z = 0 } = e.accelerationIncludingGravity || {};
      const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (mag > 25) {
        triggerAlert(1, 'motion', location);
        addHistory({ type: 'danger', message: `Sudden motion detected (${mag.toFixed(0)}G) — alert triggered`, timestamp: new Date() });
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [motionEnabled, location]);

  // Start listening on mount
  useEffect(() => {
    if (isListening) startRealListening();
    else stopListening();
    return stopListening;
  }, [isListening]);

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
            <Mic size={24} />
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-ivory">Distress Monitor</h1>
            <p className="text-ivory/50 mt-1">Real-time voice, keyword & motion detection.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-teal animate-pulse' : 'bg-ivory/20'}`} />
          <span className="text-[10px] font-bold text-ivory/60 uppercase tracking-widest">
            {isListening ? 'Active' : 'Standby'}
          </span>
        </div>
      </div>

      {detectedKeyword && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl flex items-center gap-3"
        >
          <AlertTriangle className="text-red flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold text-red">Distress Keyword Detected: "{detectedKeyword}"</p>
            <p className="text-xs text-ivory/50 mt-1">Level 1 alert triggered automatically.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-10 flex flex-col items-center text-center">
          <div className="relative mb-12">
            <AnimatePresence>
              {isListening && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-teal/20 rounded-full"
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 border border-teal/10 rounded-full"
                  />
                </>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsListening(!isListening)}
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                isListening
                  ? 'bg-teal text-navy shadow-[0_0_50px_rgba(46,196,182,0.4)]'
                  : 'bg-white/5 text-ivory/40 border border-white/10'
              }`}
            >
              {isListening ? <Mic size={48} /> : <MicOff size={48} />}
            </button>
          </div>

          <h2 className="text-xl font-syne font-bold text-ivory mb-2">
            {isListening ? 'SHEild is Listening' : 'Monitoring Disabled'}
          </h2>
          <p className="text-sm text-ivory/50 mb-4 max-w-xs">
            {isListening
              ? 'Real-time keyword detection, audio AI analysis, and motion monitoring active.'
              : 'Tap the button to enable background distress detection.'}
          </p>

          {distressScore > 0 && (
            <div className="w-full mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ivory/40 font-bold uppercase">AI Distress Score</span>
                <span className={distressScore > 0.5 ? 'text-red font-bold' : 'text-teal font-bold'}>
                  {Math.round(distressScore * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${distressScore * 100}%` }}
                  className={`h-full rounded-full ${distressScore > 0.5 ? 'bg-red' : 'bg-teal'}`}
                />
              </div>
            </div>
          )}

          <div className="w-full h-12 flex items-center justify-center gap-1">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isListening ? Math.max(4, audioLevel * (Math.sin(i * 0.5) + 1) * 0.5) : 4
                }}
                transition={{ duration: 0.05 }}
                className={`w-1 rounded-full ${isListening ? 'bg-teal' : 'bg-ivory/10'}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-syne font-bold text-ivory flex items-center gap-2">
                <Settings size={18} className="text-ivory/40" />
                Thresholds
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-ivory/60 uppercase">Sensitivity</label>
                  <span className="text-xs font-bold text-teal">{Math.round(sensitivity * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-teal bg-white/5 h-1.5 rounded-full appearance-none"
                />
              </div>
              <div
                onClick={() => setMotionEnabled(!motionEnabled)}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Activity className="text-teal" size={18} />
                  <span className="text-sm font-medium text-ivory/80">Motion Trigger</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative p-1 transition-all ${motionEnabled ? 'bg-teal/20' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 bottom-1 w-3 rounded-full transition-all ${motionEnabled ? 'right-1 bg-teal' : 'left-1 bg-white/20'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8">
            <h3 className="font-syne font-bold text-ivory mb-6 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red" />
              Live Transcript
            </h3>
            <div className="space-y-3">
              {transcript.length === 0 ? (
                <p className="text-xs text-ivory/30 italic text-center py-4">Listening for speech...</p>
              ) : (
                transcript.map((word, i) => (
                  <motion.div
                    key={i + word}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm py-2 px-4 rounded-lg font-medium ${
                      DISTRESS_KEYWORDS.some(k => word.toLowerCase().includes(k))
                        ? 'bg-red/20 text-red border border-red/30'
                        : 'bg-white/5 text-ivory/60'
                    }`}
                  >
                    {word}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistressDetector;
