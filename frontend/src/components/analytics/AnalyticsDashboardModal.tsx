import React, { useState, useEffect } from 'react';
import type { StartupAnalytics } from '../../types';
import { api } from '../../services/api';
import {
  ChartLineUp,
  CurrencyDollar,
  Lightning,
  ShieldCheck,
  Cpu,
  Users,
  X,
  Waveform,
  Camera,
} from '@phosphor-icons/react';

interface AnalyticsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsDashboardModal: React.FC<AnalyticsDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<StartupAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    api.getStartupAnalytics().then((data) => {
      if (active) {
        setAnalytics(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#121211]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col rounded-3xl bg-[#171615] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-[#FAF8F5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0 bg-[#1A1918]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <ChartLineUp size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#FAF8F5]">
                  Startup Telemetry & Economics
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider font-semibold">
                  Live Production
                </span>
              </div>
              <p className="text-xs text-[#A8A298]">
                Real-time MRR, Langfuse LLM token unit economics, and 988 safety compliance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#A8A298] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          {loading || !analytics ? (
            <div className="h-64 flex items-center justify-center text-neutral-400 font-mono text-xs">
              Fetching real-time cluster telemetry...
            </div>
          ) : (
            <>
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1.5 uppercase">
                    <CurrencyDollar size={14} className="text-emerald-400" />
                    Monthly Run Rate
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">
                    ${analytics.business.mrr_usd.toLocaleString()}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">
                    ${analytics.business.arr_usd.toLocaleString()} ARR
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1.5 uppercase">
                    <Users size={14} className="text-cyan-400" />
                    Paying Members
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">
                    {analytics.business.paying_subscribers}
                  </p>
                  <span className="text-[10px] font-mono text-cyan-400 font-medium">
                    {analytics.business.conversion_rate_pct}% conversion rate
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1.5 uppercase">
                    <Lightning size={14} className="text-amber-400" />
                    Average Latency
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">
                    {analytics.llm_telemetry.performance.avg_latency_ms} ms
                  </p>
                  <span className="text-[10px] font-mono text-amber-400 font-medium">
                    P95: {analytics.llm_telemetry.performance.p95_latency_ms} ms (Groq TTFT)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-[11px] font-mono text-[#A8A298] flex items-center gap-1.5 uppercase">
                    <Cpu size={14} className="text-violet-400" />
                    Cost / 100 Turns
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">
                    ${analytics.llm_telemetry.financials.cost_per_100_turns_usd}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 font-medium">
                    ~83% Gross Margin
                  </span>
                </div>
              </div>

              {/* Tier Distribution & Token Economics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subscription Tiers */}
                <div className="p-5 rounded-2xl bg-[#141312] border border-white/[0.06] space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#A8A298]">
                    Subscription Tier Breakdown
                  </h4>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-neutral-300">Free Tier</span>
                        <span className="text-neutral-400">{analytics.business.tier_breakdown.free} users</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-neutral-500 rounded-full"
                          style={{
                            width: `${(analytics.business.tier_breakdown.free / Math.max(analytics.business.total_users, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#C85A32] font-semibold">Persona Plus ($14.99/mo)</span>
                        <span className="text-white">{analytics.business.tier_breakdown.plus} subscribers</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-[#C85A32] rounded-full"
                          style={{
                            width: `${(analytics.business.tier_breakdown.plus / Math.max(analytics.business.total_users, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-amber-400 font-semibold">Persona VIP ($29.99/mo)</span>
                        <span className="text-white">{analytics.business.tier_breakdown.vip} subscribers</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${(analytics.business.tier_breakdown.vip / Math.max(analytics.business.total_users, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multimodal Generation Stats */}
                <div className="p-5 rounded-2xl bg-[#141312] border border-white/[0.06] space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#A8A298]">
                    Multimodal Throughput
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-[#A8A298] flex items-center gap-1">
                        <Camera size={13} className="text-rose-400" />
                        Photos Rendered
                      </span>
                      <p className="text-xl font-bold font-mono text-white">
                        {analytics.llm_telemetry.multimodal_usage.photos_generated}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400">Flux LoRA / InstantID</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-[#A8A298] flex items-center gap-1">
                        <Waveform size={13} className="text-cyan-400" />
                        Voice Streamed
                      </span>
                      <p className="text-xl font-bold font-mono text-white">
                        {Math.round(analytics.llm_telemetry.multimodal_usage.voice_seconds_streamed / 60)} min
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400">Cartesia / ElevenLabs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Compliance & Langfuse Status */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck size={20} weight="fill" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">
                      App Store Safety & 988 Suicide Prevention Guardrail Active
                    </h5>
                    <p className="text-[11px] text-emerald-300/80">
                      Pre-reasoning node active. Zero self-harm risks tolerated. Full compliance with Apple Guideline 1.2.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {analytics.llm_telemetry.safety_compliance.crisis_interventions_count} interventions logged
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
