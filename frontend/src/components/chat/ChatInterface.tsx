import { useState, useRef, useEffect } from 'react';
import type { Persona, Relationship, Message } from '../../types';
import { Button } from '../ui/Button';
import { IntimacyGauge } from '../ui/IntimacyGauge';
import {
  PaperPlaneTilt,
  Brain,
  CaretDown,
  CaretUp,
  Sparkle,
  SpeakerHigh,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';

interface ChatInterfaceProps {
  persona: Persona;
  relationship: Relationship;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isStreaming: boolean;
  streamingToken: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  persona,
  relationship,
  messages,
  onSendMessage,
  isStreaming,
  streamingToken,
}) => {
  const [input, setInput] = useState('');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, streamingToken]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const content = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(content);
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

  const simulateAudioPlay = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(msgId);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 4500);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C85A32', '#F7E4DC', '#346538'],
    });
  };

  const quoteText =
    persona.accent_quote ||
    persona.tagline ||
    'Presence is the greatest gift one can offer.';

  return (
    <div className="flex flex-col h-[calc(100dvh-4.75rem)] sm:h-[calc(100dvh-7.5rem)] max-w-4xl mx-auto px-2.5 sm:px-4 pb-2 sm:pb-4">
      {/* Top Intimate Companion Bar - Streamlined on Mobile */}
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

        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user';
          const isAudioPlaying = playingAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all ${
                  isUser
                    ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] rounded-br-sm shadow-sm'
                    : 'bg-white dark:bg-[#1C1A19] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.06] dark:border-white/[0.08] rounded-bl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                }`}
              >
                {/* Spoken content */}
                <p className="text-sm sm:text-[16px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Voice Note Simulation */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-[#141312]/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
                    <button
                      onClick={() => simulateAudioPlay(msg.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C85A32] hover:text-[#B34B24] transition-colors py-1"
                    >
                      <SpeakerHigh size={14} weight="bold" />
                      <span>{isAudioPlaying ? 'Playing audio tone...' : 'Listen to voice note'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-[#8C877F] shrink-0">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* LangGraph Cognitive Perception / Thought Monologue */}
              {!isUser && msg.thought_trace && (
                <div className="mt-1.5 ml-1 sm:ml-2 max-w-[88%] sm:max-w-[78%]">
                  <button
                    onClick={() => toggleThought(msg.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#8C877F] hover:text-[#C85A32] transition-colors py-0.5"
                  >
                    <Brain size={13} weight="bold" />
                    <span>Cognitive Inner Monologue</span>
                    {expandedThoughts[msg.id] ? (
                      <CaretUp size={11} weight="bold" />
                    ) : (
                      <CaretDown size={11} weight="bold" />
                    )}
                  </button>

                  {expandedThoughts[msg.id] && (
                    <div className="mt-1 p-2.5 sm:p-3 rounded-xl bg-[#FAF1DC]/50 dark:bg-[#2B2313]/60 border border-[#FAF1DC] dark:border-[#3E331B] text-[11px] sm:text-[12px] font-mono text-[#6A4B0B] dark:text-[#FDE047] leading-relaxed">
                      {msg.thought_trace}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

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
              <span>Thinking & formulating appraisal...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Intimacy Prompts - Smooth Mobile Carousel */}
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

      {/* Composer Input */}
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
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C877F]">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd>Enter</kbd> to send • <kbd>Shift+Enter</kbd> for line
            </span>
            <span className="sm:hidden text-[10px] text-[#A8A298]">
              Private & unhurried
            </span>
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
    </div>
  );
};
