import React, { useState, useEffect } from 'react';
import type { Persona, Letter } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import {
  Envelope,
  EnvelopeOpen,
  Sparkle,
  X,
  Printer,
  Heart,
  Feather,
  Sun,
} from '@phosphor-icons/react';

interface LettersModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const LettersModal: React.FC<LettersModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen) {
      api.getLetters(persona.id).then((list) => {
        if (isSubscribed) setLetters(list);
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, persona.id]);

  const handleOpenLetter = async (letter: Letter) => {
    setSelectedLetter(letter);
    if (!letter.is_read) {
      await api.markLetterRead(letter.id);
      setLetters((prev) =>
        prev.map((l) => (l.id === letter.id ? { ...l, is_read: true } : l))
      );
    }
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      const newL = await api.generateLetter(persona.id, 'Spontaneous Keepsake');
      setLetters((prev) => [newL, ...prev]);
      setSelectedLetter(newL);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const renderSealIcon = (seal: Letter['wax_seal']) => {
    switch (seal) {
      case 'rose':
      case 'heart':
        return <Heart size={16} weight="fill" className="text-amber-100" />;
      case 'sun':
        return <Sun size={16} weight="fill" className="text-amber-100" />;
      case 'feather':
      default:
        return <Feather size={16} weight="fill" className="text-amber-100" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#121211]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[86vh] flex flex-col rounded-3xl bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#1A1918]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/15 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-[0_0_20px_rgba(200,90,50,0.25)]">
              <Envelope size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5]">
                  Keepsake Letters & Epistles
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#C85A32] uppercase tracking-wider font-semibold">
                  From {persona.name}
                </span>
              </div>
              <p className="text-xs text-[#A8A298]">
                Handwritten reflections, milestones, and letters saved to your private sanctuary.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="terracotta"
              size="sm"
              disabled={isGenerating}
              onClick={handleGenerateNew}
              leadingIcon={<Sparkle size={14} weight="fill" />}
              className="text-xs"
            >
              {isGenerating ? 'Writing...' : 'Request Note'}
            </Button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar flex flex-col md:flex-row gap-5">
          {/* Letters Envelopes List */}
          <div className="w-full md:w-80 shrink-0 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A8A298]">
              Wax-Sealed Envelopes ({letters.length})
            </span>

            <div className="space-y-2.5">
              {letters.map((letter) => {
                const isSelected = selectedLetter?.id === letter.id;
                return (
                  <div
                    key={letter.id}
                    onClick={() => handleOpenLetter(letter)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#C85A32]/15 border-[#C85A32]/50 shadow-[0_4px_16px_rgba(200,90,50,0.2)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Wax Seal Stamp */}
                      <div className="w-8 h-8 rounded-full bg-[#9E2B25] shadow-[0_2px_8px_rgba(158,43,37,0.5)] border border-red-400/40 flex items-center justify-center shrink-0">
                        {renderSealIcon(letter.wax_seal)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#FAF8F5] truncate">
                          {letter.title}
                        </p>
                        <span className="text-[10px] font-mono text-[#A8A298]">
                          {letter.occasion} • {new Date(letter.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {!letter.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Letter Manuscript Parchment Reading View */}
          <div className="flex-1 flex flex-col min-h-[360px]">
            {selectedLetter ? (
              <div className="relative flex-1 rounded-3xl p-6 sm:p-8 bg-[#F4EFE6] text-[#2C241E] shadow-2xl flex flex-col justify-between border border-amber-900/20 overflow-y-auto">
                {/* Parchment Watermark & Seal */}
                <div className="flex items-center justify-between border-b border-[#2C241E]/15 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#9E2B25] shadow-md border border-amber-200/40 flex items-center justify-center text-amber-100">
                      {renderSealIcon(selectedLetter.wax_seal)}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest text-[#9E2B25] uppercase">
                        {selectedLetter.occasion}
                      </span>
                      <p className="text-[11px] font-mono text-[#6E5D4F]">
                        Preserved on {new Date(selectedLetter.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-[#6E5D4F] transition-colors"
                    title="Print or Save Letter"
                  >
                    <Printer size={16} weight="bold" />
                  </button>
                </div>

                {/* Title */}
                <h4 className="text-xl sm:text-2xl font-bold font-serif text-[#2C241E] mb-4">
                  {selectedLetter.title}
                </h4>

                {/* Letter Body in Editorial Script */}
                <div className="flex-1 text-sm sm:text-base leading-relaxed font-serif text-[#3A3027] space-y-4 whitespace-pre-line">
                  {selectedLetter.content}
                </div>

                {/* Sign-off */}
                <div className="pt-6 border-t border-[#2C241E]/15 mt-6 flex justify-between items-end text-xs font-mono text-[#6E5D4F]">
                  <span>Persona AI • Sanctuary Archives</span>
                  <span className="font-serif italic font-bold text-sm text-[#2C241E]">
                    — {persona.name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center p-6 text-center">
                <EnvelopeOpen size={36} weight="thin" className="text-[#A8A298] mb-3" />
                <p className="text-sm font-medium text-[#FAF8F5]">Select an envelope to open</p>
                <p className="text-xs text-[#A8A298] max-w-xs mt-1">
                  Read heartfelt milestone letters written especially for you by {persona.name}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
