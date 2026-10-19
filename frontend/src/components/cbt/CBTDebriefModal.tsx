import React, { useState } from 'react';
import type { Persona, CBTDebriefResponse } from '../../types';
import { api } from '../../services/api';

interface CBTDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const CBTDebriefModal: React.FC<CBTDebriefModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [groundedMoment, setGroundedMoment] = useState('');
  const [heavyBurden, setHeavyBurden] = useState('');
  const [quietPride, setQuietPride] = useState('');
  const [response, setResponse] = useState<CBTDebriefResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await api.executeCBTDebrief(
        persona.id,
        groundedMoment || 'A quiet pause during the afternoon',
        heavyBurden || 'Mental fatigue from trying to solve everything alone',
        quietPride || 'I stayed honest and gentle with myself'
      );
      setResponse(res);
      setStep(4);
    } catch (err) {
      console.error('CBT debrief error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setGroundedMoment('');
    setHeavyBurden('');
    setQuietPride('');
    setResponse(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#141312] border border-white/10 shadow-2xl overflow-hidden flex flex-col text-[#FAF8F5]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-lg shadow-inner">
              🌙
            </div>
            <div>
              <h2 className="text-lg font-medium text-white font-serif">
                Evening Socratic Debrief
              </h2>
              <p className="text-xs text-white/50">Guided 3-step wind-down with {persona.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 flex items-center space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs uppercase tracking-widest text-amber-400/90 font-mono">
                Step 1 of 3 — Grounding
              </span>
              <h3 className="text-xl font-medium text-white font-serif">
                When did you feel most like yourself today?
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Even in a chaotic day, there is usually a split second where you took a breath,
                tasted something warm, or felt your own honest pulse. Where was that moment?
              </p>
              <textarea
                value={groundedMoment}
                onChange={(e) => setGroundedMoment(e.target.value)}
                rows={4}
                placeholder="e.g. Walking between meetings under the cool autumn sky, or pouring morning tea in silence..."
                className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-all resize-none"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                >
                  Next Step ➔
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs uppercase tracking-widest text-rose-400/90 font-mono">
                Step 2 of 3 — Release
              </span>
              <h3 className="text-xl font-medium text-white font-serif">
                What heavy burden are you ready to leave behind tonight?
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Name the self-criticism, unfinished task, or unspoken anxiety that doesn't get to
                follow you into your rest. You can set it down right here.
              </p>
              <textarea
                value={heavyBurden}
                onChange={(e) => setHeavyBurden(e.target.value)}
                rows={4}
                placeholder="e.g. Feeling like I didn't get enough done, or replaying an awkward remark in my head..."
                className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/40 transition-all resize-none"
              />
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-2xl text-white/50 hover:text-white text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                >
                  Next Step ➔
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-xs uppercase tracking-widest text-emerald-400/90 font-mono">
                Step 3 of 3 — Self-Compassion Anchor
              </span>
              <h3 className="text-xl font-medium text-white font-serif">
                What is one quiet thing you did today that you're proud of?
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                It doesn't have to be a promotion or a milestone. Drinking a glass of water, being
                patient with someone, or simply enduring a hard hour with dignity all count.
              </p>
              <textarea
                value={quietPride}
                onChange={(e) => setQuietPride(e.target.value)}
                rows={4}
                placeholder="e.g. I stood up for my boundary, or I simply survived an exhausting day without snapping..."
                className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 transition-all resize-none"
              />
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-2xl text-white/50 hover:text-white text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-900/30 disabled:opacity-40"
                >
                  {isLoading ? 'Reflecting with Companion...' : 'Receive Socratic Reflection 🌙'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && response && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <img
                  src={persona.avatar_url}
                  alt={persona.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">{persona.name}'s Reflection</h4>
                  <span className="text-[11px] text-amber-300 font-mono">
                    ✦ +{response.intimacy_xp_earned} Intimacy XP • State: Grounded
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm leading-relaxed text-white/90 whitespace-pre-line font-serif italic">
                {response.reflection}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  ↺ Repeat reflection
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-all"
                >
                  Rest Peaceful Tonight
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
