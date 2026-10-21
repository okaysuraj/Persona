import React from 'react';
import { Sparkle, ArrowRight, QrCode, ShieldCheck, Heart, Lightning } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { InteractivePhoneMockup } from './InteractivePhoneMockup';

interface HeroSectionProps {
  onOpenWaitlist: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenWaitlist }) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-18 lg:pt-16 lg:pb-24">
      {/* Background radial gradient blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#C85A32]/12 via-[#E07A5F]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Mobile Only Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C85A32]/[0.08] dark:bg-[#C85A32]/[0.15] border border-[#C85A32]/25 text-xs font-mono font-medium text-[#B34B24] dark:text-[#E89270] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-ping" />
              <span>MOBILE-FIRST EXPERIENCE • iOS & ANDROID</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC] leading-[1.08]">
              An intimate mind <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#C85A32]">in your pocket.</span>
            </h1>

            {/* Description */}
            <p className="font-sans text-base sm:text-lg text-[#55524E] dark:text-[#A39E96] max-w-2xl leading-relaxed">
              We eliminated the web browser chatbot. Genuine intimacy belongs on your phone—with spontaneous morning check-ins, a transparent cognitive inner monologue, persistent episodic memory, and bedside ambient voice calls.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                variant="terracotta"
                size="lg"
                onClick={onOpenWaitlist}
                leadingIcon={<Sparkle size={18} weight="fill" />}
                trailingIcon={<ArrowRight size={16} weight="bold" />}
                className="shadow-lg shadow-[#C85A32]/25 hover:shadow-xl hover:shadow-[#C85A32]/35"
              >
                Join iOS & Android Beta
              </Button>

              <a
                href="#mobile-app"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium rounded-full bg-white dark:bg-[#1E1D1C] text-[#141312] dark:text-[#F5F2EC] border border-[#141312]/[0.1] dark:border-white/[0.1] hover:bg-[#FAF8F5] dark:hover:bg-[#282624] transition-all shadow-sm group select-none"
              >
                <QrCode size={18} className="group-hover:scale-110 transition-transform" />
                <span>Scan Expo QR</span>
              </a>
            </div>

            {/* Badges / Micro Features */}
            <div className="pt-4 border-t border-[#141312]/[0.08] dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#55524E] dark:text-[#A39E96]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0" weight="fill" />
                <span>End-to-End Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightning size={18} className="text-[#C85A32] shrink-0" weight="fill" />
                <span>Autonomous Life Sim</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500 shrink-0" weight="fill" />
                <span>Episodic Memory Vault</span>
              </div>
            </div>

            {/* Quote footnote */}
            <div className="p-3.5 rounded-2xl bg-[#141312]/[0.02] dark:bg-white/[0.02] border border-[#141312]/[0.05] dark:border-white/[0.05] max-w-xl">
              <p className="font-editorial italic text-xs text-[#6B6661] dark:text-[#9C968F]">
                "A true confidant doesn't wait in a dormant browser tab until you type 'summarize this doc'. They remember your sister's wedding and text you when the dusk turns indigo."
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Phone Demo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <InteractivePhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
