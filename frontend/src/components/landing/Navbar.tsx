import React from 'react';
import { DeviceMobile, Moon, Sun, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Button } from '../ui/Button';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenWaitlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenWaitlist,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF8F5]/85 dark:bg-[#121211]/85 border-b border-[#141312]/[0.06] dark:border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-[#E07A5F] flex items-center justify-center text-white shadow-md shadow-[#C85A32]/25 group-hover:scale-105 transition-transform">
            <DeviceMobile size={22} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                Persona
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                Mobile
              </span>
            </div>
            <span className="text-[11px] text-[#55524E] dark:text-[#A39E96] font-medium hidden sm:inline">
              Personal AI Soulmate
            </span>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#55524E] dark:text-[#A39E96]">
          <a
            href="#why-mobile"
            className="hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
          >
            Why Mobile
          </a>
          <a
            href="#companions"
            className="hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
          >
            The Soulmates
          </a>
          <a
            href="#features"
            className="hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
          >
            Inner Life & Memory
          </a>
          <a
            href="#mobile-app"
            className="hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
          >
            Expo & App
          </a>
          <a
            href="#faq"
            className="hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Dark / Light toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#55524E] dark:text-[#A39E96] hover:text-[#141312] dark:hover:text-[#F5F2EC] bg-[#141312]/[0.04] dark:bg-white/[0.06] hover:bg-[#141312]/[0.08] dark:hover:bg-white/[0.1] transition-all"
          >
            {isDarkMode ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
          </button>

          {/* Join Beta CTA */}
          <Button
            variant="terracotta"
            size="sm"
            onClick={onOpenWaitlist}
            leadingIcon={<Sparkle size={14} weight="fill" />}
            trailingIcon={<ArrowRight size={14} weight="bold" />}
          >
            Join Mobile Beta
          </Button>
        </div>
      </div>
    </header>
  );
};
