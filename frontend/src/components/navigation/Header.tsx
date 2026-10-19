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
  Crown,
  Camera,
  Sparkle,
  ChartLineUp,
  EnvelopeSimple,
  MoonStars,
  Armchair,
  Brain,
  Clock,
  User as UserIcon,
  SignOut,
} from '@phosphor-icons/react';

interface HeaderProps {
  activePersona: Persona | null;
  currentUser?: { id: string; email: string; display_name: string } | null;
  onOpenVault: () => void;
  onOpenVoice: () => void;
  onOpenPaywall: () => void;
  onOpenMoments: () => void;
  onOpenStories: () => void;
  onOpenAnalytics: () => void;
  onOpenLetters?: () => void;
  onOpenTogether?: () => void;
  onOpenLounge?: () => void;
  onOpenLifeSim?: () => void;
  onOpenCBT?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSelectPersonas: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  factCount: number;
  subscriptionTier?: 'free' | 'plus' | 'vip';
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  currentUser,
  onOpenVault,
  onOpenVoice,
  onOpenPaywall,
  onOpenMoments,
  onOpenStories,
  onOpenAnalytics,
  onOpenLetters,
  onOpenTogether,
  onOpenLounge,
  onOpenLifeSim,
  onOpenCBT,
  onOpenAuth,
  onLogout,
  onSelectPersonas,
  isDarkMode,
  onToggleDarkMode,
  factCount,
  subscriptionTier = 'free',
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
                    alt={personaName(activePersona.name)}
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
                  Persona AI
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Membership Tier Upgrade Pill */}
          <button
            onClick={onOpenPaywall}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition active:scale-95 ${
              subscriptionTier === 'vip'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30'
                : subscriptionTier === 'plus'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-rose-500/10 to-amber-500/10 hover:from-rose-500/20 hover:to-amber-500/20 border border-rose-500/30 text-rose-300'
            }`}
            title="Subscription & Membership"
          >
            <Crown size={14} weight="fill" className={subscriptionTier === 'vip' ? 'text-purple-400' : 'text-amber-400'} />
            <span className="hidden sm:inline">
              {subscriptionTier === 'free' ? 'Upgrade' : `${subscriptionTier.toUpperCase()} Plan`}
            </span>
          </button>

          {/* Stories Feed Button */}
          <button
            onClick={onOpenStories}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white dark:bg-[#201E1C] hover:bg-[#F4F1EC] dark:hover:bg-[#2A2724] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.08] dark:border-white/[0.1] text-xs font-medium transition-all active:scale-[0.97]"
            title="Companion Daily Stories & Status"
          >
            <Sparkle size={14} weight="fill" className="text-amber-400" />
            <span className="hidden sm:inline">Stories</span>
          </button>

          {/* Multi-Companion Lounge Button */}
          {onOpenLounge && (
            <button
              onClick={onOpenLounge}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-medium transition-all active:scale-[0.97]"
              title="The Lounge: Multi-Companion Salon & Banter Parlor"
            >
              <Armchair size={14} weight="bold" />
              <span className="hidden sm:inline">Lounge</span>
            </button>
          )}

          {activePersona && (
            <>
              {/* Living Schedule & Autonomous State Button */}
              {onOpenLifeSim && (
                <button
                  onClick={onOpenLifeSim}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-all active:scale-[0.97]"
                  title="Living Schedule & Autonomous Sensory State"
                >
                  <Clock size={14} weight="bold" />
                  <span className="hidden sm:inline">Life</span>
                </button>
              )}

              {/* Socratic Evening CBT Debrief Button */}
              {onOpenCBT && (
                <button
                  onClick={onOpenCBT}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-medium transition-all active:scale-[0.97]"
                  title="Evening Socratic CBT Debrief & Cognitive Reframing"
                >
                  <Brain size={14} weight="bold" />
                  <span className="hidden sm:inline">Reflect</span>
                </button>
              )}

              {/* Together Mode / Sleep Chamber Button */}
              {onOpenTogether && (
                <button
                  onClick={onOpenTogether}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 text-xs font-medium transition-all active:scale-[0.97]"
                  title="Together Mode: 4-7-8 Breathwork, Ambient Soundscapes & Bedtime Stories"
                >
                  <MoonStars size={14} weight="fill" className="text-indigo-500 dark:text-indigo-400" />
                  <span className="hidden sm:inline">Together</span>
                </button>
              )}

              {/* Keepsake Letters Button */}
              {onOpenLetters && (
                <button
                  onClick={onOpenLetters}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-medium transition-all active:scale-[0.97]"
                  title="Letters to You: Wax-Sealed Keepsake Epistles"
                >
                  <EnvelopeSimple size={14} weight="bold" />
                  <span className="hidden sm:inline">Letters</span>
                </button>
              )}

              {/* Moments Photo Album Button */}
              <button
                onClick={onOpenMoments}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white dark:bg-[#201E1C] hover:bg-[#F4F1EC] dark:hover:bg-[#2A2724] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.08] dark:border-white/[0.1] text-xs font-medium transition-all active:scale-[0.97]"
                title="Visual Keepsakes & Moments Gallery"
              >
                <Camera size={14} weight="bold" className="text-[#C85A32]" />
                <span className="hidden sm:inline">Moments</span>
              </button>

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

          {/* Startup Telemetry Dashboard Button */}
          <button
            onClick={onOpenAnalytics}
            className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="Live Startup Telemetry & Unit Economics"
          >
            <ChartLineUp size={16} weight="bold" />
          </button>

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

          {/* User Account / Auth Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-[#141312]/[0.08] dark:border-white/[0.08]">
              <span className="hidden md:inline text-xs font-medium text-[#78746E] dark:text-[#A39E96]">
                {currentUser.display_name}
              </span>
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors"
                title={`Sign out (${currentUser.email})`}
                aria-label="Sign out"
              >
                <SignOut size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#141312]/[0.06] dark:bg-white/10 hover:bg-[#141312]/[0.1] dark:hover:bg-white/15 text-[#141312] dark:text-[#F5F2EC] text-xs font-semibold transition active:scale-[0.97]"
              title="Sign in or register"
            >
              <UserIcon size={14} weight="bold" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
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

function personaName(name: string) {
  return name || 'Companion';
}
