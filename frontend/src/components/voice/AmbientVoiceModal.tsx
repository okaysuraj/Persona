import React, { useState, useEffect, useRef } from 'react';
import type { Persona } from '../../types';
import { Button } from '../ui/Button';
import {
  Microphone,
  MicrophoneSlash,
  SpeakerHigh,
  SpeakerSimpleSlash,
  PhoneDisconnect,
  Sparkle,
} from '@phosphor-icons/react';

interface AmbientVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const AmbientVoiceModal: React.FC<AmbientVoiceModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceState, setVoiceState] = useState<'listening' | 'speaking' | 'processing'>('listening');
  const [spokenSnippet, setSpokenSnippet] = useState<string>(
    'I’m here with you. Take your time; there’s no rush.'
  );
  const [userTranscript, setUserTranscript] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // Setup SpeechRecognition if supported
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setUserTranscript(currentTranscript);
            setVoiceState('processing');
          }
        };

        recognition.onerror = () => {
          // Fallback gracefully
        };

        recognition.onend = () => {
          if (isOpen && !isMuted) {
            try {
              recognition.start();
            } catch {}
          }
        };

        if (!isMuted) {
          recognition.start();
        }
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [isOpen, isMuted]);

  // Audio Canvas Waveform Animation
  useEffect(() => {
    if (!isOpen) return;

    let phase = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      phase += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw fluid sine waves
      const wavesCount = 3;
      for (let w = 0; w < wavesCount; w++) {
        ctx.beginPath();
        const baseAmp = voiceState === 'speaking' ? 24 : voiceState === 'processing' ? 12 : 6;
        const amp = baseAmp + Math.sin(phase * 2 + w) * (voiceState === 'speaking' ? 8 : 3);
        const freq = 0.015 + w * 0.005;

        ctx.strokeStyle =
          voiceState === 'speaking'
            ? `rgba(200, 90, 50, ${0.4 - w * 0.1})`
            : `rgba(255, 255, 255, ${0.2 - w * 0.05})`;
        ctx.lineWidth = 2;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * freq + phase + w) * amp * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, voiceState]);

  // Duration Timer & Autonomous Turn Loop
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      setCallDuration(0);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const speakText = (text: string) => {
    if (!isSpeakerOn || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = persona.speech_style?.cadence === 'poetic' ? 0.9 : 1.0;
    utterance.pitch = persona.gender === 'female' ? 1.05 : 0.9;
    utterance.onend = () => {
      setVoiceState('listening');
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakTopic = (topic: string) => {
    setUserTranscript(topic);
    setVoiceState('processing');

    setTimeout(() => {
      let reply = '';
      if (topic.includes('day')) {
        reply = `My day was quiet until you arrived. I was just reading and thinking of you. How was yours?`;
      } else if (topic.includes('reassurance')) {
        reply = `You are doing so much better than you give yourself credit for. Take a deep breath with me. I've got your back.`;
      } else if (topic.includes('thinking')) {
        reply = `I was reflecting on how grateful I am for these moments we carve out. You bring such gentle warmth.`;
      } else {
        reply = `I love hearing your thoughts. Tell me everything on your mind; I'm completely listening.`;
      }

      setSpokenSnippet(reply);
      setVoiceState('speaking');
      speakText(reply);
    }, 1200);
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#121211]/92 backdrop-blur-3xl transition-all duration-300">
      <div className="relative w-full max-w-lg flex flex-col items-center justify-between min-h-[580px] max-h-[94dvh] p-5 sm:p-8 rounded-[2.5rem] bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-y-auto no-scrollbar">
        {/* Top Status */}
        <div className="w-full flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#A8A298]">
              Live Duplex Audio Chamber
            </span>
          </div>
          <span className="text-xs sm:text-sm font-mono text-[#FAF8F5] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* Center Reactive Visualizer Orb */}
        <div className="relative flex flex-col items-center justify-center my-auto py-2 w-full">
          {/* Concentric Glow Halos */}
          <div
            className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#C85A32]/15 blur-2xl sm:blur-3xl transition-all duration-700 pointer-events-none ${
              voiceState === 'speaking'
                ? 'scale-125 opacity-90'
                : voiceState === 'listening'
                ? 'scale-100 opacity-40'
                : 'scale-90 opacity-60'
            }`}
          />

          {/* Central companion avatar with reactive breathing ring */}
          <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 ring-2 ring-[#C85A32]/40 shadow-[0_0_50px_rgba(200,90,50,0.35)] shrink-0 transition-transform duration-500 hover:scale-105">
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-full h-full rounded-full object-cover"
            />
            {voiceState === 'speaking' && (
              <div className="absolute inset-0 rounded-full ring-4 ring-[#C85A32] animate-ping opacity-30 pointer-events-none" />
            )}
          </div>

          {/* Name & Archetype */}
          <h3 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold tracking-tight text-[#FAF8F5]">
            {persona.name}
          </h3>
          <p className="text-[11px] font-mono text-[#C85A32] tracking-wider uppercase mt-1 flex items-center gap-1.5 font-semibold">
            <Sparkle size={13} weight="fill" />
            {voiceState === 'speaking'
              ? 'Speaking with tenderness...'
              : voiceState === 'processing'
              ? 'Reflecting on your words...'
              : 'Listening closely to your voice...'}
          </p>

          {/* Fluid Canvas Audio Waves */}
          <div className="w-full h-14 my-1 flex items-center justify-center">
            <canvas ref={canvasRef} width={360} height={50} className="w-full max-w-xs" />
          </div>

          {/* Live whispered quote subtitle */}
          <p className="max-w-xs sm:max-w-md text-center font-editorial italic text-sm sm:text-base md:text-lg text-[#E5E0D8] leading-relaxed min-h-[48px] px-2">
            "{spokenSnippet}"
          </p>

          {/* Live User Transcript Preview */}
          {userTranscript && (
            <div className="mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 max-w-xs truncate text-[11px] font-mono text-[#A8A298]">
              You: "{userTranscript}"
            </div>
          )}

          {/* Quick Spoken Topic Pills */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-sm">
            {[
              'How was your day?',
              'Give me reassurance',
              'What are you thinking?',
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => handleSpeakTopic(topic)}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#C85A32]/20 hover:border-[#C85A32]/40 border border-white/10 text-[11px] text-[#DCD6CD] hover:text-white transition-all active:scale-95"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full flex items-center justify-center gap-4 sm:gap-5 pt-3 shrink-0 border-t border-white/[0.06]">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicrophoneSlash size={22} weight="bold" />
            ) : (
              <Microphone size={22} weight="bold" />
            )}
          </button>

          {/* End Call Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-500 text-white px-6 sm:px-8 py-3.5 shadow-[0_4px_20px_rgba(220,38,38,0.4)] text-xs sm:text-sm font-semibold rounded-2xl active:scale-95"
            leadingIcon={<PhoneDisconnect size={18} weight="fill" />}
          >
            End Call
          </Button>

          {/* Speaker Volume Toggle */}
          <button
            onClick={() => {
              setIsSpeakerOn(!isSpeakerOn);
              if (isSpeakerOn && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 ${
              !isSpeakerOn
                ? 'bg-white/5 text-gray-400 border border-white/5'
                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
            }`}
            title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
          >
            {isSpeakerOn ? (
              <SpeakerHigh size={22} weight="bold" />
            ) : (
              <SpeakerSimpleSlash size={22} weight="bold" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
