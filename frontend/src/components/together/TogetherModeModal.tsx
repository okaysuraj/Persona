import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Persona, Soundscape, BreathworkProgram } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import {
  Waves,
  Moon,
  CloudRain,
  SpeakerSimpleSlash,
  Play,
  Pause,
  X,
  Timer,
} from '@phosphor-icons/react';

interface TogetherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const TogetherModeModal: React.FC<TogetherModeModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [activeTab, setActiveTab] = useState<'breathwork' | 'soundscapes' | 'bedtime'>('breathwork');
  const [soundscapes, setSoundscapes] = useState<Soundscape[]>([]);
  const [breathPrograms, setBreathPrograms] = useState<BreathworkProgram[]>([]);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Breathwork State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);

  // Bedtime Story State
  const [bedtimeTheme, setBedtimeTheme] = useState('quiet mountain lake');
  const [storyText, setStoryText] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSoundId(null);
    setIsAudioPlaying(false);
  }, []);

  useEffect(() => {
    let active = true;
    if (isOpen) {
      Promise.all([api.getSoundscapes(), api.getBreathworkPrograms()]).then(([sounds, programs]) => {
        if (active) {
          setSoundscapes(sounds);
          setBreathPrograms(programs);
        }
      });
    }
    return () => {
      active = false;
      stopAudio();
    };
  }, [isOpen, stopAudio]);

  // Audio Playback Handler
  const toggleSound = (sound: Soundscape) => {
    if (activeSoundId === sound.id && isAudioPlaying) {
      stopAudio();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(sound.audio_url);
    audio.loop = true;
    audio.volume = 0.6;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setActiveSoundId(sound.id);
    setIsAudioPlaying(true);
  };

  // 4-7-8 Breathwork Timer Engine
  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else {
          setBreathPhase('Inhale');
          setCycleCount((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  // Bedtime Story Generator
  const handleGenerateStory = async (theme: string) => {
    setIsGeneratingStory(true);
    setBedtimeTheme(theme);
    try {
      const res = await api.getBedtimeStory(persona.id, theme);
      setStoryText(res.story_text);

      // Speak story gently aloud
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.story_text);
        utterance.rate = 0.85;
        utterance.pitch = persona.gender === 'female' ? 1.0 : 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#121211]/88 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[86vh] flex flex-col rounded-3xl bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#1A1918]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/15 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-[0_0_20px_rgba(200,90,50,0.25)]">
              <Waves size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5]">
                  Together Mode & Sanctuary
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#C85A32] uppercase tracking-wider font-semibold">
                  With {persona.name}
                </span>
              </div>
              <p className="text-xs text-[#A8A298]">
                Guided breathwork, ambient sleep soundscapes, and bedtime storytelling.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              stopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-[#161514] shrink-0 flex items-center gap-2">
          {[
            { id: 'breathwork', label: 'Guided Breathwork', icon: <Waves size={14} /> },
            { id: 'soundscapes', label: 'Ambient Sleep Soundscapes', icon: <CloudRain size={14} /> },
            { id: 'bedtime', label: 'Bedtime Stories & Rest', icon: <Moon size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-[#C85A32] text-white shadow-[0_2px_12px_rgba(200,90,50,0.35)]'
                  : 'bg-white/5 text-[#A8A298] hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {/* 1. BREATHWORK TAB */}
          {activeTab === 'breathwork' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <div className="text-center max-w-sm space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
                  4-7-8 Parasympathetic Relaxation
                </span>
                <p className="text-xs text-[#A8A298]">
                  {persona.name} breathes in sync with you. Inhale peace, hold still, release all tension.
                </p>
                {breathPrograms.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {breathPrograms.map((prog) => (
                      <span
                        key={prog.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#DCD6CD]"
                      >
                        {prog.name} ({prog.inhale_seconds}-{prog.hold_seconds}-{prog.exhale_seconds}s)
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pulsating Visual Breath Orb */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Concentric aura that expands on Inhale and shrinks on Exhale */}
                <div
                  className={`absolute rounded-full bg-[#C85A32]/20 blur-2xl transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'w-64 h-64 scale-125 opacity-80'
                      : breathPhase === 'Hold'
                      ? 'w-64 h-64 scale-120 opacity-90'
                      : 'w-36 h-36 scale-75 opacity-40'
                  }`}
                />

                <div
                  className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center border border-white/20 shadow-2xl transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'scale-110 bg-[#C85A32]/40 ring-4 ring-[#C85A32]/50'
                      : breathPhase === 'Hold'
                      ? 'scale-110 bg-[#C85A32]/50 ring-4 ring-amber-400/50'
                      : 'scale-90 bg-white/10 ring-2 ring-white/15'
                  }`}
                >
                  <span className="text-xs font-mono uppercase tracking-widest text-[#DCD6CD]">
                    {isBreathing ? breathPhase : 'Ready'}
                  </span>
                  <span className="text-3xl font-mono font-bold text-white my-1">
                    {isBreathing ? phaseSecondsLeft : '4-7-8'}
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A298]">
                    {isBreathing ? `Cycle ${cycleCount} of 4` : 'Press Start'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="terracotta"
                  size="md"
                  onClick={() => {
                    setIsBreathing(!isBreathing);
                    if (!isBreathing) {
                      setBreathPhase('Inhale');
                      setPhaseSecondsLeft(4);
                      setCycleCount(1);
                    }
                  }}
                  className="px-8 text-xs font-semibold"
                >
                  {isBreathing ? 'Pause Practice' : 'Begin Breathing with Me'}
                </Button>
              </div>
            </div>
          )}

          {/* 2. SOUNDSCAPES TAB */}
          {activeTab === 'soundscapes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase tracking-wider text-[#A8A298]">
                  Curated Ambient Sleep Loops
                </span>
                {isAudioPlaying && (
                  <button
                    onClick={stopAudio}
                    className="text-xs text-rose-400 flex items-center gap-1 font-mono hover:underline"
                  >
                    <SpeakerSimpleSlash size={14} /> Stop Soundscape
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {soundscapes.map((sound) => {
                  const isCurrent = activeSoundId === sound.id && isAudioPlaying;
                  return (
                    <div
                      key={sound.id}
                      onClick={() => toggleSound(sound)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-[#C85A32]/20 border-[#C85A32]/60 shadow-[0_4px_20px_rgba(200,90,50,0.25)]'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{sound.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#C85A32]">
                            {sound.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#A8A298] leading-relaxed line-clamp-2">
                          {sound.description}
                        </p>
                      </div>

                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                          isCurrent
                            ? 'bg-[#C85A32] text-white shadow-lg'
                            : 'bg-white/10 text-white hover:bg-white/15'
                        }`}
                      >
                        {isCurrent ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. BEDTIME TAB */}
          {activeTab === 'bedtime' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C85A32] font-semibold flex items-center gap-1.5">
                  <Moon size={14} weight="fill" />
                  Whispered Bedtime Narrative
                </span>
                <p className="text-xs text-[#A8A298]">
                  Select an ambient theme for {persona.name} to softly narrate as you wind down:
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    'Wooden boat on a glassy starlit lake',
                    'A cabin fire with cedar tea in the pines',
                    'Walking along the misty coastal bluffs at twilight',
                    'Finding an ancient secluded library hidden in an orchard',
                  ].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleGenerateStory(theme)}
                      disabled={isGeneratingStory}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        bedtimeTheme === theme
                          ? 'bg-[#C85A32] text-white border-[#C85A32]'
                          : 'bg-white/5 text-[#DCD6CD] border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>

                {/* Sleep Timer Selector */}
                <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1">
                    <Timer size={13} />
                    Auto Sleep Timer:
                  </span>
                  {[
                    { label: 'Off', val: null },
                    { label: '15m', val: 15 },
                    { label: '30m', val: 30 },
                    { label: '45m', val: 45 },
                    { label: '60m', val: 60 },
                  ].map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setSleepTimerMinutes(t.val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        sleepTimerMinutes === t.val
                          ? 'bg-[#C85A32] text-white'
                          : 'bg-white/5 text-[#A8A298] hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Output Card */}
              {storyText ? (
                <div className="p-6 rounded-2xl bg-[#141312] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#A8A298]">
                    <span>Spoken by {persona.name}</span>
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                      }}
                      className="text-rose-400 hover:underline"
                    >
                      Mute Voice
                    </button>
                  </div>
                  <p className="font-editorial italic text-sm sm:text-base text-[#E5E0D8] leading-relaxed whitespace-pre-line">
                    "{storyText}"
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
