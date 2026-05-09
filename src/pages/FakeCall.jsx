import React, { useState, useEffect, useRef } from 'react';
import { Shield, Phone, PhoneOff, User, Mic, Video, Settings, Play, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAlertStore from '../store/useAlertStore';
import useLocationStore from '../store/useLocationStore';
import useSocketStore from '../store/useSocketStore';
import api from '../api';

const SCRIPTS = {
  'Standard Check-in': "Hey! Are you on your way? Great, I'll be outside waiting. Just call me when you're two minutes away, okay?",
  'Firm Conversation': "Listen, I told you I need to leave right now. Yes, someone is waiting for me. I have to go immediately. I'm already late.",
  'Urgent Pickup': "Pick me up now, please. Yes, right now. I'm at the location I sent you. Please hurry, I'll explain later."
};

const FakeCall = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [callerName, setCallerName] = useState('Dad');
  const [selectedScript, setSelectedScript] = useState('Standard Check-in');
  const [timer, setTimer] = useState(0);
  const [isSilentRecording, setIsSilentRecording] = useState(false);
  const audioRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const { activeAlert } = useAlertStore();
  const { location } = useLocationStore();
  const { socket } = useSocketStore();

  useEffect(() => {
    let interval;
    if (isAnswered) interval = setInterval(() => setTimer(t => t + 1), 1000);
    else setTimer(0);
    return () => clearInterval(interval);
  }, [isAnswered]);

  // Shake detection to trigger call
  useEffect(() => {
    let lastTap = 0;
    const handleMotion = (e) => {
      const { x = 0, y = 0, z = 0 } = e.accelerationIncludingGravity || {};
      const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (mag > 20) {
        const now = Date.now();
        if (now - lastTap < 500) startCall();
        lastTap = now;
      }
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    // Play ringtone via oscillator (no file needed)
    try {
      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();

      // Ringtone rhythm
      const stop = () => { try { osc.stop(); ctx.close(); } catch {} };
      audioRef.current = { stop };

      // Auto-stop after 30s
      setTimeout(stop, 30000);
    } catch {}

    setIsCalling(true);
  };

  const answerCall = async () => {
    audioRef.current?.stop();
    setIsAnswered(true);

    // Speak the script via SpeechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(SCRIPTS[selectedScript]);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira'));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }

    // Silent camera + mic recording during call
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setIsSilentRecording(true);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = async (e) => {
        if (!activeAlert?._id || e.data.size === 0) return;
        const formData = new FormData();
        formData.append('file', e.data, `call-${Date.now()}.webm`);
        formData.append('alertId', activeAlert._id);
        formData.append('type', 'video');
        try { await api.post('/api/evidence/upload', formData); } catch {}
      };
      recorder.start(30000); // chunk every 30s
      recorderRef.current = recorder;
    } catch {}

    // Stream location via socket
    if (socket && activeAlert?._id) {
      locationIntervalRef.current = setInterval(() => {
        const loc = useLocationStore.getState().location;
        if (loc) socket.emit('location:update', { ...loc, alertId: activeAlert._id });
      }, 5000);
    }
  };

  const endCall = () => {
    audioRef.current?.stop();
    window.speechSynthesis.cancel();
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(locationIntervalRef.current);
    setIsCalling(false);
    setIsAnswered(false);
    setIsSilentRecording(false);
  };

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-ivory">Fake Call Shield</h1>
            <p className="text-ivory/50 mt-1">Deter harassment with a realistic safety call. Double-shake to trigger instantly.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="glass p-8 space-y-8">
          <h3 className="font-syne font-bold text-ivory flex items-center gap-2">
            <Settings size={18} className="text-ivory/40" />
            Call Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ivory/40 uppercase tracking-widest block mb-2">Caller Identity</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/20" size={18} />
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-ivory focus:outline-none focus:border-teal/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ivory/40 uppercase tracking-widest block mb-2">Scenario Script</label>
              <select
                value={selectedScript}
                onChange={(e) => setSelectedScript(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-ivory focus:outline-none focus:border-teal/50"
              >
                {Object.keys(SCRIPTS).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-ivory/50 italic leading-relaxed">
              "{SCRIPTS[selectedScript]}"
            </div>

            <div className="flex items-center justify-between p-4 bg-teal/5 border border-teal/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Mic className="text-teal" size={18} />
                <div>
                  <p className="text-sm font-medium text-ivory/80">Silent Recording</p>
                  <p className="text-[10px] text-ivory/40">Records surroundings during call</p>
                </div>
              </div>
              {isSilentRecording && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red rounded-full animate-pulse" />
                  <span className="text-[10px] text-red font-bold">REC</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={startCall} className="btn-red w-full flex items-center justify-center gap-3 py-4">
            <Phone size={20} />
            <span className="uppercase tracking-widest text-sm font-bold">Trigger Call Now</span>
          </button>
        </div>

        {/* Info Panel */}
        <div className="glass p-8 flex flex-col justify-center text-center bg-[radial-gradient(circle_at_center,_rgba(46,196,182,0.05),_transparent)]">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Play size={32} className="text-teal" />
            </div>
            <h3 className="font-syne font-bold text-ivory text-xl">Quick Trigger</h3>
            <p className="text-sm text-ivory/50 mt-2">Double-shake your phone to instantly trigger this fake call scenario.</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Phone, label: 'Realistic ringtone plays via Web Audio' },
              { icon: ShieldCheck, label: 'AI voice speaks the script' },
              { icon: Video, label: 'Silent camera records surroundings' },
              { icon: Mic, label: 'Location streamed to emergency contacts' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-left p-3 bg-white/5 rounded-lg">
                <Icon size={16} className="text-teal flex-shrink-0" />
                <span className="text-xs text-ivory/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-between py-24 px-6"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: isAnswered ? 0 : [-1, 1, -1] }}
                transition={{ duration: 0.2, repeat: isAnswered ? 0 : Infinity }}
                className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10"
              >
                <User size={64} className="text-ivory/40" />
              </motion.div>
              <h2 className="text-4xl font-syne font-bold text-ivory mb-2">{callerName}</h2>
              <p className="text-teal font-bold uppercase tracking-[0.2em] text-xs">
                {isAnswered ? formatTime(timer) : 'Incoming SHEild Call...'}
              </p>
              {isSilentRecording && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-red rounded-full animate-pulse" />
                  <span className="text-[10px] text-red font-bold uppercase tracking-widest">Recording</span>
                </div>
              )}
            </div>

            {!isAnswered ? (
              <div className="flex gap-20">
                <div className="flex flex-col items-center gap-4">
                  <button onClick={endCall} className="w-20 h-20 bg-red rounded-full flex items-center justify-center shadow-lg shadow-red/20">
                    <PhoneOff size={32} className="text-white" />
                  </button>
                  <span className="text-xs font-bold text-ivory/40 uppercase tracking-widest">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button onClick={answerCall} className="w-20 h-20 bg-teal rounded-full flex items-center justify-center shadow-lg shadow-teal/20">
                    <Phone size={32} className="text-navy" />
                  </button>
                  <span className="text-xs font-bold text-ivory/40 uppercase tracking-widest">Answer</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8 w-full max-w-xs">
                <div className="grid grid-cols-3 gap-8 w-full">
                  {[Mic, Video, Shield].map((Icon, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-ivory/60">
                        <Icon size={24} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={endCall} className="w-20 h-20 bg-red rounded-full flex items-center justify-center shadow-lg shadow-red/20">
                  <PhoneOff size={32} className="text-white" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FakeCall;
