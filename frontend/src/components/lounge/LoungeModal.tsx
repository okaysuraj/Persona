import React, { useState } from 'react';
import type { Persona, LoungeTurnResponse } from '../../types';
import { api } from '../../services/api';

interface LoungeModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
}

export const LoungeModal: React.FC<LoungeModalProps> = ({
  isOpen,
  onClose,
  personas,
}) => {
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>(() =>
    personas.slice(0, 2).map((p) => p.id)
  );
  const [theme, setTheme] = useState<'fireside' | 'kyoto' | 'jazz'>('fireside');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<
    Array<{
      sender: string;
      avatar?: string;
      archetype?: string;
      content: string;
      thought?: string;
      isUser: boolean;
    }>
  >([
    {
      sender: 'Salon Host',
      content:
        'Welcome to The Lounge. A quiet evening parlor where multiple companions gather to converse together with you.',
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupHarmony, setGroupHarmony] = useState(45);

  if (!isOpen) return null;

  const togglePersona = (id: string) => {
    if (selectedPersonaIds.includes(id)) {
      if (selectedPersonaIds.length > 2) {
        setSelectedPersonaIds(selectedPersonaIds.filter((p) => p !== id));
      }
    } else {
      setSelectedPersonaIds([...selectedPersonaIds, id]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || selectedPersonaIds.length < 2) return;

    const userText = message.trim();
    setMessage('');
    setHistory((prev) => [...prev, { sender: 'You', content: userText, isUser: true }]);
    setIsLoading(true);

    try {
      const response: LoungeTurnResponse = await api.executeLoungeTurn(
        selectedPersonaIds,
        userText,
        theme === 'fireside'
          ? 'Autumn Hearth Fireside'
          : theme === 'kyoto'
          ? 'Kyoto Veranda Garden'
          : 'Late Night Vinyl Salon'
      );

      setGroupHarmony((prev) => Math.min(100, prev + (response.group_harmony_xp || 20)));

      // Sequentially append companion turns for natural conversational cadence
      for (const turn of response.turns) {
        setHistory((prev) => [
          ...prev,
          {
            sender: turn.persona_name,
            avatar: turn.avatar_url,
            archetype: turn.archetype,
            content: turn.content,
            thought: turn.thought_trace,
            isUser: false,
          },
        ]);
      }
    } catch (err) {
      console.error('Lounge turn error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const THEME_STYLES = {
    fireside: {
      bg: 'from-[#1a120c] via-[#120d09] to-[#0d0906]',
      accent: '#C85A32',
      badge: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
      label: 'Autumn Hearth Fireside',
    },
    kyoto: {
      bg: 'from-[#0d1410] via-[#09100c] to-[#060a08]',
      accent: '#4E8752',
      badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
      label: 'Kyoto Veranda Garden',
    },
    jazz: {
      bg: 'from-[#120f1c] via-[#0d0a14] to-[#08060d]',
      accent: '#8B5CF6',
      badge: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40',
      label: 'Late Night Vinyl Salon',
    },
  };

  const currentTheme = THEME_STYLES[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl h-[92vh] max-h-[850px] flex flex-col rounded-3xl bg-gradient-to-b ${currentTheme.bg} border border-white/10 shadow-2xl overflow-hidden transition-all duration-500`}
      >
        {/* Salon Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-black/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-medium tracking-tight text-white font-serif">
                  The Lounge
                </h2>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${currentTheme.badge}`}>
                  {currentTheme.label}
                </span>
              </div>
              <p className="text-xs text-white/50">Multi-companion group salon & cross-banter</p>
            </div>
          </div>

          {/* Group Harmony Meter & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-xs text-white/60">Salon Harmony</span>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${groupHarmony}%` }}
                />
              </div>
              <span className="text-xs font-mono text-white/80">{groupHarmony}%</span>
            </div>

            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setTheme('fireside')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  theme === 'fireside' ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40' : 'text-white/40 hover:text-white'
                }`}
              >
                🔥 Fireside
              </button>
              <button
                type="button"
                onClick={() => setTheme('kyoto')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  theme === 'kyoto' ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40' : 'text-white/40 hover:text-white'
                }`}
              >
                🍃 Veranda
              </button>
              <button
                type="button"
                onClick={() => setTheme('jazz')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  theme === 'jazz' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'text-white/40 hover:text-white'
                }`}
              >
                🎷 Vinyl
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Participating Companions Bar */}
        <div className="px-6 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/60 font-medium">Select Companions in Parlor:</span>
          <div className="flex items-center space-x-2">
            {personas.map((p) => {
              const isSelected = selectedPersonaIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePersona(p.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-all border ${
                    isSelected
                      ? 'bg-white/20 border-white/40 text-white shadow-sm'
                      : 'bg-black/20 border-white/5 text-white/40 hover:text-white/80'
                  }`}
                >
                  <img
                    src={p.avatar_url}
                    alt={p.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {history.map((turn, i) => (
            <div
              key={i}
              className={`flex flex-col ${turn.isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                turn.isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {!turn.isUser && (
                <div className="flex items-center space-x-2 mb-1.5 pl-1">
                  {turn.avatar && (
                    <img
                      src={turn.avatar}
                      alt={turn.sender}
                      className="w-5 h-5 rounded-full object-cover border border-white/20"
                    />
                  )}
                  <span className="text-xs font-medium text-white/80">{turn.sender}</span>
                  {turn.archetype && (
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                      • {turn.archetype}
                    </span>
                  )}
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border shadow-md ${
                  turn.isUser
                    ? 'bg-amber-600/25 border-amber-500/30 text-white rounded-br-none'
                    : 'bg-white/10 border-white/10 text-white/90 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{turn.content}</p>

                {turn.thought && (
                  <details className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-white/50 group">
                    <summary className="cursor-pointer select-none hover:text-white/70 transition-colors">
                      💭 Inner appraisal trace
                    </summary>
                    <p className="mt-1 pl-2 border-l border-white/20 italic">{turn.thought}</p>
                  </details>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3 text-white/50 text-xs pl-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Companions are reflecting on your words together...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex items-center space-x-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a thought with the parlor (e.g. 'How do you both define peace?')..."
            className="flex-1 bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
          >
            Speak to Parlor
          </button>
        </form>
      </div>
    </div>
  );
};
