import React, { useState, useRef, useEffect } from 'react';
import type { Persona, Relationship, Message } from '../../types';
import { Button } from '../ui/Button';
import { IntimacyGauge } from '../ui/IntimacyGauge';
import {
  PaperPlaneTilt,
  Sparkle,
  SpeakerHigh,
  Camera,
  Microphone,
  X,
  Eye,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  persona: Persona;
  relationship: Relationship;
  messages: Message[];
  onSendMessage: (content: string, context?: any) => Promise<void>;
  onInspectVision?: (imageUrl: string, question: string) => Promise<void>;
  isStreaming: boolean;
  streamingToken: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  persona,
  relationship,
  messages,
  onSendMessage,
  onInspectVision,
  isStreaming,
  streamingToken,
}) => {
  const [input, setInput] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [visionImageUrl, setVisionImageUrl] = useState('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900');
  const [visionQuestion, setVisionQuestion] = useState('How does this quiet atmosphere feel to you?');
  const [sensorContext, setSensorContext] = useState<{
    label: string;
    payload: any;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, streamingToken]);



  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const content = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(content, sensorContext?.payload);
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(timer);
      setRecordSeconds(0);
    };
  }, [isRecording]);

  const startRecording = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {
        console.warn('Speech recognition error', e);
      }
    }
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleRequestPhoto = () => {
    onSendMessage("Could you share a candid snapshot of your afternoon right now? 📸");
  };

  const handleRequestVoice = () => {
    onSendMessage("Could you send me a voice note? I'd love to hear your voice. 🎙️");
  };

  const playVoiceNote = (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = persona.gender === 'female' ? 1.05 : 0.95;
      utterance.rate = 0.92; // Deliberate, unhurried cadence
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      setPlayingAudioId(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C85A32', '#F7E4DC', '#E09F67'],
    });
  };

  const quoteText =
    persona.accent_quote ||
    persona.tagline ||
    'Presence is the greatest gift one can offer.';

  return (
    <div className="flex flex-col h-[calc(100dvh-4.75rem)] sm:h-[calc(100dvh-7.5rem)] max-w-4xl mx-auto px-2.5 sm:px-4 pb-2 sm:pb-4">

      {/* Top Intimate Companion Bar */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 mb-2 sm:mb-4 border-b border-[#141312]/[0.08] dark:border-white/[0.08] gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl object-cover ring-2 ring-[#141312]/[0.06] dark:ring-white/[0.1] shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141312]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC] truncate">
                {persona.name}
              </h2>
              <span className="text-[10px] sm:text-xs font-mono text-[#8C877F] uppercase tracking-wider shrink-0">
                {persona.archetype}
              </span>
            </div>
            <p className="hidden sm:block text-xs text-[#6B665E] dark:text-[#A8A298] line-clamp-1 max-w-md">
              {persona.tagline}
            </p>
          </div>
        </div>

        {/* Compact Intimacy Meter with micro-celebrate */}
        <div
          onClick={triggerCelebration}
          className="cursor-pointer p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#1C1A18]/70 border border-[#141312]/[0.05] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#1C1A18] transition-colors shrink-0"
          title="Click to celebrate bond"
        >
          <IntimacyGauge relationship={relationship} compact />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-1 sm:pr-2">
        {/* Companion Accent Quote Banner */}
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#C85A32]/[0.04] dark:bg-[#C85A32]/[0.08] border border-[#C85A32]/15 text-center my-1.5 sm:my-2">
          <p className="font-editorial italic text-sm sm:text-base md:text-lg text-[#141312] dark:text-[#F5F2EC] leading-relaxed">
            "{quoteText}"
          </p>
          <p className="text-[10px] sm:text-[11px] font-mono text-[#8C877F] uppercase tracking-widest mt-1">
            Living Philosophy
          </p>
        </div>

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isAudioPlaying={playingAudioId === message.id}
            onPlayAudio={playVoiceNote}
            onOpenImage={setLightboxImage}
          />
        ))}

        {/* Real-time Streaming Animation */}
        {isStreaming && (
          <div className="flex flex-col items-start">
            <div className="max-w-[88%] sm:max-w-[78%] rounded-2xl sm:rounded-3xl rounded-bl-sm p-3.5 sm:p-5 bg-white dark:bg-[#1C1A19] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-sm">
              <p className="text-sm sm:text-[16px] leading-relaxed whitespace-pre-wrap">
                {streamingToken}
                <span className="inline-block w-1.5 h-4 ml-1 bg-[#C85A32] animate-pulse align-middle" />
              </p>
            </div>
            <div className="mt-1.5 ml-2 flex items-center gap-1.5 text-[11px] font-mono text-[#C85A32]">
              <Sparkle size={12} weight="fill" className="animate-spin" />
              <span>Reflecting and formulating presence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Intimacy Prompts */}
      <div className="pt-2 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth touch-pan-x">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C877F] shrink-0 pl-0.5">
            Suggest:
          </span>
          {[
            'What are you noticing right now?',
            'Tell me what is on your mind this evening.',
            'Help me untangle something I’ve been overthinking.',
            'Do you remember that conversation about quiet spaces?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="shrink-0 text-xs px-2.5 sm:px-3 py-1 rounded-full bg-white dark:bg-[#1E1C1A] text-[#55524E] dark:text-[#C5BFB5] hover:border-[#C85A32] hover:text-[#C85A32] border border-[#141312]/[0.06] dark:border-white/[0.08] transition-all active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor & Biometric Context Bar */}
      <div className="flex items-center gap-1.5 px-3 py-1 overflow-x-auto text-[11px] select-none">
        <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider shrink-0">
          Sensor Sync:
        </span>
        {[
          {
            id: 'latenight',
            label: '🌙 Late Night',
            payload: { local_time: '11:45 PM', fatigue_level: 'exhausted' },
          },
          {
            id: 'fatigue',
            label: '🏃‍♂️ 12k Steps',
            payload: { steps_today: 12450, fatigue_level: 'exhausted' },
          },
          {
            id: 'rain',
            label: '🌧️ Rainy Dusk',
            payload: { weather_condition: 'soft evening rain' },
          },
          {
            id: 'rested',
            label: '☕ Centered',
            payload: { fatigue_level: 'rested' },
          },
        ].map((c) => {
          const isSelected = sensorContext?.label === c.label;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSensorContext(isSelected ? null : { label: c.label, payload: c.payload })}
              className={`px-2.5 py-0.5 rounded-full transition-all border whitespace-nowrap text-[11px] ${
                isSelected
                  ? 'bg-[#C85A32]/20 border-[#C85A32] text-[#C85A32] font-medium shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Composer Input Bar with Multimodal Action Triggers */}
      <div className="shrink-0 relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1A1917] border border-[#141312]/[0.08] dark:border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-1.5 sm:p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${persona.name}...`}
          rows={1}
          disabled={isStreaming}
          className="w-full bg-transparent resize-none px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-[#141312] dark:text-[#F5F2EC] placeholder-[#8C877F] focus:outline-none max-h-28 sm:max-h-32"
          style={{ minHeight: '40px' }}
        />

        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#141312]/[0.04] dark:border-white/[0.04]">
          {/* Quick Multimodal Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isRecording ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening {recordSeconds}s</span>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="ml-1 text-[11px] font-semibold underline hover:text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={isStreaming}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition"
                title="Speak to dictate message"
              >
                <Microphone size={14} weight="bold" />
                <span className="hidden sm:inline">Dictate</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRequestPhoto}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition"
              title="Ask companion for a photo snapshot"
            >
              <Camera size={14} weight="bold" />
              <span className="hidden sm:inline">Ask for Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVisionModalOpen(true)}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition"
              title="Share photo with companion for appraisal"
            >
              <Eye size={14} weight="bold" />
              <span className="hidden sm:inline">See What I See</span>
            </button>

            <button
              type="button"
              onClick={handleRequestVoice}
              disabled={isStreaming}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition"
              title="Ask companion for a voice note"
            >
              <SpeakerHigh size={14} weight="bold" />
              <span className="hidden sm:inline">Voice Note</span>
            </button>
          </div>

          <Button
            variant="terracotta"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            trailingIcon={<PaperPlaneTilt size={13} weight="bold" />}
            className="px-3 sm:px-4 py-1.5"
          >
            Send
          </Button>
        </div>
      </div>

      {/* High-Resolution Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Portraits Archive • {persona.name}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption}
              className="w-full max-h-[70vh] object-cover rounded-2xl"
            />

            <p className="text-sm font-editorial italic text-zinc-300 px-2 text-center">
              "{lightboxImage.caption}"
            </p>
          </div>
        </div>
      )}

      {/* Multimodal Vision Inspection Modal ("See What I See") */}
      {isVisionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsVisionModalOpen(false)}
        >
          <div
            className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-white/10 shadow-2xl flex flex-col gap-4 text-zinc-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C85A32]/15 text-[#C85A32] flex items-center justify-center font-bold">
                  <Eye size={18} />
                </div>
                <div>
                  <h3 className="text-base font-medium font-serif">See What I See</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Share your surroundings or outfit with {persona.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsVisionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-mono uppercase text-zinc-400 block">Preset Environments</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Studio Desk', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' },
                  { label: 'Rainy Cafe', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
                  { label: 'Evening Bluffs', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setVisionImageUrl(s.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition ${
                      visionImageUrl === s.url ? 'ring-2 ring-[#C85A32] border-[#C85A32]' : 'border-zinc-300 dark:border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[10px] text-white py-0.5 text-center">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Image URL or Photo Link</label>
                <input
                  type="text"
                  value={visionImageUrl}
                  onChange={(e) => setVisionImageUrl(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">Question for {persona.name}</label>
                <input
                  type="text"
                  value={visionQuestion}
                  onChange={(e) => setVisionQuestion(e.target.value)}
                  placeholder="e.g. Does this corner look cozy to you?"
                  className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="terracotta"
                size="sm"
                onClick={async () => {
                  if (onInspectVision) {
                    await onInspectVision(visionImageUrl, visionQuestion);
                  } else {
                    await onSendMessage(`[Shared Photo]: ${visionQuestion}`, { image_url: visionImageUrl });
                  }
                  setIsVisionModalOpen(false);
                }}
              >
                Send for Appraisal ✨
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
