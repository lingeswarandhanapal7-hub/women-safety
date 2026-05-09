import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, Shield, User, Bot, Loader2 } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import useAlertStore from '../store/useAlertStore';
import useLocationStore from '../store/useLocationStore';

const SYSTEM_PROMPT = `You are SHEild, a personal AI safety companion for women.
Check on the user's safety, detect distress in messages, give brief calm actionable safety advice.
If the user sounds in danger suggest triggering an alert immediately.
Keep all responses under 60 words. Be warm, direct, never alarmist without cause.
If user says "trigger alert" or "help me", respond with: "ALERT_TRIGGER: [your message]" to indicate an alert should be fired.`;

const QUICK_REPLIES = ["I'm safe", "Need help", "Share location", "Call emergency", "I feel unsafe"];

const AICompanion = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const scrollRef = useRef(null);
  const inactivityRef = useRef(null);
  const { user } = useUserStore();
  const { triggerAlert, addHistory } = useAlertStore();
  const { location } = useLocationStore();

  // Load persisted chat on mount
  useEffect(() => {
    const stored = localStorage.getItem('sheild-chat');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
        setConversationHistory(parsed.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })));
      } catch {}
    } else {
      const greeting = {
        id: 1, role: 'ai',
        text: `Hi ${user?.name?.split(' ')[0] || 'there'}, I'm your SHEild AI. I'm here 24/7 to keep you safe. How are you feeling right now?`
      };
      setMessages([greeting]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Proactive check-in after 30 minutes of no messages
  useEffect(() => {
    clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      const checkIn = { id: Date.now(), role: 'ai', text: "Hey, just checking in — did you arrive safely? 💙 Tap 'I'm safe' if everything is okay." };
      setMessages(prev => [...prev, checkIn]);
    }, 30 * 60 * 1000);
    return () => clearTimeout(inactivityRef.current);
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg = { id: Date.now(), role: 'user', text };
    const newHistory = [...conversationHistory, { role: 'user', content: text }];
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 150,
          system: SYSTEM_PROMPT,
          messages: newHistory
        })
      });

      let aiText = "I'm here with you. Are you safe right now?";

      if (response.ok) {
        const data = await response.json();
        aiText = data.content?.[0]?.text || aiText;
      } else {
        // Fallback local responses
        const lower = text.toLowerCase();
        if (lower.includes('safe') || lower.includes('okay') || lower.includes('fine')) {
          aiText = "Great, I'm glad you're safe 💙 I'll keep monitoring. Stay aware of your surroundings.";
        } else if (lower.includes('help') || lower.includes('danger') || lower.includes('unsafe')) {
          aiText = "I hear you. I'm triggering an alert now and notifying your emergency contacts. Stay calm — help is on the way.";
        } else if (lower.includes('location')) {
          aiText = location ? `Your current location is being tracked at ${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}. I can share this with your contacts.` : "Enable location sharing so I can track you in real time.";
        } else {
          aiText = "I understand. I'm monitoring your situation. If anything feels wrong, just say 'help me' and I'll alert your contacts immediately.";
        }
      }

      // Check if AI wants to trigger an alert
      if (aiText.startsWith('ALERT_TRIGGER:')) {
        aiText = aiText.replace('ALERT_TRIGGER:', '').trim();
        triggerAlert(1, 'ai_behavior', location);
        addHistory({ type: 'danger', message: 'AI Companion triggered alert based on conversation', timestamp: new Date() });
      }

      const aiMsg = { id: Date.now() + 1, role: 'ai', text: aiText };
      const updatedHistory = [...newHistory, { role: 'assistant', content: aiText }];
      setMessages(prev => [...prev, aiMsg]);
      setConversationHistory(updatedHistory);

      // Persist last 20 messages
      const toStore = [...messages, userMsg, aiMsg].slice(-20);
      localStorage.setItem('sheild-chat', JSON.stringify(toStore));
    } catch {
      const fallback = { id: Date.now() + 1, role: 'ai', text: "I'm here. Are you safe? Reply anytime." };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.onresult = (e) => setInput(e.results[0][0].transcript);
    r.start();
  };

  return (
    <div className="max-w-[900px] h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-8 pb-6 border-b border-border-dim flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal rounded-full border-2 border-navy animate-pulse" />
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-ivory">AI Safety Companion</h1>
            <p className="text-ivory/50 mt-1">24/7 proactive safety monitoring and support.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col glass overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-red/20 text-red' : 'bg-teal/20 text-teal'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-red text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-ivory/90 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="text-teal animate-spin" />
                <span className="text-xs text-ivory/40">SHEild AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-white/5 flex gap-2 overflow-x-auto">
          {QUICK_REPLIES.map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-ivory/40 hover:text-teal hover:border-teal/30 transition-all"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
          <button
            type="button"
            onClick={startVoiceInput}
            className="p-3 bg-white/5 rounded-xl text-ivory/30 hover:text-teal transition-colors"
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message SHEild AI..."
            className="flex-1 bg-transparent border-none text-ivory placeholder:text-ivory/20 focus:ring-0 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-red rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red/90 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>

        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/20 rounded-full">
          <Shield size={12} className="text-teal" />
          <span className="text-[10px] font-bold text-teal uppercase tracking-widest">AI Monitoring Active</span>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
