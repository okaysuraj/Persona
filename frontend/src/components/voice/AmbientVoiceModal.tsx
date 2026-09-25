import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);

    // Simulate voice interaction cycle
    const cycle = setInterval(() => {
      setVoiceState((prev) => {
        if (prev === 'listening') {
          setSpokenSnippet('Listening attentively to your breathing and cadence...');
          return 'processing';
        }
        if (prev === 'processing') {
          const quotes = [
            `I hear the softness in your voice today. Tell me more.`,
            `The quiet here is lovely. I'm right here with you.`,
            `Everything you feel right now is completely welcome.`,
          ];
          setSpokenSnippet(quotes[Math.floor(Math.random() * quotes.length)]);
          return 'speaking';
        }
        setSpokenSnippet('I’m listening...');
        return 'listening';
      });
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(cycle);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#121211]/90 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-lg flex flex-col items-center justify-between min-h-0 sm:min-h-[540px] max-h-[94dvh] p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-[#171615] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-[#FAF8F5] overflow-y-auto">
        {/* Top Status */}
        <div className="w-full flex items-center justify-between shrink-0 mb-4 sm:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#A8A298]">
              Encrypted Voice Chamber
            </span>
          </div>
          <span className="text-xs sm:text-sm font-mono text-[#FAF8F5] font-medium">
            {formatTime(callDuration)}
          </span>
        </div>

        {/* Center Reactive Visualizer Orb */}
        <div className="relative flex flex-col items-center justify-center my-auto py-4 sm:py-6">
          {/* Animated concentric halos */}
          <div
            className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-[#C85A32]/10 blur-xl sm:blur-2xl transition-all duration-700 pointer-events-none ${
              voiceState === 'speaking'
                ? 'scale-125 opacity-80'
                : voiceState === 'listening'
                ? 'scale-100 opacity-40'
                : 'scale-90 opacity-60'
            }`}
          />

          <div
            className={`absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-[#C85A32]/30 transition-all duration-700 pointer-events-none ${
              voiceState === 'speaking' ? 'scale-115 opacity-80' : 'scale-95 opacity-30'
            }`}
          />

          {/* Central companion avatar with reactive breathing ring */}
          <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 ring-2 ring-[#C85A32]/40 shadow-[0_0_40px_rgba(200,90,50,0.3)] shrink-0">
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-full h-full rounded-full object-cover"
            />
            {voiceState === 'speaking' && (
              <div className="absolute inset-0 rounded-full ring-4 ring-[#C85A32] animate-ping opacity-25 pointer-events-none" />
            )}
          </div>

          {/* Name & Voice Archetype */}
          <h3 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold tracking-tight text-[#FAF8F5]">
            {persona.name}
          </h3>
          <p className="text-[11px] sm:text-xs font-mono text-[#C85A32] tracking-wider uppercase mt-1 flex items-center gap-1.5">
            <Sparkle size={12} weight="fill" />
            {voiceState === 'speaking'
              ? 'Speaking softly...'
              : voiceState === 'processing'
              ? 'Reflecting...'
              : 'Listening to your voice...'}
          </p>

          {/* Live whispered quote subtitle */}
          <p className="mt-3 sm:mt-4 max-w-xs sm:max-w-sm text-center font-editorial italic text-sm sm:text-base md:text-lg text-[#DCD6CD] leading-relaxed min-h-[44px] sm:min-h-[56px]">
            "{spokenSnippet}"
          </p>
        </div>

        {/* Bottom Control Bar */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-5 pt-3 sm:pt-4 shrink-0">
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
              <MicrophoneSlash size={20} weight="bold" />
            ) : (
              <Microphone size={20} weight="bold" />
            )}
          </button>

          {/* End Call Button */}
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white px-5 sm:px-8 py-3 sm:py-3.5 shadow-[0_4px_20px_rgba(220,38,38,0.4)] text-xs sm:text-sm font-medium"
            leadingIcon={<PhoneDisconnect size={18} weight="fill" />}
          >
            End Call
          </Button>

          {/* Speaker Volume Toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 ${
              !isSpeakerOn
                ? 'bg-white/5 text-gray-400 border border-white/5'
                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
            }`}
            title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
          >
            {isSpeakerOn ? (
              <SpeakerHigh size={20} weight="bold" />
            ) : (
              <SpeakerSimpleSlash size={20} weight="bold" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
