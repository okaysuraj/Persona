import { useState } from 'react';
import type { Message } from '../../types';
import { Brain, CaretDown, CaretUp, SpeakerHigh, Play, Pause, WarningCircle, ArrowsOutSimple, PhoneCall } from '@phosphor-icons/react';

interface ChatMessageProps {
  message: Message;
  isAudioPlaying: boolean;
  onPlayAudio: (id: string, text: string) => void;
  onOpenImage: (image: { url: string; caption: string }) => void;
}

// A single message owns its thought drawer; playback stays coordinated by the chat.
export function ChatMessage({ message, isAudioPlaying, onPlayAudio, onOpenImage }: ChatMessageProps) {
  const [isThoughtExpanded, setIsThoughtExpanded] = useState(false);
  const isUser = message.sender_type === 'user';
  const isCrisis = message.media_type === 'crisis_resources';
  const isSelfie = message.media_type === 'selfie' && message.media_url;
  const isVoiceNote = message.media_type === 'voice_note';

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Crisis Intervention Banner */}
      {isCrisis && (
        <div className="mb-2 max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 bg-rose-500/10 border-2 border-rose-500/30 text-rose-100 flex items-start gap-3 shadow-lg shadow-rose-950/20">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <WarningCircle size={22} weight="fill" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <h4 className="font-bold text-rose-200">You Are Not Alone (Emergency Support)</h4>
            <p className="text-zinc-300 leading-relaxed">
              If you or someone you know is struggling or in crisis, compassionate help is available 24/7.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="tel:988"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
              >
                <PhoneCall size={14} weight="bold" />
                Call or Text 988
              </a>
              <a
                href="sms:741741?body=HOME"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-white/10 transition"
              >
                Text HOME to 741741
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Message Bubble */}
      <div
        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all ${
          isUser
            ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] rounded-br-sm shadow-sm'
            : isCrisis
            ? 'bg-rose-950/40 text-rose-100 border border-rose-500/30 rounded-bl-sm'
            : 'bg-white dark:bg-[#1C1A19] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.06] dark:border-white/[0.08] rounded-bl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
        }`}
      >
        {/* Spoken content */}
        <p className="text-sm sm:text-[16px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Generative Snapshot / Selfie Card */}
        {isSelfie && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 shadow-md group relative">
            <img
              src={message.media_url}
              alt="Candid Snapshot"
              className="w-full max-h-72 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => onOpenImage({ url: message.media_url!, caption: message.content })}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span className="text-xs text-white/90 font-medium">Click to inspect</span>
              <button
                onClick={() => onOpenImage({ url: message.media_url!, caption: message.content })}
                className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black"
              >
                <ArrowsOutSimple size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Interactive Voice Note Audio Player */}
        {(!isUser && isVoiceNote) && (
          <div className="mt-3 p-3 rounded-2xl bg-zinc-900/40 dark:bg-black/30 border border-white/10 flex items-center gap-3">
            <button
              onClick={() => onPlayAudio(message.id, message.content)}
              className="p-2.5 rounded-full bg-[#C85A32] text-white hover:bg-[#B34B24] transition-all shadow-sm active:scale-95 shrink-0"
            >
              {isAudioPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="text-[#C85A32] font-semibold flex items-center gap-1">
                  <SpeakerHigh size={12} weight="bold" />
                  {isAudioPlaying ? 'Playing Spoken Note...' : 'Audio Voice Note'}
                </span>
                <span>0:0{isAudioPlaying ? '3' : '5'}</span>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center gap-1 h-5 pt-0.5">
                {[40, 75, 55, 90, 60, 45, 80, 100, 70, 50, 85, 65, 40, 75, 50, 90, 60, 45, 70, 35].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${h}%` }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isAudioPlaying
                          ? 'bg-[#C85A32] animate-pulse'
                          : 'bg-zinc-600/40 dark:bg-zinc-400/40'
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timestamp and TTS trigger for normal messages */}
        {!isUser && !isVoiceNote && (
          <div className="mt-2.5 pt-2 border-t border-[#141312]/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
            <button
              onClick={() => onPlayAudio(message.id, message.content)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C85A32] hover:text-[#B34B24] transition-colors py-1"
            >
              <SpeakerHigh size={14} weight="bold" />
              <span>{isAudioPlaying ? 'Speaking...' : 'Listen in voice'}</span>
            </button>
            <span className="text-[10px] font-mono text-[#8C877F] shrink-0">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Cognitive Inner Monologue Drawer */}
      {!isUser && message.thought_trace && (
        <div className="mt-1.5 ml-1 sm:ml-2 max-w-[88%] sm:max-w-[78%]">
          <button
            onClick={() => setIsThoughtExpanded((expanded) => !expanded)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#8C877F] hover:text-[#C85A32] transition-colors py-0.5"
          >
            <Brain size={13} weight="bold" />
            <span>Cognitive Inner Monologue</span>
            {isThoughtExpanded ? (
              <CaretUp size={11} weight="bold" />
            ) : (
              <CaretDown size={11} weight="bold" />
            )}
          </button>

          {isThoughtExpanded && (
            <div className="mt-1 p-2.5 sm:p-3 rounded-xl bg-[#FAF1DC]/50 dark:bg-[#2B2313]/60 border border-[#FAF1DC] dark:border-[#3E331B] text-[11px] sm:text-[12px] font-mono text-[#6A4B0B] dark:text-[#FDE047] leading-relaxed">
              {message.thought_trace}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
