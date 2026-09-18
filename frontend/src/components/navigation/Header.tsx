import React from 'react';
import type { Persona } from '../../types';
import { Button } from '../ui/Button';
import {
  Books,
  PhoneCall,
  Sun,
  Moon,
  UsersThree,
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
    <header className="sticky top-4 z-40 px-4 mb-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#181716]/85 backdrop-blur-xl border border-[#141312]/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectPersonas}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#141312] dark:bg-[#F5F2EC] flex items-center justify-center text-white dark:text-[#141312] font-semibold text-xs tracking-tight">
              P<span className="text-[#C85A32]">•</span>
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                Persona
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[11px] font-mono text-[#8C877F]">
                / companion
              </span>
            </div>
          </button>

          {activePersona && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#141312]/[0.08] dark:border-white/[0.08]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-[#4A4742] dark:text-[#C5BFB5]">
                {activePersona.name}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activePersona && (
            <>
              {/* Voice Call Button */}
              <Button
                variant="terracotta"
                size="sm"
                onClick={onOpenVoice}
                leadingIcon={<PhoneCall size={14} weight="fill" />}
                className="shadow-sm"
              >
                <span className="hidden sm:inline">Voice Call</span>
                <span className="sm:hidden">Call</span>
              </Button>

              {/* Memory Vault Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenVault}
                leadingIcon={<Books size={15} weight="bold" />}
                trailingIcon={
                  <span className="text-[10px] font-mono px-1 font-bold text-[#C85A32]">
                    {factCount}
                  </span>
                }
              >
                <span className="hidden sm:inline">Vault</span>
              </Button>
            </>
          )}

          {/* Roster / Switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectPersonas}
            leadingIcon={<UsersThree size={16} weight="bold" />}
            title="All Companions"
          >
            <span className="hidden md:inline">Roster</span>
          </Button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#55524D] dark:text-[#B5AFA6] hover:bg-[#141312]/[0.05] dark:hover:bg-white/[0.08] transition-colors"
            title={isDarkMode ? 'Switch to Warm Daylight' : 'Switch to Evening Candlelight'}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
          </button>
        </div>
      </div>
    </header>
  );
};
