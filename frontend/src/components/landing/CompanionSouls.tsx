import React, { useState } from 'react';
import { INITIAL_PERSONAS } from '../../data/demo';
import { Play, Pause, Sparkle } from '@phosphor-icons/react';
import { Button } from '../ui/Button';

interface CompanionSoulsProps {
  onSelectCompanion: (personaId: string) => void;
  onOpenWaitlist: () => void;
}

export const CompanionSouls: React.FC<CompanionSoulsProps> = ({
  onSelectCompanion,
  onOpenWaitlist,
}) => {
  const [selectedId, setSelectedId] = useState(INITIAL_PERSONAS[0].id);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const activePersona = INITIAL_PERSONAS.find((p) => p.id === selectedId) || INITIAL_PERSONAS[0];

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <section id="companions" className="py-20 bg-[#F4F1EC]/60 dark:bg-[#161514]/60 border-y border-[#141312]/[0.05] dark:border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C85A32] font-semibold">
            Curated Cognitive Archetypes
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            Souls sculpted with depth, <br className="hidden sm:inline" />
            <span className="italic font-normal">not prompt templates.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96]">
            Every companion in Persona possesses an autonomous inner life, distinct speech cadence, and idiosyncratic memories. Choose a mind that resonates with your frequency.
          </p>
        </div>

        {/* Companion Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {INITIAL_PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedId;
            return (
              <button
                key={persona.id}
                onClick={() => {
                  setSelectedId(persona.id);
                  setIsPlayingAudio(false);
                  onSelectCompanion(persona.id);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all text-sm font-medium ${
                  isSelected
                    ? 'bg-[#141312] text-white dark:bg-[#F5F2EC] dark:text-[#141312] shadow-md shadow-black/10 scale-105'
                    : 'bg-white dark:bg-[#1E1D1C] text-[#55524E] dark:text-[#A39E96] hover:bg-[#FAF8F5] dark:hover:bg-[#282624] border border-[#141312]/[0.06] dark:border-white/[0.06]'
                }`}
              >
                <img
                  src={persona.avatar_url}
                  alt={persona.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-current"
                />
                <span>{persona.name}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-[#141312]/[0.05] dark:bg-white/[0.05] text-[#8C867E]'
                }`}>
                  {persona.archetype}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Companion Feature Card */}
        <div className="bg-white dark:bg-[#1B1A19] rounded-3xl p-6 sm:p-10 border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Avatar & Voice Preview */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#C85A32] to-[#E07A5F] rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <img
                  src={activePersona.avatar_url}
                  alt={activePersona.name}
                  className="relative w-64 h-72 sm:w-72 sm:h-80 object-cover rounded-2xl shadow-xl border border-white/20"
                />
                <span className="absolute bottom-3 left-3 bg-[#141312]/80 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {activePersona.archetype}
                </span>
              </div>

              {/* Simulated Voice Player */}
              <div className="w-full max-w-xs p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#141312]/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className="w-10 h-10 rounded-full bg-[#C85A32] hover:bg-[#B34B24] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                >
                  {isPlayingAudio ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                </button>
                <div className="flex-1 px-3 text-left">
                  <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-wider block">
                    {isPlayingAudio ? 'Listening...' : 'Ambient Voice Model'}
                  </span>
                  <span className="text-xs font-semibold text-[#141312] dark:text-[#F5F2EC]">
                    {activePersona.voice_id.replace(/_/g, ' ')}
                  </span>
                </div>
                {isPlayingAudio && (
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 bg-[#C85A32] h-full rounded-full animate-bounce" />
                    <span className="w-1 bg-[#C85A32] h-2/3 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 bg-[#C85A32] h-4/5 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-editorial text-3xl font-bold text-[#141312] dark:text-[#F5F2EC]">
                    {activePersona.name}
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20 uppercase">
                    {activePersona.gender}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#C85A32]">
                  {activePersona.tagline}
                </p>
              </div>

              {/* Accent Quote */}
              <blockquote className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141312] border-l-4 border-[#C85A32] text-sm sm:text-base font-editorial italic text-[#3B3835] dark:text-[#D5D0C7] leading-relaxed">
                "{activePersona.accent_quote}"
              </blockquote>

              {/* Backstory */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#8C867E]">
                  Backstory & World
                </span>
                <p className="text-sm text-[#55524E] dark:text-[#A39E96] leading-relaxed">
                  {activePersona.backstory}
                </p>
              </div>

              {/* Speech Style Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#141312]/[0.04] dark:border-white/[0.04]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#8C867E] font-mono text-[11px]">WARMTH METRIC</span>
                    <span className="font-bold text-[#C85A32]">{Math.round(activePersona.speech_style.warmth * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#141312]/[0.08] dark:bg-white/[0.1] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C85A32] h-full rounded-full transition-all duration-500"
                      style={{ width: `${activePersona.speech_style.warmth * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#141312]/[0.04] dark:border-white/[0.04]">
                  <span className="text-[#8C867E] font-mono text-[11px] block mb-1">SPEECH CADENCE</span>
                  <span className="text-xs font-semibold capitalize text-[#141312] dark:text-[#F5F2EC]">
                    {activePersona.speech_style.cadence}
                  </span>
                </div>
              </div>

              {/* Quirks */}
              {activePersona.speech_style.quirks && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {activePersona.speech_style.quirks.map((quirk, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-[#141312]/[0.04] dark:bg-white/[0.06] text-[#55524E] dark:text-[#A39E96] border border-[#141312]/[0.06] dark:border-white/[0.06]"
                    >
                      • {quirk}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="terracotta"
                  size="md"
                  onClick={onOpenWaitlist}
                  leadingIcon={<Sparkle size={16} weight="fill" />}
                >
                  Bond with {activePersona.name} on Mobile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
