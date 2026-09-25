import React from 'react';
import type { Persona } from '../../types';
import { Button } from '../ui/Button';
import {
  Books,
  PhoneCall,
  Sun,
  Moon,
  UsersThree,
  CaretLeft,
} from '@phosphor-icons/react';

interface HeaderProps {
  activePersona: Persona | null;
  onOpenVault: () => void;
  onOpenVoice: () => void;
  onSelectPersonas: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  factCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  onOpenVault,
  onOpenVoice,
  onSelectPersonas,
  isDarkMode,
  onToggleDarkMode,
  factCount,
}) => {
  return (
    <header className="sticky top-2 sm:top-4 z-40 px-2 sm:px-4 mb-3 sm:mb-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/85 dark:bg-[#181716]/90 backdrop-blur-xl border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Brand / Companion Back */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {activePersona ? (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {/* Back to roster button on mobile & desktop */}
              <button
                onClick={onSelectPersonas}
                className="flex items-center gap-1 px-1.5 py-1 -ml-1 rounded-xl text-[#78746E] dark:text-[#A39E96] hover:text-[#141312] dark:hover:text-[#F5F2EC] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                title="Back to Companion Dossier"
                aria-label="Back to Companion Dossier"
              >
                <CaretLeft size={18} weight="bold" />
                <span className="hidden sm:inline text-xs font-mono font-medium">Roster</span>
              </button>

              <div className="flex items-center gap-2 pl-1 border-l border-[#141312]/[0.08] dark:border-white/[0.08] min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activePersona.avatar_url}
                    alt={activePersona.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-[#141312]/10 dark:ring-white/15"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#181716]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold tracking-tight text-[#141312] dark:text-[#F5F2EC] truncate max-w-[100px] sm:max-w-[150px]">
                    {activePersona.name}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onSelectPersonas}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#141312] dark:bg-[#F5F2EC] flex items-center justify-center text-white dark:text-[#141312] font-semibold text-xs tracking-tight shrink-0">
                P<span className="text-[#C85A32]">•</span>
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                  Persona
                </span>
                
                
              </div>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {activePersona && (
            <>
              {/* Voice Call Button */}
              <button
                onClick={onOpenVoice}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C85A32] hover:bg-[#B34B24] text-white text-xs font-medium shadow-sm transition-all active:scale-[0.97]"
                title="Open encrypted voice chamber"
              >
                <PhoneCall size={14} weight="fill" />
                <span className="hidden sm:inline">Voice Call</span>
                <span className="sm:hidden">Call</span>
              </button>

              {/* Memory Vault Button */}
              <button
                onClick={onOpenVault}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white dark:bg-[#201E1C] hover:bg-[#F4F1EC] dark:hover:bg-[#2A2724] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.08] dark:border-white/[0.1] text-xs font-medium transition-all active:scale-[0.97]"
                title="Inspect Memory Vault"
              >
                <Books size={14} weight="bold" className="text-[#C85A32]" />
                <span className="hidden sm:inline">Vault</span>
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-[#C85A32]/10 text-[#C85A32]">
                  {factCount}
                </span>
              </button>
            </>
          )}

          {!activePersona && (
            /* All Companions Switcher */
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectPersonas}
              leadingIcon={<UsersThree size={16} weight="bold" />}
              title="All Companions"
            >
              <span className="hidden sm:inline">All Companions</span>
            </Button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#55524D] dark:text-[#B5AFA6] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title={isDarkMode ? 'Switch to Warm Daylight' : 'Switch to Evening Candlelight'}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun size={15} weight="bold" /> : <Moon size={15} weight="bold" />}
          </button>
        </div>
      </div>
    </header>
  );
};
