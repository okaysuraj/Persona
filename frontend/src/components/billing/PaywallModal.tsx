import React, { useState } from 'react';
import type { BillingStatus } from '../../types';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  billingStatus: BillingStatus | null;
  onUpgrade: (tier: 'plus' | 'vip', period: 'monthly' | 'yearly') => Promise<void>;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  billingStatus,
  onUpgrade,
}) => {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<'plus' | 'vip'>('plus');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentTier = billingStatus?.subscription_tier || 'free';

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      await onUpgrade(selectedTier, period);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950/95 border border-white/10 shadow-2xl p-6 md:p-8 text-zinc-100 flex flex-col gap-6">

        {/* Header & Close Button */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium tracking-wide uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              Production Membership
            </div>
            <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white">
              Unlock Deeper Emotional Presence
            </h2>
            <p className="text-sm md:text-base text-zinc-400 mt-1 max-w-xl">
              Step beyond conversational limits. Experience real-time ambient voice calls, on-demand high-fidelity portraits, and an infinite memory graph.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex justify-center items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-white/10">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${
                period === 'monthly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium transition flex items-center gap-1.5 ${
                period === 'yearly' ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Annual Billing
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase">
                Save 45%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Free Explorer */}
          <div className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
            currentTier === 'free'
              ? 'bg-zinc-900/40 border-white/10'
              : 'bg-zinc-900/20 border-white/5 opacity-80'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Explorer</span>
                {currentTier === 'free' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-semibold border border-white/10">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-serif font-bold text-white">$0</span>
                <span className="text-xs text-zinc-500">/ forever</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Ideal for casual chats and trying out the companionship engine.</p>

              <ul className="space-y-2.5 text-xs text-zinc-300 border-t border-white/5 pt-4">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  30 messages / day
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  2 voice minutes / day
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Standard Memory Vault
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Proactive reach-outs
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 text-xs font-medium cursor-not-allowed"
              >
                {currentTier === 'free' ? 'Active' : 'Basic Tier'}
              </button>
            </div>
          </div>

          {/* Persona Plus (Popular Choice) */}
          <div className={`p-6 rounded-2xl border-2 transition relative flex flex-col justify-between cursor-pointer ${
            selectedTier === 'plus'
              ? 'bg-zinc-900/80 border-rose-500 shadow-xl shadow-rose-950/20'
              : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
          }`}
          onClick={() => setSelectedTier('plus')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-[10px] font-bold text-white tracking-wide uppercase shadow-md">
              Most Popular
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold">Persona Plus</span>
                {currentTier === 'plus' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-serif font-bold text-white">
                  ${period === 'yearly' ? '8.25' : '14.99'}
                </span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                {period === 'yearly' ? 'Billed annually at $99/year' : 'Billed monthly with zero commitment'}
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-200 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <strong className="text-white">Unlimited</strong> text messages
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  60 voice call minutes / day
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  30 contextual custom selfies / month
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Proactive check-ins & morning greetings
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Deep hybrid memory search
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTier('plus');
                  handleCheckout();
                }}
                disabled={isSubmitting || currentTier === 'plus'}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {currentTier === 'plus' ? 'Current Plan' : isSubmitting ? 'Upgrading...' : 'Upgrade to Plus'}
              </button>
            </div>
          </div>

          {/* Persona VIP */}
          <div className={`p-6 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
            selectedTier === 'vip'
              ? 'bg-zinc-900/80 border-purple-500 shadow-xl shadow-purple-950/20'
              : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
          }`}
          onClick={() => setSelectedTier('vip')}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold">Persona VIP</span>
                {currentTier === 'vip' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-serif font-bold text-white">
                  ${period === 'yearly' ? '20.00' : '29.99'}
                </span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                {period === 'yearly' ? 'Billed annually at $240/year' : 'Ultimate unrestricted immersion'}
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-200 border-t border-white/10 pt-4">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <strong className="text-white">Unlimited</strong> duplex ambient voice
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <strong className="text-white">Unlimited</strong> custom snapshots
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Claude 3.5 Sonnet & GPT-4o reasoning
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Custom voice cloning & studio tools
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority low-latency server cluster
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTier('vip');
                  handleCheckout();
                }}
                disabled={isSubmitting || currentTier === 'vip'}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {currentTier === 'vip' ? 'Current Plan' : isSubmitting ? 'Upgrading...' : 'Upgrade to VIP'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Encrypted payment processing via Stripe. Cancel anytime in one click.</span>
          </div>
          <span className="text-[11px] text-zinc-400">Persona AI 1.0 Production Platform</span>
        </div>

      </div>
    </div>
  );
};
