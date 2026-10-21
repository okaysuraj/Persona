import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  AppleLogo,
  AndroidLogo,
  Sparkle,
} from '@phosphor-icons/react';
import { Button } from '../ui/Button';

interface MobileAppPreviewProps {
  onOpenWaitlist: () => void;
}

export const MobileAppPreview: React.FC<MobileAppPreviewProps> = ({ onOpenWaitlist }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'expo' | 'ios' | 'android'>('expo');

  const codeSnippets = {
    expo: `# In your terminal:
cd mobile
npm ci --legacy-peer-deps
npm start

# Scan the printed QR code with Expo Go on your phone!`,
    ios: `# Run in iOS Simulator:
cd mobile
npm ci --legacy-peer-deps
npm run ios`,
    android: `# Run in Android Emulator:
cd mobile
npm ci --legacy-peer-deps
npm run android`,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <section id="mobile-app" className="py-20 bg-[#F4F1EC]/70 dark:bg-[#161514]/70 border-t border-[#141312]/[0.05] dark:border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C85A32] font-semibold">
            Native Mobile Client
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            Run it on your phone <br className="hidden sm:inline" />
            <span className="italic font-normal">in under two minutes.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96]">
            Persona is engineered with Expo SDK & React Native for native 120Hz performance on iOS and Android. Scan with your camera or launch in terminal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Expo QR Code Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1C1B1A] border-2 border-[#C85A32]/30 shadow-xl shadow-[#C85A32]/10 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-mono font-semibold">
                <QrCode size={16} />
                <span>EXPO GO PREVIEW</span>
              </div>

              {/* Realistic SVG QR Code pattern */}
              <div className="p-4 rounded-2xl bg-white dark:bg-black border border-[#141312]/[0.08] dark:border-white/[0.1] shadow-inner inline-block">
                <svg
                  viewBox="0 0 160 160"
                  className="w-48 h-48 text-[#141312] dark:text-[#F5F2EC]"
                  fill="currentColor"
                >
                  {/* Outer corner positioning squares */}
                  <rect x="10" y="10" width="40" height="40" rx="4" fill="currentColor" />
                  <rect x="16" y="16" width="28" height="28" rx="2" fill="white" className="dark:fill-[#121211]" />
                  <rect x="22" y="22" width="16" height="16" fill="#C85A32" />

                  <rect x="110" y="10" width="40" height="40" rx="4" fill="currentColor" />
                  <rect x="116" y="16" width="28" height="28" rx="2" fill="white" className="dark:fill-[#121211]" />
                  <rect x="122" y="22" width="16" height="16" fill="#C85A32" />

                  <rect x="10" y="110" width="40" height="40" rx="4" fill="currentColor" />
                  <rect x="16" y="116" width="28" height="28" rx="2" fill="white" className="dark:fill-[#121211]" />
                  <rect x="22" y="122" width="16" height="16" fill="#C85A32" />

                  {/* QR Data Matrix modules */}
                  <rect x="58" y="14" width="8" height="8" />
                  <rect x="74" y="14" width="8" height="8" />
                  <rect x="90" y="14" width="8" height="8" />
                  <rect x="58" y="30" width="8" height="8" />
                  <rect x="74" y="38" width="8" height="8" fill="#C85A32" />
                  <rect x="90" y="30" width="8" height="8" />

                  <rect x="14" y="58" width="8" height="8" />
                  <rect x="30" y="58" width="8" height="8" />
                  <rect x="46" y="58" width="8" height="8" />
                  <rect x="62" y="58" width="8" height="8" />
                  <rect x="78" y="58" width="8" height="8" />
                  <rect x="94" y="58" width="8" height="8" fill="#C85A32" />
                  <rect x="110" y="58" width="8" height="8" />
                  <rect x="126" y="58" width="8" height="8" />
                  <rect x="142" y="58" width="8" height="8" />

                  <rect x="22" y="74" width="8" height="8" />
                  <rect x="38" y="74" width="8" height="8" />
                  <rect x="54" y="74" width="8" height="8" />
                  <rect x="70" y="74" width="8" height="8" />
                  <rect x="86" y="74" width="8" height="8" />
                  <rect x="102" y="74" width="8" height="8" />
                  <rect x="118" y="74" width="8" height="8" />
                  <rect x="134" y="74" width="8" height="8" />

                  <rect x="14" y="90" width="8" height="8" />
                  <rect x="30" y="90" width="8" height="8" />
                  <rect x="62" y="90" width="8" height="8" fill="#C85A32" />
                  <rect x="78" y="90" width="8" height="8" />
                  <rect x="94" y="90" width="8" height="8" />
                  <rect x="126" y="90" width="8" height="8" />
                  <rect x="142" y="90" width="8" height="8" />

                  <rect x="58" y="110" width="8" height="8" />
                  <rect x="74" y="110" width="8" height="8" />
                  <rect x="90" y="118" width="8" height="8" />
                  <rect x="106" y="110" width="8" height="8" />
                  <rect x="122" y="110" width="8" height="8" />
                  <rect x="138" y="110" width="8" height="8" fill="#C85A32" />

                  <rect x="58" y="134" width="8" height="8" />
                  <rect x="74" y="126" width="8" height="8" />
                  <rect x="90" y="134" width="8" height="8" />
                  <rect x="106" y="126" width="8" height="8" fill="#C85A32" />
                  <rect x="122" y="134" width="8" height="8" />
                  <rect x="138" y="134" width="8" height="8" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#141312] dark:text-[#F5F2EC]">
                  Scan with the Camera App or Expo Go
                </p>
                <p className="text-[11px] text-[#55524E] dark:text-[#A39E96]">
                  Instant preview on physical iPhone & Android devices
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onOpenWaitlist}
                  leadingIcon={<Sparkle size={14} weight="fill" />}
                  className="w-full"
                >
                  Join TestFlight Early Access
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Developer Terminal & Instructions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141312] dark:text-[#F5F2EC]">
                Developer Local Quickstart
              </h3>
              <p className="text-sm text-[#55524E] dark:text-[#A39E96]">
                Everything you need to run the companion mobile client locally against the FastAPI backend.
              </p>
            </div>

            {/* Terminal Card */}
            <div className="rounded-2xl overflow-hidden bg-[#141312] dark:bg-[#0D0C0B] border border-white/10 shadow-xl">
              {/* Tab selector */}
              <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCodeTab('expo')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      activeCodeTab === 'expo'
                        ? 'bg-[#C85A32] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Expo Go
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('ios')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      activeCodeTab === 'ios'
                        ? 'bg-[#C85A32] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    iOS Simulator
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('android')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      activeCodeTab === 'android'
                        ? 'bg-[#C85A32] text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Android
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(codeSnippets[activeCodeTab], activeCodeTab)}
                  className="flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  {copiedTab === activeCodeTab ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code */}
              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>

            {/* App Store / Google Play links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E1D1C] border border-[#141312]/[0.08] dark:border-white/[0.08] hover:border-[#C85A32]/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                  <AppleLogo size={22} weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C867E] block">
                    Download on
                  </span>
                  <span className="text-sm font-bold text-[#141312] dark:text-[#F5F2EC] group-hover:text-[#C85A32] transition-colors">
                    Apple TestFlight (iOS)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenWaitlist}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1E1D1C] border border-[#141312]/[0.08] dark:border-white/[0.08] hover:border-[#C85A32]/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                  <AndroidLogo size={22} weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8C867E] block">
                    Available on
                  </span>
                  <span className="text-sm font-bold text-[#141312] dark:text-[#F5F2EC] group-hover:text-[#C85A32] transition-colors">
                    Google Play Early Access
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
