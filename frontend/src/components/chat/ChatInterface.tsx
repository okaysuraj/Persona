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

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] max-w-4xl mx-auto px-4 pb-4">
      {/* Top Intimate Companion Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#141312]/[0.08] dark:border-white/[0.08] gap-3 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={persona.avatar_url}
              alt={persona.name}
              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-[#141312]/[0.06] dark:ring-white/[0.1] shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141312]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                {persona.name}
              </h2>
              <span className="text-xs font-mono text-[#8C877F] uppercase tracking-wider">
                {persona.archetype}
              </span>
            </div>
            <p className="text-xs text-[#6B665E] dark:text-[#A8A298] line-clamp-1 max-w-md">
              {persona.tagline}
            </p>
          </div>
        </div>

        {/* Compact Intimacy Meter with micro-celebrate */}
        <div
          onClick={triggerCelebration}
          className="cursor-pointer p-2 rounded-2xl bg-white/60 dark:bg-[#1C1A18]/60 border border-[#141312]/[0.05] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#1C1A18] transition-colors"
          title="Click to celebrate bond"
        >
          <IntimacyGauge relationship={relationship} compact />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Companion Accent Quote Banner */}
        <div className="p-4 rounded-2xl bg-[#C85A32]/[0.04] dark:bg-[#C85A32]/[0.08] border border-[#C85A32]/15 text-center my-2">
          <p className="font-editorial italic text-base sm:text-lg text-[#141312] dark:text-[#F5F2EC]">
            "{persona.accent_quote}"
          </p>
          <p className="text-[11px] font-mono text-[#8C877F] uppercase tracking-widest mt-1.5">
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
                className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 transition-all ${
                  isUser
                    ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] rounded-br-sm shadow-sm'
                    : 'bg-white dark:bg-[#1C1A19] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.06] dark:border-white/[0.08] rounded-bl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                }`}
              >
                {/* Spoken content */}
                <p className="text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Voice Note Simulation */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-[#141312]/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => simulateAudioPlay(msg.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C85A32] hover:text-[#B34B24] transition-colors"
                    >
                      <SpeakerHigh size={14} weight="bold" />
                      {isAudioPlaying ? 'Playing audio tone...' : 'Listen to voice note'}
                    </button>
                    <span className="text-[10px] font-mono text-[#8C877F]">
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
                <div className="mt-1.5 ml-2 max-w-[85%] sm:max-w-[78%]">
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
                    <div className="mt-1 p-3 rounded-xl bg-[#FAF1DC]/50 dark:bg-[#2B2313]/60 border border-[#FAF1DC] dark:border-[#3E331B] text-[12px] font-mono text-[#6A4B0B] dark:text-[#FDE047] leading-relaxed">
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
            <div className="max-w-[85%] sm:max-w-[78%] rounded-3xl rounded-bl-sm p-4 sm:p-5 bg-white dark:bg-[#1C1A19] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-sm">
              <p className="text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap">
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

      {/* Suggested Quick Intimacy Prompts */}
      <div className="pt-2 pb-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C877F] shrink-0">
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
              className="shrink-0 text-xs px-3 py-1 rounded-full bg-white dark:bg-[#1E1C1A] text-[#55524E] dark:text-[#C5BFB5] hover:border-[#C85A32] hover:text-[#C85A32] border border-[#141312]/[0.06] dark:border-white/[0.08] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Composer Input */}
      <div className="shrink-0 relative rounded-3xl bg-white dark:bg-[#1A1917] border border-[#141312]/[0.08] dark:border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Speak with ${persona.name}... (press Enter to send)`}
          rows={1}
          disabled={isStreaming}
          className="w-full bg-transparent resize-none px-3 py-2 text-sm sm:text-base text-[#141312] dark:text-[#F5F2EC] placeholder-[#8C877F] focus:outline-none max-h-32"
          style={{ minHeight: '44px' }}
        />

        <div className="flex items-center justify-between px-2 pt-1 border-t border-[#141312]/[0.04] dark:border-white/[0.04]">
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C877F]">
            <kbd>Enter</kbd> to send
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              <kbd>Shift+Enter</kbd> for line
            </span>
          </div>

          <Button
            variant="terracotta"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            trailingIcon={<PaperPlaneTilt size={13} weight="bold" />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
