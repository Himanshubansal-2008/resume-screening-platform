import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, Settings, Activity, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateSimulation = ({ setActiveTab }) => {
  const [callState, setCallState] = useState('lobby'); // lobby, connecting, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle camera toggles
  useEffect(() => {
    if (isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera access denied or unavailable", err);
          setIsVideoOn(false);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn]);

  const joinCall = () => {
    setCallState('connecting');
    setTimeout(() => {
        setCallState('active');
        
        // Mock AI talking sequence
        setTimeout(() => setAiSpeaking(true), 1500);
        setTimeout(() => setAiSpeaking(false), 5000); // AI stops speaking
    }, 2000);
  };

  const endCall = () => {
    setCallState('ended');
    setIsVideoOn(false); // turn off camera
  };

  // The AI Waveform visualizer component
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
             <div style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', maxWidth: '500px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '24px', borderRadius: '50%', display: 'inline-flex', marginBottom: '2rem' }}>
                    <Bot size={48} color="#3b82f6" />
                </div>
                <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Voice AI Simulation</h2>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '3rem' }}>
                    You are about to start a voice-to-voice mock interview with HireAI. Please ensure you are in a quiet environment.
                </p>
                <button 
                  onClick={joinCall}
                  style={{ width: '100%', padding: '1.25rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' }}
                >
                    Start Simulation
                </button>
             </div>
          </div>
      );
  }

  if (callState === 'ended') {
    return (
        <div className="fadeIn" style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ textAlign: 'center' }}>
               <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Interview Completed</h2>
               <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Your responses are being analyzed.</p>
               <button onClick={() => setActiveTab('dashboard')} className="btn-action-pro">Return to Dashboard</button>
           </div>
        </div>
    );
  }

  return (
    <div className="fadeIn" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
        {/* Main Video Arena */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '1rem' }}>
            
            {/* AI Agent Main Window */}
            <div style={{ flex: 1, background: '#0a0f1d', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {callState === 'connecting' ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                         <Activity size={32} className="spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: '#3b82f6' }} />
                         <p>Connecting to AI Agent...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                            <Bot size={16} color="#06b6d4" /> HireAI Interviewer
                        </div>
                        
                        {/* Audio Visualizer Core */}
                        <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: aiSpeaking ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.02)', border: aiSpeaking ? '2px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: aiSpeaking ? '0 0 40px rgba(6, 182, 212, 0.2)' : 'none', transition: 'all 0.5s' }}>
                            <Waveform />
                        </div>
                    </>
                )}
            </div>

            {/* Candidate PiP Container */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%', aspectRatio: '4/3', background: '#030014', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
                    {isVideoOn ? (
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>
                            <VideoOff size={48} />
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px', color: 'white', fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}>
                        You (Candidate)
                    </div>
                </div>

                {/* Status / Log box */}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                     <h4 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '1rem' }}>Real-time Transcript</h4>
                     <div style={{ flex: 1, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        {aiSpeaking ? (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>"Hello, thank you for joining. Let's begin the technical assessment..."</motion.span>
                        ) : (
                            <span style={{ opacity: 0.5 }}>Waiting for speech...</span>
                        )}
                     </div>
                </div>
            </div>
        </div>

        {/* Bottom Control Bar */}
        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
             <button 
                onClick={() => setIsMuted(!isMuted)}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: isMuted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: isMuted ? '#ef4444' : 'white', border: isMuted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
             >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>

             <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: !isVideoOn ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)', color: !isVideoOn ? 'white' : '#3b82f6', border: !isVideoOn ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59, 130, 246, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
             >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
             </button>

             <button 
                onClick={endCall}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)' }}
             >
                <Phone size={24} style={{ transform: 'rotate(135deg)' }} />
             </button>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
    </div>
  );
};

export default CandidateSimulation;
