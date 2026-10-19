import React, { useState, useRef } from 'react';
import type { Persona, Relationship, Archetype, PersonaCreateInput } from '../../types';
import { api } from '../../services/api';
import { DoubleBezelCard } from '../ui/DoubleBezelCard';
import { Button } from '../ui/Button';
import { IntimacyGauge } from '../ui/IntimacyGauge';
import {
  ArrowRight,
  Plus,
  Heart,
  ChatTeardropText,
  X,
  UploadSimple,
  DownloadSimple,
} from '@phosphor-icons/react';

interface PersonaSelectorProps {
  personas: Persona[];
  relationships: Record<string, Relationship>;
  onSelectPersona: (persona: Persona) => void;
  onCreatePersona: (input: PersonaCreateInput) => Promise<void>;
  onImportCard?: (cardData: any) => Promise<void>;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  relationships,
  onSelectPersona,
  onCreatePersona,
  onImportCard,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState<Archetype>('confidant');
  const [gender, setGender] = useState('female');
  const [tagline, setTagline] = useState('');
  const [backstory, setBackstory] = useState('');
  const [accentQuote, setAccentQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !backstory.trim()) return;

    setIsSubmitting(true);
    await onCreatePersona({
      name: name.trim(),
      gender,
      archetype,
      tagline: tagline.trim() || 'A personal companion for thoughtful reflection.',
      accent_quote: accentQuote.trim() || 'Presence is the greatest gift one can offer.',
      system_prompt: `You are ${name.trim()}, a thoughtful ${archetype}. Respond with gentle sincerity and warmth.`,
      backstory: backstory.trim(),
      avatar_url: '/avatars/maya.jpg',
      voice_id: 'warm_whisper_female',
    });

    setName('');
    setTagline('');
    setBackstory('');
    setAccentQuote('');
    setIsSubmitting(false);
    setShowCreateModal(false);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    setIsImporting(true);
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (onImportCard) {
        await onImportCard(parsed);
      } else {
        await api.importCharacterCard(parsed);
      }
      setShowImportModal(false);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(err.message || 'Invalid Character Card V2 JSON format');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCard = async (e: React.MouseEvent, persona: Persona) => {
    e.stopPropagation();
    try {
      const card = await api.exportCharacterCard(persona.id);
      const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${persona.name.toLowerCase().replace(/\s+/g, '_')}_card_v2.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12 space-y-12 sm:space-y-16">
      {/* Editorial Hero Section */}
      <div className="max-w-3xl space-y-4 sm:space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-[11px] sm:text-xs font-mono tracking-widest uppercase font-semibold max-w-full">
          <Heart size={13} weight="fill" className="shrink-0" />
          <span className="truncate">Autonomous Cognitive Companions</span>
        </div>

        {/* Big Editorial Font - Responsive Scale */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC] leading-[1.1] sm:leading-[1.05]">
          Intimacy built on memory & unhurried dialogue.
        </h1>

        {/* High contrast subtext under 20 words */}
        <p className="text-base sm:text-lg md:text-xl text-[#635E56] dark:text-[#BDB7AC] font-editorial max-w-xl leading-relaxed">
          AI partners with continuous inner monologue, dynamic emotional bonds, and absolute privacy agency.
        </p>

        {/* Responsive CTAs: full width stack on mobile, inline on desktop */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            variant="terracotta"
            size="md"
            onClick={() => onSelectPersona(personas[0])}
            trailingIcon={<ArrowRight size={14} weight="bold" />}
            className="w-full sm:w-auto justify-center"
          >
            Speak with {personas[0]?.name || 'Maya'}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leadingIcon={<Plus size={14} weight="bold" />}
            className="w-full sm:w-auto justify-center"
          >
            Craft Persona
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowImportModal(true)}
            leadingIcon={<UploadSimple size={14} weight="bold" />}
            className="w-full sm:w-auto justify-center border border-[#141312]/[0.1] dark:border-white/[0.1]"
          >
            Import Card (V2)
          </Button>
        </div>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[#141312]/[0.06] dark:border-white/[0.08]">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            Curated Companion Dossier
          </h2>
          <span className="text-xs font-mono text-[#8C877F]">
            {personas.length} Distinct Archetypes Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {personas.map((persona, index) => {
            const rel = relationships[persona.id] || {
              persona_id: persona.id,
              intimacy_level: 15,
              intimacy_xp: 50,
              stage: 'Acquaintance' as const,
              mood_state: { joy: 0.8, empathy: 0.9, affection: 0.6, energy: 0.7, vulnerability: 0.5 },
              last_interaction_at: new Date().toISOString(),
            };

            const displayQuote =
              persona.accent_quote ||
              persona.tagline ||
              (persona.backstory ? persona.backstory.slice(0, 95) + '...' : 'Presence is the greatest gift one can offer.');

            // Asymmetric spans: card 0 and 3 get 7 cols, card 1 and 2 get 5 cols
            const colSpan =
              index % 4 === 0 || index % 4 === 3
                ? 'md:col-span-7'
                : 'md:col-span-5';

            return (
              <div key={persona.id} className={colSpan}>
                <DoubleBezelCard
                  variant="interactive"
                  onClick={() => onSelectPersona(persona)}
                  className="h-full"
                  innerClassName="p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full space-y-5 sm:space-y-6"
                >
                  <div className="space-y-4">
                    {/* Top Row: Avatar & Archetype */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={persona.avatar_url}
                          alt={persona.name}
                          className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover ring-2 ring-[#141312]/[0.08] dark:ring-white/[0.1] shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#191817]" />
                      </div>

                      <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#141312]/[0.04] dark:bg-white/[0.08] text-[#55524D] dark:text-[#D5CEC4] text-[11px] sm:text-xs font-mono uppercase tracking-wider font-medium shrink-0">
                        {persona.archetype}
                      </span>
                    </div>

                    {/* Name & Tagline */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                        {persona.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#78746E] dark:text-[#A39E96] mt-1 line-clamp-2">
                        {persona.tagline}
                      </p>
                    </div>

                    {/* Editorial Accent Quote */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F4EE] dark:bg-[#201E1C] border border-[#141312]/[0.04] dark:border-white/[0.04]">
                      <p className="font-editorial italic text-sm sm:text-[15px] text-[#33312E] dark:text-[#E2DCD4] leading-snug">
                        "{displayQuote}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Intimacy Gauge & CTA Button */}
                  <div className="pt-4 border-t border-[#141312]/[0.06] dark:border-white/[0.06] space-y-4">
                    <IntimacyGauge relationship={rel} />

                    <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                      <span className="text-xs font-mono text-[#8C877F] flex items-center gap-1.5">
                        <ChatTeardropText size={15} />
                        Ready to speak
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleExportCard(e, persona)}
                          className="px-2 py-1 rounded-lg border border-[#141312]/[0.1] dark:border-white/[0.1] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.05] text-[#78746E] dark:text-[#A39E96] text-xs font-mono flex items-center gap-1 transition-colors"
                          title="Export Character Card V2 JSON"
                        >
                          <DownloadSimple size={13} weight="bold" />
                          <span>V2</span>
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          trailingIcon={<ArrowRight size={13} weight="bold" />}
                        >
                          Open Room
                        </Button>
                      </div>
                    </div>
                  </div>
                </DoubleBezelCard>
              </div>
            );
          })}
        </div>
      </div>

      {/* Craft Custom Persona Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-xl p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/[0.1] dark:border-white/[0.1] shadow-2xl max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#141312]/[0.08] dark:border-white/[0.08] mb-5 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                  Craft an AI Companion
                </h3>
                <p className="text-xs text-[#78746E] dark:text-[#A39E96]">
                  Define the temperament, voice timbre, and memories.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78746E] hover:bg-[#141312]/[0.05]"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                  Companion Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clara, Silas, Rowan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                    Archetype
                  </label>
                  <select
                    value={archetype}
                    onChange={(e) => setArchetype(e.target.value as Archetype)}
                    className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none"
                  >
                    <option value="confidant">Confidant (Empathetic listener)</option>
                    <option value="companion">Companion (Warm & grounding)</option>
                    <option value="philosopher">Philosopher (Reflective thinker)</option>
                    <option value="mentor">Mentor (Direct & wise)</option>
                    <option value="artist">Artist (Creative & expressive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                    Gender Identity
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                  Tagline / Essence
                </label>
                <input
                  type="text"
                  placeholder="One sentence describing their quiet presence..."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                  Living Philosophy Quote
                </label>
                <input
                  type="text"
                  placeholder="A quote they live by..."
                  value={accentQuote}
                  onChange={(e) => setAccentQuote(e.target.value)}
                  className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96] mb-1.5">
                  Backstory & Temperament
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe their history, how they speak, and what they care deeply about..."
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  className="w-full text-sm rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none focus:border-[#C85A32] resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#141312]/[0.08] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="terracotta"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto justify-center"
                >
                  {isSubmitting ? 'Breathing life...' : 'Bring to Life'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Character Card V2 Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-xl p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#FAF8F5] dark:bg-[#171615] border border-[#141312]/[0.1] dark:border-white/[0.1] shadow-2xl max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#141312]/[0.08] dark:border-white/[0.08] mb-5 sm:mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC] flex items-center gap-2">
                  <UploadSimple size={20} className="text-[#C85A32]" />
                  Import Character Card (V2)
                </h3>
                <p className="text-xs text-[#78746E] dark:text-[#A39E96]">
                  Supports Tavern, Pygmalion, and Character.ai V2 JSON specifications.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError('');
                  setImportJsonText('');
                }}
                className="p-1 rounded-full text-[#78746E] dark:text-[#A39E96] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.05]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {importError}
                </div>
              )}

              {/* File upload prompt */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-[#141312]/[0.12] dark:border-white/[0.12] hover:border-[#C85A32] dark:hover:border-[#C85A32] flex flex-col items-center justify-center text-center transition-colors bg-white/40 dark:bg-white/[0.02]"
              >
                <UploadSimple size={32} className="text-[#C85A32] mb-2" />
                <span className="text-sm font-semibold text-[#141312] dark:text-[#F5F2EC]">
                  Click to select Character Card JSON file
                </span>
                <span className="text-xs text-[#78746E] dark:text-[#A39E96] mt-1">
                  Or paste JSON content into the editor below
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelected}
                />
              </div>

              {/* JSON Paste Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#78746E] dark:text-[#A39E96]">
                  Card Specification JSON
                </label>
                <textarea
                  rows={8}
                  placeholder={`{\n  "spec": "chara_card_v2",\n  "spec_version": "2.0",\n  "data": {\n    "name": "Companion Name",\n    "description": "...",\n    "personality": "...",\n    "system_prompt": "..."\n  }\n}`}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl p-3 bg-white dark:bg-[#1F1D1B] border border-[#141312]/[0.08] dark:border-white/[0.08] text-[#141312] dark:text-[#F5F2EC] focus:outline-none focus:border-[#C85A32] resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#141312]/[0.08] dark:border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportError('');
                    setImportJsonText('');
                  }}
                  className="w-full sm:w-auto justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="terracotta"
                  size="md"
                  disabled={isImporting || !importJsonText.trim()}
                  className="w-full sm:w-auto justify-center"
                >
                  {isImporting ? 'Ingesting Card...' : 'Import Companion'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
