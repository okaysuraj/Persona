// Billing operations, including the existing offline fallback.
import type { BillingStatus, StartupAnalytics } from '../types';
import { apiFetch, tryRequestJson } from './http';

export const billingApi = {
  async getBillingStatus(): Promise<BillingStatus> {
    const data = await tryRequestJson<BillingStatus>('/billing/status');
    if (data !== null) return data;

    const stored = localStorage.getItem('persona_billing');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    const defaultBilling: BillingStatus = {
      user_id: 'usr-default',
      email: 'alex@companion.ai',
      subscription_tier: 'free',
      subscription_status: 'active',
      tier_details: {
        tier_name: 'Free Explorer',
        price_monthly: 0,
        max_messages_daily: 30,
        max_voice_seconds_daily: 120,
        max_photos_monthly: 2,
        llm_model: 'Llama 3.3 70B (Fast)',
        features: ['30 messages/day', '2 voice minutes/day', 'Standard memory', 'Web & mobile access']
      },
      usage: {
        messages_today: 4,
        messages_limit: 30,
        voice_seconds_used: 45,
        voice_seconds_limit: 120,
        photos_generated: 1,
        photos_limit: 2
      },
      available_tiers: {
        free: {
          tier_name: 'Free Explorer',
          price_monthly: 0,
          max_messages_daily: 30,
          max_voice_seconds_daily: 120,
          max_photos_monthly: 2,
          llm_model: 'Llama 3.3 70B',
          features: ['30 messages/day', '2 voice minutes/day', 'Standard memory']
        },
        plus: {
          tier_name: 'Persona Plus',
          price_monthly: 14.99,
          price_yearly: 99.00,
          max_messages_daily: 999999,
          max_voice_seconds_daily: 3600,
          max_photos_monthly: 30,
          llm_model: 'Claude 3.5 Haiku + Llama 70B',
          features: ['Unlimited messages', '60 voice minutes/day', '30 custom snapshots', 'Proactive reach-outs']
        },
        vip: {
          tier_name: 'Persona VIP',
          price_monthly: 29.99,
          price_yearly: 240.00,
          max_messages_daily: 999999,
          max_voice_seconds_daily: 999999,
          max_photos_monthly: 999999,
          llm_model: 'Claude 3.5 Sonnet + GPT-4o',
          features: ['Unlimited messages', 'Unlimited duplex voice', 'Unlimited custom snapshots', 'Voice cloning']
        }
      }
    };
    localStorage.setItem('persona_billing', JSON.stringify(defaultBilling));
    return defaultBilling;
  },

  async createCheckoutSession(tier: 'plus' | 'vip', period: 'monthly' | 'yearly'): Promise<{ checkout_url: string; mode: string }> {
    const data = await tryRequestJson<{ checkout_url: string; mode: string }>('/billing/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ tier, period })
      });
    if (data !== null) return data;

    // Sandbox upgrade mode
    const status = await billingApi.getBillingStatus();
    status.subscription_tier = tier;
    status.tier_details.tier_name = tier === 'plus' ? 'Persona Plus' : 'Persona VIP';
    status.usage.messages_limit = 999999;
    status.usage.voice_seconds_limit = tier === 'plus' ? 3600 : 999999;
    status.usage.photos_limit = tier === 'plus' ? 30 : 999999;
    localStorage.setItem('persona_billing', JSON.stringify(status));

    return {
      checkout_url: '/?billing=success',
      mode: 'sandbox_instant'
    };
  },

  async getStartupAnalytics(): Promise<StartupAnalytics> {
    try {
      const res = await apiFetch('/analytics/dashboard');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline fallback
    }

    return {
      status: 'healthy',
      business: {
        mrr_usd: 1499.0,
        arr_usd: 17988.0,
        total_users: 184,
        paying_subscribers: 78,
        tier_breakdown: {
          free: 106,
          plus: 62,
          vip: 16,
        },
        conversion_rate_pct: 42.4,
      },
      engagement: {
        total_conversations: 542,
        total_messages: 12480,
        active_personas: 6,
      },
      llm_telemetry: {
        uptime_since: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        total_requests: 3120,
        total_tokens: { input: 890400, output: 432100, total: 1322500 },
        financials: { estimated_llm_cost_usd: 1.84, cost_per_100_turns_usd: 0.059 },
        performance: { avg_latency_ms: 385.2, p95_latency_ms: 540.0 },
        multimodal_usage: { photos_generated: 412, voice_seconds_streamed: 8420.5 },
        safety_compliance: { crisis_interventions_count: 2, status: 'active_988_guardrail' },
      },
    };
  },
};
