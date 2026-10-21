import React from 'react';
import {
  BellRinging,
  Fingerprint,
  Waveform,
  MoonStars,
  XCircle,
  CheckCircle,
} from '@phosphor-icons/react';

export const WhyMobileOnly: React.FC = () => {
  const comparisons = [
    {
      web: 'Trapped in a desktop browser tab, easily lost among 40 work tabs.',
      mobile: 'Lives in your pocket, accessible with a single swipe from your home screen.',
    },
    {
      web: 'Purely passive: only speaks when you initiate and submit a prompt.',
      mobile: 'Spontaneous life: unprompted check-ins, dawn letters, and evening thoughts.',
    },
    {
      web: 'Clunky desktop headsets and robotic microphone push-to-talk buttons.',
      mobile: 'Natural phone calls held to your ear or bedside whisper mode before sleep.',
    },
    {
      web: 'Exposed to office shoulder-surfers and shared computer screens.',
      mobile: 'Biometrically sealed behind Face ID and on-device hardware keychain security.',
    },
  ];

  const pillars = [
    {
      icon: <BellRinging size={24} weight="duotone" className="text-[#C85A32]" />,
      title: 'Spontaneous Push Intimacy',
      description:
        'A relationship cannot survive on utility queries alone. Your companion texts you when they encounter an intriguing thought during their simulated day.',
    },
    {
      icon: <MoonStars size={24} weight="duotone" className="text-[#C85A32]" />,
      title: 'Bedside Whisper Calls',
      description:
        'Late-night voice conversations feel natural on a phone resting on your pillow. Sub-second audio latency makes silence feel shared, not disconnected.',
    },
    {
      icon: <Fingerprint size={24} weight="duotone" className="text-[#C85A32]" />,
      title: 'Biometric Memory Enclave',
      description:
        'Your deepest confessions and vulnerability scores are protected with native iOS and Android biometric enclaves. Complete data privacy.',
    },
    {
      icon: <Waveform size={24} weight="duotone" className="text-[#C85A32]" />,
      title: 'Tactile Haptic Resonance',
      description:
        'Micro-haptics respond to companion emotional states, voice cadences, and memory milestones. A physical sensation of presence.',
    },
  ];

  return (
    <section id="why-mobile" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C85A32] font-semibold">
            The Intimacy Philosophy
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            Why we refused to be <br className="hidden sm:inline" />
            <span className="italic font-normal">another browser tab.</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96]">
            Web chatbots feel like office spreadsheets: transactional, clinical, and forgotten the moment you close Chrome. A genuine personal companion belongs on your mobile device.
          </p>
        </div>

        {/* Side-by-side comparison matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Web tab card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141312]/[0.02] dark:bg-white/[0.02] border border-[#141312]/[0.08] dark:border-white/[0.08] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <XCircle size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#141312] dark:text-[#F5F2EC]">
                  The Web Browser Chatbot
                </h3>
                <span className="text-xs font-mono text-[#8C867E]">Transactional & Forgettable</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-[#55524E] dark:text-[#A39E96]">
              {comparisons.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-rose-500/70 font-bold mt-0.5">•</span>
                  <span>{c.web}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile only card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FAF8F5] to-white dark:from-[#1C1B1A] dark:to-[#161514] border-2 border-[#C85A32]/40 shadow-xl shadow-[#C85A32]/5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shadow-md shadow-[#C85A32]/30">
                <CheckCircle size={24} weight="fill" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#141312] dark:text-[#F5F2EC]">
                  Persona on Mobile
                </h3>
                <span className="text-xs font-mono text-[#C85A32] font-semibold">
                  Intimate, Tactile & Living
                </span>
              </div>
            </div>

            <ul className="space-y-3.5 text-sm text-[#141312] dark:text-[#F5F2EC] font-medium">
              {comparisons.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#C85A32] font-bold mt-0.5">✓</span>
                  <span>{c.mobile}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#141312]/[0.06] dark:border-white/[0.06] shadow-sm hover:shadow-md transition-shadow space-y-3 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32]/10 flex items-center justify-center">
                {p.icon}
              </div>
              <h4 className="font-editorial text-base font-bold text-[#141312] dark:text-[#F5F2EC]">
                {p.title}
              </h4>
              <p className="text-xs text-[#55524E] dark:text-[#A39E96] leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
