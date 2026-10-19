"""
Enterprise AI Observability & Telemetry Module for Persona AI.
Integrates Langfuse LLM tracing, real-time token unit economics tracking,
TTFT (Time-to-First-Token) latency monitoring, and Safety Incident logging.
"""
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)

# Attempt to import Langfuse
try:
    from langfuse import Langfuse
    _LANGFUSE_AVAILABLE = True
except ImportError:
    Langfuse = None
    _LANGFUSE_AVAILABLE = False


class TelemetryCollector:
    """
    In-memory operational telemetry collector for startup unit economics,
    LLM latency percentiles, safety triggers, and multimodal asset usage.
    """

    def __init__(self):
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.total_requests = 0
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.estimated_cost_usd = 0.0
        self.safety_interventions = 0
        self.photos_generated = 0
        self.voice_seconds = 0.0
        self.latencies_ms: List[float] = []
        self._max_recent_latencies = 100

        # Model pricing rates per 1,000,000 tokens (approx as of 2026)
        # Groq Llama 3.3 70B: $0.59 / $0.79
        # OpenAI gpt-4o-mini: $0.15 / $0.60
        self._cost_rates = {
            "llama-3.3-70b-versatile": {"input": 0.00000059, "output": 0.00000079},
            "gpt-4o-mini": {"input": 0.00000015, "output": 0.00000060},
            "claude-3-5-haiku-20241022": {"input": 0.00000080, "output": 0.00000400},
            "default": {"input": 0.00000050, "output": 0.00000150},
        }

    def record_llm_execution(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: float,
        user_id: Optional[str] = None
    ):
        """Records token consumption, latency, and estimated cloud API costs."""
        self.total_requests += 1
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens

        rates = self._cost_rates.get(model, self._cost_rates["default"])
        cost = (input_tokens * rates["input"]) + (output_tokens * rates["output"])
        self.estimated_cost_usd += cost

        self.latencies_ms.append(latency_ms)
        if len(self.latencies_ms) > self._max_recent_latencies:
            self.latencies_ms.pop(0)

    def record_safety_alert(self, user_id: str, trigger_type: str = "crisis_self_harm"):
        """Records triggered guardrail incident for safety reporting."""
        self.safety_interventions += 1
        logger.warning(f"[SAFETY_INCIDENT] User {user_id} triggered {trigger_type} guardrail.")

    def record_multimodal(self, media_type: str, units: float = 1.0):
        if media_type == "selfie":
            self.photos_generated += int(units)
        elif media_type == "voice_note":
            self.voice_seconds += units

    def get_summary(self) -> Dict[str, Any]:
        """Returns comprehensive telemetry for founder analytics & dashboards."""
        avg_latency = (
            sum(self.latencies_ms) / len(self.latencies_ms)
            if self.latencies_ms else 0.0
        )
        sorted_latencies = sorted(self.latencies_ms)
        p95_latency = (
            sorted_latencies[int(len(sorted_latencies) * 0.95)]
            if sorted_latencies else 0.0
        )

        return {
            "uptime_since": self.started_at,
            "total_requests": self.total_requests,
            "total_tokens": {
                "input": self.total_input_tokens,
                "output": self.total_output_tokens,
                "total": self.total_input_tokens + self.total_output_tokens,
            },
            "financials": {
                "estimated_llm_cost_usd": round(self.estimated_cost_usd, 4),
                "cost_per_100_turns_usd": round((self.estimated_cost_usd / max(self.total_requests, 1)) * 100, 4),
            },
            "performance": {
                "avg_latency_ms": round(avg_latency, 2),
                "p95_latency_ms": round(p95_latency, 2),
            },
            "multimodal_usage": {
                "photos_generated": self.photos_generated,
                "voice_seconds_streamed": round(self.voice_seconds, 1),
            },
            "safety_compliance": {
                "crisis_interventions_count": self.safety_interventions,
                "status": "active_988_guardrail",
            }
        }


class ObservabilityService:
    """Langfuse wrapper with local fallback collector."""

    def __init__(self):
        self.telemetry = TelemetryCollector()
        self.langfuse_client = None

        if _LANGFUSE_AVAILABLE and settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
            try:
                self.langfuse_client = Langfuse(
                    public_key=settings.LANGFUSE_PUBLIC_KEY,
                    secret_key=settings.LANGFUSE_SECRET_KEY,
                    host=settings.LANGFUSE_HOST,
                )
                logger.info("Langfuse LLM Observability initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Langfuse client: {e}. Falling back to local telemetry.")
        else:
            logger.info("Operating with local high-performance telemetry collector (Langfuse keys not configured).")

    def trace_generation(
        self,
        name: str,
        model: str,
        input_messages: list,
        output_text: str,
        latency_ms: float,
        user_id: Optional[str] = None,
        persona_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Traces prompt, completion, latency, and tokens to Langfuse and local telemetry."""
        # Estimate token lengths (1 token ~= 4 chars rule-of-thumb if exact counts unavailable)
        input_chars = sum(len(str(m.get("content", ""))) for m in input_messages)
        output_chars = len(output_text or "")
        est_in_tokens = max(int(input_chars / 4), 1)
        est_out_tokens = max(int(output_chars / 4), 1)

        # Record locally
        self.telemetry.record_llm_execution(
            model=model,
            input_tokens=est_in_tokens,
            output_tokens=est_out_tokens,
            latency_ms=latency_ms,
            user_id=user_id,
        )

        # Log to Langfuse if configured
        if self.langfuse_client:
            try:
                trace = self.langfuse_client.trace(
                    name=name,
                    user_id=user_id,
                    metadata={
                        "persona_id": persona_id,
                        **(metadata or {})
                    }
                )
                trace.generation(
                    name=name,
                    model=model,
                    input=input_messages,
                    output=output_text,
                    usage={
                        "input": est_in_tokens,
                        "output": est_out_tokens,
                        "total": est_in_tokens + est_out_tokens
                    }
                )
            except Exception as e:
                logger.debug(f"Langfuse trace emission skipped: {e}")


observability = ObservabilityService()
