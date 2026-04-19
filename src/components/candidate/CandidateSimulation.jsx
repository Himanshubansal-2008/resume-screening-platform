import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Activity, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Pre-load voices on mount so they are available right away
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // 1. Camera Initialization
  useEffect(() => {
    if (callState === 'ended') return;
    if (isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Camera access denied", err);
          setIsVideoOn(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, [isVideoOn, callState]);

  // 2. Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      clearTimeout(idleTimeoutRef.current);
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      contentToProcess.current = currentTranscript;
      
      // Auto-submit after 3 seconds of silence
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
         if (contentToProcess.current.trim().length > 0 && !aiSpeaking && !isProcessing && !isMuted) {
            submitSpeech(contentToProcess.current.trim());
         }
      }, 3000);
    };

    recognition.onend = () => {
      // If AI is not speaking and we are not processing, and there's text, it means candidate paused
      if (contentToProcess.current.trim().length > 0 && !aiSpeaking && !isProcessing && !isMuted) {
         submitSpeech(contentToProcess.current.trim());
      } else if (!aiSpeaking && callState === 'active' && !isMuted) {
         // Auto restart if it died
         try { recognition.start(); } catch(e){}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [aiSpeaking, isProcessing, callState, isMuted]);

  // Handle active listen toggling
  useEffect(() => {
    if (callState === 'active' && !aiSpeaking && !isProcessing && !isMuted) {
        try { recognitionRef.current?.start(); } catch(e){}
        
        // Start 10s idle clock
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
            setSilenceStrikes(prev => {
                const newStrikes = prev + 1;
                if (newStrikes >= 3) {
                    setCallState('ended');
                    window.speechSynthesis.cancel();
                    setIsVideoOn(false);
                } else {
                    submitSpeech("(Candidate is silent. Ask if they are still there.)", true);
                }
                return newStrikes;
            });
        }, 10000);
    } else {
        try { recognitionRef.current?.stop(); } catch(e){}
        clearTimeout(idleTimeoutRef.current);
    }
    return () => clearTimeout(idleTimeoutRef.current);
  }, [callState, aiSpeaking, isProcessing, isMuted]);

  const submitSpeech = async (text, isSystemSilence = false) => {
    if (callStateRef.current === 'ended') return;
    if (!text || isProcessing) return;
    setIsProcessing(true);
    setTranscript("");
    contentToProcess.current = "";
    clearTimeout(silenceTimeoutRef.current);
    clearTimeout(idleTimeoutRef.current);

    if (!isSystemSilence) {
        setSilenceStrikes(0);
    }

    const userMessage = { role: 'user', content: text, hidden: isSystemSilence };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);

    try {
        const res = await fetch('http://localhost:5001/api/interview/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newHistory })
        });
        const data = await res.json();
        if (callStateRef.current === 'ended') return;
        const aiMessage = { role: 'assistant', content: data.text };
        setMessages(prev => [...prev, aiMessage]);
        
        playAudio(data.text);
    } catch(err) {
        console.error("AI Error", err);
        setIsProcessing(false);
    }
  };

  const playAudio = (text) => {
    if (callStateRef.current === 'ended') return;
    setAiSpeaking(true);
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select an alternate/higher quality voice
    const voices = synthesis.getVoices();
    const preferredVoices = [
        "Google UK English Male", 
        "Daniel", 
        "Alex", 
        "Fred", 
        "Samantha",
        "Google US English"
    ];
    let selectedVoice = null;
    for (const name of preferredVoices) {
        selectedVoice = voices.find(v => v.name.includes(name));
        if (selectedVoice) break;
    }
    
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    
    utterance.onend = () => {
        setAiSpeaking(false);
        setIsProcessing(false);
    };

    synthesis.speak(utterance);
  };

  const joinCall = () => {
    setCallState('active');
    callStateRef.current = 'active';
    
    // Initialize system prompt based on specific job application!
    const job = activeInterviewApp?.job;
    const systemPrompt = `You are a real-time voice technical interviewer for the role of ${job?.title || 'Engineer'}. 
Role Description: ${job?.description || 'N/A'}. 
Candidate Name: ${myProfile?.name || 'Candidate'}. 
Your goal is to conduct a short, 1-on-1 interview. Ask ONE short question at a time. Keep your responses under 3 sentences for snappy voice interactions. Greet the candidate natively and ask the first question directly.`;

    const initialHistory = [{ role: 'system', content: systemPrompt }];
    setMessages(initialHistory);
    
    // Trigger first greeting
    setIsProcessing(true);
    fetch('http://localhost:5001/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initialHistory })
    })
    .then(r => r.json())
    .then(data => {
        setMessages([...initialHistory, { role: 'assistant', content: data.text }]);
        playAudio(data.text);
    });
  };

  const endCall = () => {
    window.speechSynthesis.cancel();
    setCallState('ended');
    callStateRef.current = 'ended';
    setIsVideoOn(false);
  };

  const Waveform = () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '64px' }}>
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          animate={aiSpeaking ? { height: ['12px', '48px', '12px'] } : { height: '8px' }}
          transition={aiSpeaking ? { repeat: Infinity, duration: 1, ease: 'easeInOut', delay: i * 0.1 } : {}}
          style={{ width: '8px', background: aiSpeaking ? '#06b6d4' : 'rgba(255,255,255,0.2)', borderRadius: '4px' }}
        />
      ))}
    </div>
  );

  if (callState === 'lobby') {
      return (
          <div className="fadeIn" style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="card" style={{ padding: '3.5rem', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '50%', display: 'inline-flex', marginBottom: '2rem' }}>
                    <Bot size={44} color="#3b82f6" />
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>{activeInterviewApp?.job?.title} Interview</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2.5rem', fontSize: '0.93rem' }}>
                    Your camera and microphone will be used for this live AI evaluation. Ensure a quiet environment.
                </p>
                <button onClick={joinCall} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1rem' }}>
                    Start Interview
                </button>
             </div>
          </div>
      );
  }

  if (callState === 'ended') {
    return (
        <div className="fadeIn" style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="card" style={{ textAlign: 'center', padding: '3.5rem', maxWidth: '450px', width: '100%' }}>
               <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '50%', display: 'inline-flex', marginBottom: '1.5rem' }}>
                   <Activity size={40} color="#10b981" />
               </div>
               <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', fontFamily: 'Outfit, sans-serif' }}>Interview Completed</h2>
               <button onClick={() => setActiveTab('jobboard')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}>Return Home</button>
           </div>
        </div>
    );
  }

  return (
    <div className="fadeIn" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '1rem', minHeight: 0 }}>
            {/* LEFT SIDE: Transcript */}
            <div style={{ flex: 1, background: 'white', borderRadius: '24px', border: '1px solid #e5e7eb', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                 <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>Interview Transcript</h4>
                 <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '10px' }}>
                    {messages.filter(m => m.role !== 'system' && !m.hidden).map((m, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                           <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                               {m.role === 'user' ? 'You' : 'HireAI'}
                           </span>
                           <div style={{ background: m.role === 'user' ? '#3b82f6' : '#f1f5f9', color: m.role === 'user' ? 'white' : '#334155', padding: '12px 18px', borderRadius: '16px', borderBottomRightRadius: m.role === 'user' ? '4px' : '16px', borderBottomLeftRadius: m.role !== 'user' ? '4px' : '16px', fontSize: '0.92rem', lineHeight: '1.5', maxWidth: '85%' }}>
                               {m.content}
                           </div>
                        </div>
                    ))}
                    {isProcessing && (
                         <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', color: '#94a3b8', padding: '12px 20px', borderRadius: '16px', borderBottomLeftRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <Activity size={14} className="spin" /> <span>Synthesizing...</span>
                         </div>
                    )}
                 </div>
                 
                 <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '52px', display: 'flex', alignItems: 'center' }}>
                    {transcript ? (
                        <span style={{ color: '#2563eb', fontSize: '0.9rem', lineHeight: '1.4' }}>{transcript}</span>
                    ) : aiSpeaking ? (
                        <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '800' }}>Interviewer is speaking...</span>
                    ) : isProcessing ? (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Waiting for response...</span>
                    ) : (
                        <span style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}><Mic size={16} /> Listening... Speak now</span>
                    )}
                 </div>
            </div>

            {/* RIGHT SIDE */}
            <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ flex: 1, background: '#0a0f1d', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                        <Bot size={16} color="#06b6d4" /> HireAI
                    </div>
                    
                    <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: aiSpeaking ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.02)', border: aiSpeaking ? '2px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: aiSpeaking ? '0 0 50px rgba(6, 182, 212, 0.25)' : 'none', transition: 'all 0.5s' }}>
                        <Waveform />
                    </div>
                    
                    {silenceStrikes > 0 && (
                        <div style={{ marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            {3 - silenceStrikes} warning{3 - silenceStrikes > 1 ? 's' : ''} until disconnect...
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', aspectRatio: '4/3', background: '#030014', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
                    {isVideoOn ? (
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}><VideoOff size={48} /></div>
                    )}
                </div>
            </div>
        </div>

        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
             <button onClick={() => setIsMuted(!isMuted)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: isMuted ? '#ef4444' : 'white', border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             <button onClick={() => setIsVideoOn(!isVideoOn)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: !isVideoOn ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)', color: !isVideoOn ? 'white' : '#3b82f6', border: !isVideoOn ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
             </button>
             <button onClick={endCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={24} style={{ transform: 'rotate(135deg)' }} />
             </button>
        </div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
    </div>
  );
};
export default CandidateSimulation;
