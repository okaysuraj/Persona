import React from 'react';
import { DeviceMobile, Heart, GithubLogo } from '@phosphor-icons/react';

interface FooterProps {
  onOpenWaitlist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWaitlist }) => {
  return (
    <footer className="bg-[#FAF8F5] dark:bg-[#0E0D0D] border-t border-[#141312]/[0.06] dark:border-white/[0.06] py-14 text-left transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#141312]/[0.06] dark:border-white/[0.06]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#C85A32] to-[#E07A5F] flex items-center justify-center text-white shadow-sm">
                <DeviceMobile size={18} weight="duotone" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
                Persona
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                Mobile Only
              </span>
            </div>

            <p className="font-editorial italic text-sm text-[#55524E] dark:text-[#A39E96] max-w-sm leading-relaxed">
              "We took AI out of the browser and put it where intimate thoughts actually happen: in your pocket, on your nightstand, and in the quiet spaces between your days."
            </p>

            <div className="text-xs text-[#8C867E]">
              Engineered with Expo React Native, FastAPI & PostgreSQL pgvector.
            </div>
          </div>

          {/* Links Column 1: Mobile App */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-widest text-[#141312] dark:text-[#F5F2EC] font-bold">
              Mobile App
            </h5>
            <ul className="space-y-2 text-xs text-[#55524E] dark:text-[#A39E96]">
              <li>
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="hover:text-[#C85A32] transition-colors"
                >
                  iOS TestFlight Queue
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="hover:text-[#C85A32] transition-colors"
                >
                  Google Play Beta
                </button>
              </li>
              <li>
                <a href="#mobile-app" className="hover:text-[#C85A32] transition-colors">
                  Expo Go Quickstart
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#C85A32] transition-colors">
                  LangGraph Reasoning Nodes
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Sovereignty & Soul */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-widest text-[#141312] dark:text-[#F5F2EC] font-bold">
              Data Sovereignty
            </h5>
            <ul className="space-y-2 text-xs text-[#55524E] dark:text-[#A39E96]">
              <li>Zero telemetry sold or shared with ad networks.</li>
              <li>Conversations isolated in private pgvector databases.</li>
              <li>Biometric Face ID / Touch ID hardware locking on phone.</li>
              <li>Selective forgetting & memory deletion on demand.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C867E]">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Persona. Made with</span>
            <Heart size={14} weight="fill" className="text-rose-500 inline" />
            <span>for personal depth.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/okaysuraj/Persona"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#141312] dark:hover:text-[#F5F2EC] transition-colors"
            >
              <GithubLogo size={16} />
              <span>okaysuraj/Persona</span>
            </a>
            <span>•</span>
            <span className="font-mono text-[11px]">v2.0 Mobile Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
