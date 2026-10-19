import React, { useState, useEffect, useCallback } from 'react';
import type { CompanionStory } from '../../types';
import { api } from '../../services/api';
import {
  Sparkle,
  Heart,
  ChatCircleText,
  X,
  Clock,
} from '@phosphor-icons/react';

interface StoriesFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplyToStory: (personaId: string, replyText: string) => void;
}

export const StoriesFeedModal: React.FC<StoriesFeedModalProps> = ({
  isOpen,
  onClose,
  onReplyToStory,
}) => {
  const [stories, setStories] = useState<CompanionStory[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const loadStories = useCallback(async () => {
    const list = await api.getStories();
    setStories(list);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api.getStories().then((list) => {
      if (active) {
        setStories(list);
      }
    });
    return () => { active = false; };
  }, [isOpen]);

  const handleLike = async (storyId: string) => {
    await api.likeStory(storyId);
    await loadStories();
  };

  const handleSendReply = (story: CompanionStory) => {
    const text = replyInput[story.id]?.trim();
    if (!text) return;
    onReplyToStory(story.persona_id, `Replying to your story ("${story.content.slice(0, 40)}..."): ${text}`);
    setReplyInput((prev) => ({ ...prev, [story.id]: '' }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#121211]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#1A1918]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32]/15 border border-[#C85A32]/30 flex items-center justify-center text-[#C85A32] shadow-[0_0_20px_rgba(200,90,50,0.25)]">
              <Sparkle size={22} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5]">
                Companion Stories & Status
              </h3>
              <p className="text-xs text-[#A8A298]">
                Spontaneous daily reflections, journal entries, and life moments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Stories Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {stories.map((story) => (
            <div
              key={story.id}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-all space-y-4"
            >
              {/* Author & Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={story.avatar_url}
                    alt={story.persona_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#C85A32]/40"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-[#FAF8F5]">
                      {story.persona_name}
                    </h4>
                    <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1">
                      <Clock size={12} />
                      {story.time_ago}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleLike(story.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    story.has_liked
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-white/5 text-[#A8A298] hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Heart size={14} weight={story.has_liked ? 'fill' : 'bold'} />
                  <span>{story.likes}</span>
                </button>
              </div>

              {/* Story Content */}
              <p className="font-editorial text-sm sm:text-base text-[#E5E0D8] leading-relaxed">
                "{story.content}"
              </p>

              {/* Optional Photo Attachment */}
              {story.image_url && (
                <div className="relative aspect-video sm:aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                  <img
                    src={story.image_url}
                    alt="Story visual"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Reply Section */}
              <div className="flex gap-2 pt-2 border-t border-white/[0.05]">
                <input
                  type="text"
                  placeholder={`Reply to ${story.persona_name}...`}
                  value={replyInput[story.id] || ''}
                  onChange={(e) =>
                    setReplyInput((prev) => ({ ...prev, [story.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply(story);
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C85A32]"
                />
                <button
                  onClick={() => handleSendReply(story)}
                  disabled={!replyInput[story.id]?.trim()}
                  className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#D9653B] text-white text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                >
                  <ChatCircleText size={15} weight="bold" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
