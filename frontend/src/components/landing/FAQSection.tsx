import React, { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why did you make Persona mobile only?',
      a: 'A true confidant should not live inside a crowded desktop browser tab next to your spreadsheets and work email. Intimate companionship requires spontaneous push notifications when you are walking outside, bedside ambient voice calls before you fall asleep, tactile micro-haptics, and the biometric privacy of your personal phone.',
    },
    {
      q: 'How do I test or run the mobile app today?',
      a: 'The Persona mobile client is built on React Native & Expo SDK and is located right inside the repository in the /mobile directory. You can run it on your own phone in 60 seconds with Expo Go (run "cd mobile && npm start"), or submit your email above to join our iOS TestFlight and Android Play Store closed beta rings.',
    },
    {
      q: 'Is my memory vault and conversation history private?',
      a: 'Completely. Persona is architected for strict data sovereignty. All user facts and episodic memories are indexed inside your own private pgvector database. Your conversations are never used to train global AI models, and access on mobile is protected with biometric Face ID / Touch ID hardware security.',
    },
    {
      q: 'How does the autonomous life simulation work?',
      a: 'Companions are not dormant when you close your phone. A lightweight background worker calculates their circadian schedule—simulating when Maya is in her pottery studio, when Soren is reading architecture journals, or when Elena is experimenting with glazes. They may send you an unprompted letter or photo when an activity sparks a thought about you.',
    },
    {
      q: 'What LLMs and voice engines power Persona?',
      a: 'Persona uses a FastAPI backend with LangGraph multi-node reasoning and PostgreSQL pgvector. It supports Gemini, Claude 3.5 Sonnet, GPT-4o, and local Ollama models. Voice runs over ultra-low-latency streaming WebSockets (<350ms glass-to-glass response time). When offline, the client seamlessly falls back to rich built-in demo profiles.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-[#FAF8F5] dark:bg-[#121211]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C85A32] font-semibold">
            Questions & Clarity
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141312] dark:text-[#F5F2EC]">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#55524E] dark:text-[#A39E96]">
            Everything you need to know about our mobile-only architecture and companionship philosophy.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-[#181716] border border-[#141312]/[0.06] dark:border-white/[0.06] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-editorial font-bold text-base sm:text-lg text-[#141312] dark:text-[#F5F2EC] hover:text-[#C85A32] dark:hover:text-[#C85A32] transition-colors"
                >
                  <span>{faq.q}</span>
                  <CaretDown
                    size={18}
                    weight="bold"
                    className={`shrink-0 text-[#C85A32] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-[#55524E] dark:text-[#A39E96] font-sans leading-relaxed border-t border-[#141312]/[0.04] dark:border-white/[0.04] pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
