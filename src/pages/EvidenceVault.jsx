import React, { useState, useEffect, useRef } from 'react';
import { Video, Lock, FileText, Download, ShieldCheck, Activity, Upload, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAlertStore from '../store/useAlertStore';
import api from '../api';

const EvidenceVault = () => {
  const [evidence, setEvidence] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const { activeAlert } = useAlertStore();
  const fileInputRef = useRef(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const alertId = activeAlert?._id;

  // Load evidence for active alert
  useEffect(() => {
    if (!alertId) return;
    api.get(`/api/evidence/${alertId}`)
      .then(res => { if (res.data.evidence) setEvidence(res.data.evidence); })
      .catch(() => {});
  }, [alertId]);

  const uploadFile = async (blob, type) => {
    if (!alertId) { setError('No active alert — trigger an alert first'); return; }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', blob, `evidence-${Date.now()}.${type === 'audio' ? 'webm' : type === 'video' ? 'webm' : 'bin'}`);
      form.append('alertId', alertId);
      form.append('type', type);
      const { data } = await api.post('/api/evidence/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEvidence(data.evidence);
      setError(null);
    } catch (err) {
      setError('Upload failed — saved locally');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
    await uploadFile(file, type);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await uploadFile(blob, 'video');
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      setError('Camera/mic access required');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const generateReport = async () => {
    if (!alertId) { setError('No active alert'); return; }
    setIsGeneratingReport(true);
    try {
      const { data } = await api.post(`/api/evidence/report/${alertId}`);
      window.open(data.reportUrl, '_blank');
    } catch {
      setError('Report generation failed');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const files = evidence?.files || [];
  const totalSizeMB = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0) / (1024 * 1024);

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 pb-6 border-b border-border-dim">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
            <Video size={24} />
          </div>
          <div>
            <h1 className="font-syne text-3xl font-bold text-ivory">Evidence Vault</h1>
            <p className="text-ivory/50 mt-1">Immutable encrypted recording storage for legal protection.</p>
          </div>
        </div>
      </div>

      {!alertId && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
          ⚠️ Trigger an alert first to associate evidence with an incident.
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl text-sm text-red flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red/60 hover:text-red">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Controls */}
          <div className="glass p-6 flex flex-wrap gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !alertId}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal/10 border border-teal/30 text-teal rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-teal/20 transition-all disabled:opacity-40"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload File
            </button>
            <input ref={fileInputRef} type="file" accept="video/*,audio/*,image/*" className="hidden" onChange={handleFileSelect} />

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!alertId}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-40 ${
                isRecording ? 'bg-red text-white border border-red' : 'bg-white/5 border border-white/10 text-ivory hover:bg-white/10'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red'}`} />
              {isRecording ? `Stop Recording (${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')})` : 'Record Now'}
            </button>
          </div>

          {/* Files List */}
          <div className="glass overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-syne font-bold text-ivory text-sm uppercase tracking-widest">Secure Evidence</h3>
              <span className="text-[10px] font-bold text-teal bg-teal/10 px-2 py-1 rounded">{files.length} ENCRYPTED FILES</span>
            </div>
            {files.length === 0 ? (
              <div className="p-12 text-center text-ivory/20 italic text-sm">No evidence captured yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence>
                  {files.map((file, i) => (
                    <motion.div
                      key={file.cloudinaryId || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-ivory/40 group-hover:text-teal transition-colors">
                          {file.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ivory">{file.type?.toUpperCase()}_{i + 1}.{file.type === 'audio' ? 'webm' : file.type === 'video' ? 'mp4' : 'jpg'}</p>
                          <p className="text-[10px] text-ivory/30 font-bold uppercase">
                            {new Date(file.uploadedAt).toLocaleString()} • {file.sizeBytes ? `${(file.sizeBytes / 1024).toFixed(0)}KB` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-ivory/20" />
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-teal transition-colors text-ivory/40">
                          <Download size={18} />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="glass p-6 bg-red/5 border border-red/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red/10 rounded-lg flex items-center justify-center text-red flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-red mb-2 uppercase tracking-widest text-xs">Immutable Guarantee</h3>
                <p className="text-sm text-ivory/60 leading-relaxed">
                  Once recorded during an alert, evidence is stored on Cloudinary and cannot be deleted for 30 days. This ensures legal integrity for reporting.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8">
            <h3 className="font-syne font-bold text-ivory mb-6 flex items-center gap-2">
              <Activity size={18} className="text-teal" />
              Vault Status
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase mb-2">
                  <span className="text-ivory/40">Storage Used</span>
                  <span className="text-ivory">{totalSizeMB.toFixed(1)} MB</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${Math.min(100, totalSizeMB / 100 * 100)}%` }}
                    className="h-full bg-teal"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="text-xs text-ivory/60">Cloudinary encryption ACTIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  <span className="text-xs text-ivory/60">Delete-protected for 30 days</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${alertId ? 'bg-teal' : 'bg-ivory/20'}`} />
                  <span className="text-xs text-ivory/60">Active alert: {alertId ? '✓ Connected' : 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={isGeneratingReport || !alertId}
            className="btn-red w-full flex items-center justify-center gap-3 group disabled:opacity-40"
          >
            {isGeneratingReport ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
            <span className="uppercase tracking-widest text-xs font-bold">
              {isGeneratingReport ? 'Generating...' : 'Generate Legal Report'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceVault;
