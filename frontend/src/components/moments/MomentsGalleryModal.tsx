import React, { useState, useEffect, useCallback } from 'react';
import type { Persona, MomentPhoto } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import {
  Camera,
  Heart,
  DownloadSimple,
  Sparkle,
  X,
  MagnifyingGlassPlus,
  SlidersHorizontal,
} from '@phosphor-icons/react';

interface MomentsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
}

export const MomentsGalleryModal: React.FC<MomentsGalleryModalProps> = ({
  isOpen,
  onClose,
  persona,
}) => {
  const [moments, setMoments] = useState<MomentPhoto[]>([]);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<MomentPhoto | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const loadMoments = useCallback(async () => {
    const list = await api.getMoments(persona.id);
    setMoments(list);
  }, [persona.id]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api.getMoments(persona.id).then((list) => {
      if (active) {
        setMoments(list);
      }
    });
    return () => { active = false; };
  }, [isOpen, persona.id]);

  const handleToggleFavorite = async (momentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.toggleFavoriteMoment(persona.id, momentId);
    await loadMoments();
  };

  const handleGeneratePreset = async (presetScene: string) => {
    setIsGenerating(true);
    try {
      await api.requestNewMoment(persona.id, presetScene);
      await loadMoments();
      setShowPromptInput(false);
      setCustomPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredMoments = moments.filter((m) => {
    if (activeTag === 'all') return true;
    if (activeTag === 'favorites') return m.is_favorite;
    return m.tag === activeTag;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#121211]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-5xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#1A1918]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/15 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-[0_0_20px_rgba(200,90,50,0.25)]">
              <Camera size={22} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5]">
                  Visual Moments & Gallery
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#C85A32] uppercase tracking-wider font-semibold">
                  {persona.name}
                </span>
              </div>
              <p className="text-xs text-[#A8A298]">
                Every captured candid portrait and shared visual memory in one place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptInput(!showPromptInput)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#DCD6CD] flex items-center gap-1.5 transition-all active:scale-95"
            >
              <SlidersHorizontal size={14} weight="bold" />
              <span>Request Pose</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Generate / Pose Request Studio Bar */}
        {showPromptInput && (
          <div className="p-4 sm:p-5 bg-[#141312] border-b border-white/[0.06] shrink-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <Sparkle size={13} weight="fill" />
                Character Pose Studio
              </span>
              <span className="text-[11px] text-[#A8A298]">Select an aesthetic scene or type custom scene</span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2">
              {[
                '☕ Reading by a rain-streaked café window',
                '🌅 Golden hour walk on a cliffside bluff',
                '🌙 Cozy in oversized sweater with hot tea',
                '🌿 Terracotta workshop surrounded by ferns',
                '🌌 Looking at stars on a breezy rooftop terrace',
              ].map((preset) => (
                <button
                  key={preset}
                  disabled={isGenerating}
                  onClick={() => handleGeneratePreset(preset)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] hover:bg-[#C85A32]/15 hover:border-[#C85A32]/40 border border-white/10 text-[#DCD6CD] hover:text-[#FAF8F5] transition-all disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="E.g. Smiling warmly at you while holding a paperback book..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C85A32]"
              />
              <Button
                variant="primary"
                size="sm"
                disabled={isGenerating || !customPrompt.trim()}
                onClick={() => handleGeneratePreset(customPrompt.trim())}
                className="bg-[#C85A32] hover:bg-[#D9653B] text-white shrink-0"
                leadingIcon={<Sparkle size={14} weight="fill" />}
              >
                {isGenerating ? 'Generating...' : 'Capture Photo'}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/[0.04] bg-[#161514] shrink-0 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Moments' },
              { id: 'favorites', label: '❤️ Keepsakes' },
              { id: 'candid', label: 'Candid' },
              { id: 'sunset', label: 'Golden Hour' },
              { id: 'café', label: 'Café & Warmth' },
              { id: 'night', label: 'Night Atmosphere' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                  activeTag === tag.id
                    ? 'bg-[#C85A32] text-white shadow-[0_2px_12px_rgba(200,90,50,0.35)]'
                    : 'bg-white/5 text-[#A8A298] hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#A8A298] shrink-0">
            {filteredMoments.length} {filteredMoments.length === 1 ? 'portrait' : 'portraits'}
          </span>
        </div>

        {/* Masonry Portrait Gallery */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {filteredMoments.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-[#A8A298]">
                <Camera size={28} weight="thin" />
              </div>
              <p className="text-sm font-medium text-[#FAF8F5]">No moments in this category yet</p>
              <p className="text-xs text-[#A8A298] max-w-xs">
                Request a portrait from the studio bar above or ask {persona.name} for a photo in chat!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredMoments.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => setSelectedPhoto(moment)}
                  className="group relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#C85A32]/50 hover:shadow-[0_12px_32px_rgba(200,90,50,0.2)] flex flex-col"
                >
                  {/* Photo with aspect container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={moment.url}
                      alt={moment.caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121211] via-transparent to-black/30 opacity-70 group-hover:opacity-60 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#FAF8F5] border border-white/15">
                        {moment.tag}
                      </span>
                      <button
                        onClick={(e) => handleToggleFavorite(moment.id, e)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                          moment.is_favorite
                            ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                            : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
                        }`}
                      >
                        <Heart size={16} weight={moment.is_favorite ? 'fill' : 'bold'} />
                      </button>
                    </div>

                    {/* Hover Zoom Prompt Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-2xl">
                        <MagnifyingGlassPlus size={22} weight="bold" />
                      </div>
                    </div>
                  </div>

                  {/* Caption & Metadata Footer */}
                  <div className="p-3.5 bg-[#171615] border-t border-white/[0.06] flex flex-col justify-between flex-1">
                    <p className="text-xs font-editorial italic text-[#FAF8F5] line-clamp-2 leading-relaxed">
                      "{moment.caption}"
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-[#A8A298]">
                      <span>{new Date(moment.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart size={11} weight="fill" />
                        {moment.likes_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen Photo Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[95dvh] flex flex-col sm:flex-row rounded-3xl overflow-hidden bg-[#181716] border border-white/15 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Large Image */}
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[500px]">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-contain max-h-[75vh]"
                />
              </div>

              {/* Sidebar Details */}
              <div className="w-full sm:w-80 p-5 sm:p-6 flex flex-col justify-between bg-[#1A1918] border-t sm:border-t-0 sm:border-l border-white/10 shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#C85A32] font-semibold">
                      {selectedPhoto.tag} Keepsake
                    </span>
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10"
                    >
                      <X size={18} weight="bold" />
                    </button>
                  </div>

                  <p className="font-editorial italic text-sm text-[#FAF8F5] leading-relaxed">
                    "{selectedPhoto.caption}"
                  </p>

                  {selectedPhoto.prompt && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-[#A8A298] uppercase">Generation Prompt</span>
                      <p className="text-[11px] font-mono text-[#DCD6CD] line-clamp-3">
                        {selectedPhoto.prompt}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-[#A8A298] space-y-1">
                    <div className="flex justify-between">
                      <span>Companion</span>
                      <span className="text-white font-medium">{persona.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Captured On</span>
                      <span className="text-white">{new Date(selectedPhoto.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resolution</span>
                      <span className="text-white">Ultra-HD LoRA</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex gap-2">
                  <a
                    href={selectedPhoto.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <DownloadSimple size={16} weight="bold" />
                    Download
                  </a>
                  <button
                    onClick={(e) => handleToggleFavorite(selectedPhoto.id, e)}
                    className={`px-4 py-2.5 rounded-xl flex items-center justify-center transition-all ${
                      selectedPhoto.is_favorite
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    <Heart size={18} weight={selectedPhoto.is_favorite ? 'fill' : 'bold'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
