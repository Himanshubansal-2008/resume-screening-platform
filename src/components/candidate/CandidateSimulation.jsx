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
  const [techQuestionCount, setTechQuestionCount] = useState(0);
  const [silenceStrikes, setSilenceStrikes] = useState(0);

  const videoRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const isMicBlocked = useRef(false);
  const cooldownTimeoutRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const contentToProcess = useRef("");

  // High-performance State Refs for Neural Gating
  const aiSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isMutedRef = useRef(false);

  // Persistence Refs for Unmount Cleaning (Ensures history shows even if "cut")
  const messagesRef = useRef(messages);
  const myProfileRef = useRef(myProfile);
  const activeInterviewAppRef = useRef(activeInterviewApp);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { myProfileRef.current = myProfile; }, [myProfile]);
  useEffect(() => { activeInterviewAppRef.current = activeInterviewApp; }, [activeInterviewApp]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    return () => {
      // Auto-save on unmount if still active and had conversation
      if (callStateRef.current === 'active' && messagesRef.current.length > 2) {
        const payload = {
          email: myProfileRef.current?.email,
          jobId: activeInterviewAppRef.current?.job?.id,
          transcript: messagesRef.current
        };
        if (payload.email && payload.jobId) {
          // Use sendBeacon for reliable delivery on unmount
          // Use Blob with JSON type for standard backend compatibility
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon('http://localhost:5001/api/interviews', blob);
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

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
    
    // Create ONE persistent instance
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
      
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if (contentToProcess.current.trim().length > 0 && 
            !aiSpeakingRef.current && !isProcessingRef.current && !isMutedRef.current) {
          submitSpeech(contentToProcess.current.trim());
        }
      }, 3000);
    };

    recognition.onend = () => {
      // Check if we SHOULD be running. If yes, restart immediately.
      const shouldRestart = callStateRef.current === 'active' && 
                           !isMicBlocked.current && 
                           !aiSpeakingRef.current && 
                           !isProcessingRef.current && 
                           !isMutedRef.current;
      
      if (shouldRestart) {
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch(e){} };
  }, []); // Mount only

useEffect(() => {
  const shouldBeActive = callState === 'active' && !aiSpeaking && !isProcessing && !isMuted && !isMicBlocked.current;

  if (shouldBeActive) {
    try { recognitionRef.current?.start(); } catch (e) { }
    clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setSilenceStrikes(prev => {
        const newStrikes = prev + 1;
        if (newStrikes >= 3) { setCallState('ended'); window.speechSynthesis.cancel(); setIsVideoOn(false); }
        else submitSpeech("(Candidate is silent. Ask if they are still there.)", true);
        return newStrikes;
      });
    }, 15000); // Increased strike time to avoid interruptions
  } else {
    try { recognitionRef.current?.stop(); } catch (e) { }
    clearTimeout(idleTimeoutRef.current);
  }
  return () => clearTimeout(idleTimeoutRef.current);
}, [callState, aiSpeaking, isProcessing, isMuted]);

const submitSpeech = async (text, isSystemSilence = false) => {
  if (callStateRef.current === 'ended' || !text || isProcessingRef.current) return;
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

    const aiResponse = data.text;
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, provider: data._provider }]);
    playAudio(aiResponse);

    // Automatic ending logic after 4 tech questions
    const finalCount = techQuestionCount + 1;
    setTechQuestionCount(finalCount);

    if (finalCount >= 4 || aiResponse.toLowerCase().includes("concludes our technical evaluation")) {
      setTimeout(() => {
        endCall();
      }, 15000); // Give user enough time to hear the final wrap-up
    }
  } catch (err) {
    console.error("AI Error", err);
    setIsProcessing(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "I'm having trouble connecting to my neural network. Please check your internet or try refreshing.",
      provider: 'error'
    }]);
  }
};

const playAudio = (text) => {
  if (callStateRef.current === 'ended') return;

  // STRICT GATING: Stop mic before speaking
  isMicBlocked.current = true;
  try { recognitionRef.current?.stop(); } catch (e) { }
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
    utterance.onend = () => {
      setAiSpeaking(false);
      setIsProcessing(false);

      // Cooldown ensures AI speaker audio doesn't loop back into mic
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = setTimeout(() => {
        isMicBlocked.current = false;
        if (callStateRef.current === 'active' && !isMutedRef.current) {
          try { recognitionRef.current?.start(); } catch (e) { }
        }
      }, 800);
    };
  synthesis.speak(utterance);
};



const joinCall = () => {
  setCallState('active'); callStateRef.current = 'active';
  const job = activeInterviewApp?.job;
  const systemPrompt = `You are a Senior Technical Interviewer conduct a live technical screening for the role of ${job?.title || 'Engineer'}. 
Role Context: ${job?.description || 'Focus on core engineering principles.'}
Candidate: ${myProfile?.name || 'Applicant'}

Your Goal: Evaluate technical depth. 
1. The interview has ALREADY started with the intro. Now, ask EXACTLY 4 highly specific technical questions one by one.
2. ALL QUESTIONS MUST be directly derived from the Role Context and Job Requirement provided above.
3. After the 4th technical question and candidate response, you MUST say "Thank you, that concludes our technical evaluation. I will now process your results." and stop.
4. DO NOT be generic. Avoid standard behavioral questions.
5. Dive deep into specific technologies mentioned in the Job description.
6. Keep responses strictly under 2 sentences for rapid voice interaction.
7. If the candidate deviates, asks about unrelated differences, or brings up topics not directly tied to the role, politely steer them back: "Let's focus on the technical aspects relevant to the position."
8. Never engage in casual chat, jokes, or off‑topic discussion.`;

  const initialHistory = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: "Hello! To get started, please tell me a bit about yourself and your background." }
  ];

  setMessages(initialHistory);
  playAudio("Hello! To get started, please tell me a bit about yourself and your background.");
  setTechQuestionCount(0); // Start the counter
};

const endCall = async () => {
  window.speechSynthesis.cancel();
  setCallState('ended');
  callStateRef.current = 'ended';
  setIsVideoOn(false);

  // Save session to history
  try {
    await fetch('http://localhost:5001/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: myProfile?.email,
        jobId: activeInterviewApp?.job?.id,
        transcript: messages
      })
    });
    console.log("[Simulation] Interview saved to history");
  } catch (err) {
    console.error("[Simulation] Failed to save interview:", err);
  }
};

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
              <span className="cs-sim-msg-label">
                {m.role === 'user' ? 'You' : `HireAI (${m.provider || 'Neural'})`}
              </span>
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
