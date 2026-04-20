import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Activity, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import './candidate.css';

const CandidateSimulation = ({ myProfile, activeInterviewApp, setActiveTab }) => {
  const [callState, setCallState] = useState('lobby');
  const callStateRef = useRef('lobby');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [silenceStrikes, setSilenceStrikes] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const contentToProcess = useRef("");
  const silenceTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  useEffect(() => {
    if (callState === 'ended') return;
    if (isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => { console.error("Camera access denied", err); setIsVideoOn(false); });
    } else {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    }
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, [isVideoOn, callState]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { console.warn("Speech Recognition API not supported."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      clearTimeout(idleTimeoutRef.current);
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) currentTranscript += event.results[i][0].transcript;
      setTranscript(currentTranscript);
      contentToProcess.current = currentTranscript;
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if (contentToProcess.current.trim().length > 0 && !aiSpeaking && !isProcessing && !isMuted)
          submitSpeech(contentToProcess.current.trim());
      }, 3000);
    };
    recognition.onend = () => {
      if (contentToProcess.current.trim().length > 0 && !aiSpeaking && !isProcessing && !isMuted)
        submitSpeech(contentToProcess.current.trim());
      else if (!aiSpeaking && callState === 'active' && !isMuted)
        try { recognition.start(); } catch(e){}
    };
    recognitionRef.current = recognition;
    return () => { recognition.stop(); };
  }, [aiSpeaking, isProcessing, callState, isMuted]);

  useEffect(() => {
    if (callState === 'active' && !aiSpeaking && !isProcessing && !isMuted) {
      try { recognitionRef.current?.start(); } catch(e){}
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setSilenceStrikes(prev => {
          const newStrikes = prev + 1;
          if (newStrikes >= 3) { setCallState('ended'); window.speechSynthesis.cancel(); setIsVideoOn(false); }
          else submitSpeech("(Candidate is silent. Ask if they are still there.)", true);
          return newStrikes;
        });
      }, 10000);
    } else { try { recognitionRef.current?.stop(); } catch(e){} clearTimeout(idleTimeoutRef.current); }
    return () => clearTimeout(idleTimeoutRef.current);
  }, [callState, aiSpeaking, isProcessing, isMuted]);

  const submitSpeech = async (text, isSystemSilence = false) => {
    if (callStateRef.current === 'ended' || !text || isProcessing) return;
    setIsProcessing(true); setTranscript(""); contentToProcess.current = "";
    clearTimeout(silenceTimeoutRef.current); clearTimeout(idleTimeoutRef.current);
    if (!isSystemSilence) setSilenceStrikes(0);
    const userMessage = { role: 'user', content: text, hidden: isSystemSilence };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    try {
      const res = await fetch('http://localhost:5001/api/interview/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });
      const data = await res.json();
      if (callStateRef.current === 'ended') return;
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      playAudio(data.text);
    } catch(err) { console.error("AI Error", err); setIsProcessing(false); }
  };

  const playAudio = (text) => {
    if (callStateRef.current === 'ended') return;
    setAiSpeaking(true);
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthesis.getVoices();
    const preferredVoices = ["Google UK English Male", "Daniel", "Alex", "Fred", "Samantha", "Google US English"];
    let selectedVoice = null;
    for (const name of preferredVoices) { selectedVoice = voices.find(v => v.name.includes(name)); if (selectedVoice) break; }
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.0; utterance.pitch = 0.95;
    utterance.onend = () => { setAiSpeaking(false); setIsProcessing(false); };
    synthesis.speak(utterance);
  };

  const joinCall = () => {
    setCallState('active'); callStateRef.current = 'active';
    const job = activeInterviewApp?.job;
    const systemPrompt = `You are a real-time voice technical interviewer for the role of ${job?.title || 'Engineer'}. Role Description: ${job?.description || 'N/A'}. Candidate Name: ${myProfile?.name || 'Candidate'}. Your goal is to conduct a short, 1-on-1 interview. Ask ONE short question at a time. Keep your responses under 3 sentences for snappy voice interactions. Greet the candidate natively and ask the first question directly.`;
    const initialHistory = [{ role: 'system', content: systemPrompt }];
    setMessages(initialHistory);
    setIsProcessing(true);
    fetch('http://localhost:5001/api/interview/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: initialHistory }) })
      .then(r => r.json())
      .then(data => { setMessages([...initialHistory, { role: 'assistant', content: data.text }]); playAudio(data.text); });
  };

  const endCall = () => { window.speechSynthesis.cancel(); setCallState('ended'); callStateRef.current = 'ended'; setIsVideoOn(false); };

  const Waveform = () => (
    <div className="cs-sim-waveform-bars">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          animate={aiSpeaking ? { height: ['12px', '48px', '12px'] } : { height: '8px' }}
          transition={aiSpeaking ? { repeat: Infinity, duration: 1, ease: 'easeInOut', delay: i * 0.1 } : {}}
          className={`cs-sim-waveform-bar ${aiSpeaking ? 'active' : ''}`}
        />
      ))}
    </div>
  );

  if (callState === 'lobby') {
    return (
      <div className="fadeIn cs-sim-centered">
        <div className="glass-card cs-sim-lobby-card">
          <div className="cs-sim-lobby-icon-box"><Bot size={44} color="#3b82f6" /></div>
          <h2 className="cs-sim-lobby-title">{activeInterviewApp?.job?.title} Interview</h2>
          <p className="cs-sim-lobby-text">Your camera and microphone will be used for this live AI evaluation. Ensure a quiet environment.</p>
          <button onClick={joinCall} className="btn-action-pro btn-primary cs-sim-btn-start">Start Interview</button>
        </div>
      </div>
    );
  }

  if (callState === 'ended') {
    return (
      <div className="fadeIn cs-sim-centered">
        <div className="glass-card cs-sim-ended-card">
          <div className="cs-sim-ended-icon-box"><Activity size={40} color="#10b981" /></div>
          <h2 className="cs-sim-ended-title">Interview Completed</h2>
          <button onClick={() => setActiveTab('jobboard')} className="btn-action-pro btn-primary cs-sim-btn-return">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fadeIn cs-sim-container">
      <div className="cs-sim-main-layout">
        {/* Transcript */}
        <div className="cs-sim-transcript-col">
          <h4 className="cs-sim-transcript-title">Interview Transcript</h4>
          <div className="cs-sim-messages-area">
            {messages.filter(m => m.role !== 'system' && !m.hidden).map((m, i) => (
              <div key={i} className={`cs-sim-msg-wrapper ${m.role === 'user' ? 'cs-sim-msg-user' : 'cs-sim-msg-ai'}`}>
                <span className="cs-sim-msg-label">{m.role === 'user' ? 'You' : 'HireAI'}</span>
                <div className={`cs-sim-msg-bubble ${m.role === 'user' ? 'cs-sim-msg-bubble-user' : 'cs-sim-msg-bubble-ai'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="cs-sim-processing-indicator">
                <Activity size={14} className="spin" /> <span>Synthesizing...</span>
              </div>
            )}
          </div>
          <div className="cs-sim-status-footer">
            {transcript ? (
              <span className="cs-sim-status-transcript">{transcript}</span>
            ) : aiSpeaking ? (
              <span className="cs-sim-status-speaking">Interviewer is speaking...</span>
            ) : isProcessing ? (
              <span className="cs-sim-status-waiting">Waiting for response...</span>
            ) : (
              <span className="cs-sim-status-listening"><Mic size={16} /> Listening... Speak now</span>
            )}
          </div>
        </div>

        {/* Video Panel */}
        <div className="cs-sim-video-col">
          <div className="cs-sim-bot-view">
            <div className="cs-sim-bot-tag"><Bot size={16} color="#06b6d4" /> HireAI</div>
            <div className={`cs-sim-waveform-container ${aiSpeaking ? 'active' : 'idle'}`}>
              <Waveform />
            </div>
            {silenceStrikes > 0 && (
              <div className="cs-sim-warning-badge">
                {3 - silenceStrikes} warning{3 - silenceStrikes > 1 ? 's' : ''} until disconnect...
              </div>
            )}
          </div>
          <div className="cs-sim-user-view">
            {isVideoOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="cs-sim-video" />
            ) : (
              <div className="cs-sim-video-off"><VideoOff size={48} /></div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="cs-sim-controls">
        <button onClick={() => setIsMuted(!isMuted)} className={`cs-sim-ctrl-btn ${isMuted ? 'muted' : ''}`}>
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button onClick={() => setIsVideoOn(!isVideoOn)} className={`cs-sim-ctrl-btn ${isVideoOn ? 'video-on' : ''}`}>
          {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button onClick={endCall} className="cs-sim-ctrl-btn end-call">
          <Phone size={24} className="cs-sim-end-icon" />
        </button>
      </div>
    </div>
  );
};

export default CandidateSimulation;
