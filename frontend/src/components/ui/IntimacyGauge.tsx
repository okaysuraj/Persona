import React from 'react';
import type { Relationship } from '../../types';
import { Heart, Sparkle } from '@phosphor-icons/react';

interface IntimacyGaugeProps {
  relationship: Relationship;
  compact?: boolean;
}

export const IntimacyGauge: React.FC<IntimacyGaugeProps> = ({
  relationship,
  compact = false,
}) => {
  const { intimacy_level = 20, stage, mood_state } = relationship;

  // Normalize stage (handles 'acquaintance', 'close_friend', etc.)
  const normalizedStage = stage
    ? stage
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Friend';

  const stageBadgeColors: Record<string, string> = {
    Acquaintance: 'bg-[#EEF2F6] text-[#2C4C6F] dark:bg-[#1E293B] dark:text-[#93C5FD]',
    Friend: 'bg-[#EDF3EC] text-[#346538] dark:bg-[#1C2E20] dark:text-[#86EFAC]',
    'Close Friend': 'bg-[#FBF3DB] text-[#956400] dark:bg-[#332A15] dark:text-[#FDE047]',
    Confidant: 'bg-[#FDEBEC] text-[#9F2F2D] dark:bg-[#381B1C] dark:text-[#FCA5A5]',
    'Romantic Companion': 'bg-[#FCF4F0] text-[#C85A32] dark:bg-[#381F17] dark:text-[#FDBA74]',
    Romantic: 'bg-[#FCF4F0] text-[#C85A32] dark:bg-[#381F17] dark:text-[#FDBA74]',
  };

  const badgeColor =
    stageBadgeColors[normalizedStage] ||
    stageBadgeColors['Friend'];

  const joyVal = Math.round(Number(mood_state?.joy ?? 0.8) * 100);
  const empathyVal = Math.round(Number(mood_state?.empathy ?? 0.85) * 100);
  const affectionRaw = mood_state?.affection ?? (mood_state as any)?.flirt ?? 0.65;
  const affectionVal = Math.round(Number(affectionRaw) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-semibold ${badgeColor}`}
        >
          {normalizedStage}
        </span>
        <div className="w-14 sm:w-16 h-1.5 bg-[#E7E3DC] dark:bg-[#2A2826] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C85A32] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, intimacy_level))}%` }}
          />
        </div>
        <span className="text-[#78746E] dark:text-[#A39E96]">
          {intimacy_level}%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-full bg-[#C85A32]/10 text-[#C85A32]">
            <Heart size={14} weight="fill" />
          </span>
          <span className="text-xs uppercase tracking-widest text-[#78746E] dark:text-[#A39E96] font-mono">
            Bond Depth
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider font-medium ${badgeColor}`}
        >
          {normalizedStage}
        </span>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1.5 text-xs font-mono">
          <span className="text-[#141312] dark:text-[#F5F2EC] font-semibold text-sm">
            Level {intimacy_level}
          </span>
          <span className="text-[#78746E] dark:text-[#A39E96]">
            {intimacy_level} / 100 XP
          </span>
        </div>
        <div className="w-full h-2 bg-[#F0ECE5] dark:bg-[#252321] rounded-full overflow-hidden p-0.5 border border-[#141312]/[0.05] dark:border-white/[0.05]">
          <div
            className="h-full bg-[#C85A32] rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(200,90,50,0.3)]"
            style={{ width: `${Math.min(100, Math.max(4, intimacy_level))}%` }}
          />
        </div>
      </div>

      {mood_state && (
        <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDF3EC] text-[#346538] dark:bg-[#1A261D] dark:text-[#86EFAC]">
            <Sparkle size={10} weight="fill" /> Joy {joyVal}%
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FBF3DB] text-[#956400] dark:bg-[#2B2313] dark:text-[#FDE047]">
            Empathy {empathyVal}%
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FDEBEC] text-[#9F2F2D] dark:bg-[#2C1819] dark:text-[#FCA5A5]">
            Affection {affectionVal}%
          </span>
        </div>
      )}
    </div>
  );
};
