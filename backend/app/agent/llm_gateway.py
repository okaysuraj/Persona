"""
Unified LLM Gateway for Persona AI.
Supports Groq (Llama 3.3 70B), OpenAI, Anthropic, and local companion simulation fallback.
"""
import re
import json
import logging
import httpx
from typing import Tuple, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMGateway:
    """Multi-provider LLM gateway with graceful offline simulation fallback."""

    @classmethod
    async def generate_response(
        cls,
        system_prompt: str,
        user_message: str,
        history: list = None
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Calls available LLM provider (Groq -> OpenAI -> Anthropic).
        Returns (inner_thought, response_text).
        If no provider is available or an error occurs, returns (None, None).
        """
        # 1. Try Groq (Fastest TTFT, optimal for conversational companions)
        if settings.GROQ_API_KEY:
            try:
                return await cls._call_openai_compatible(
                    base_url="https://api.groq.com/openai/v1/chat/completions",
                    api_key=settings.GROQ_API_KEY,
                    model="llama-3.3-70b-versatile",
                    system_prompt=system_prompt,
                    user_message=user_message,
                    history=history
                )
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Falling back to next provider...")

        # 2. Try OpenAI
        if settings.OPENAI_API_KEY:
            try:
                return await cls._call_openai_compatible(
                    base_url="https://api.openai.com/v1/chat/completions",
                    api_key=settings.OPENAI_API_KEY,
                    model=settings.DEFAULT_LLM_MODEL or "gpt-4o-mini",
                    system_prompt=system_prompt,
                    user_message=user_message,
                    history=history
                )
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}. Falling back...")

        # 3. Try Anthropic
        if settings.ANTHROPIC_API_KEY:
            try:
                return await cls._call_anthropic(
                    api_key=settings.ANTHROPIC_API_KEY,
                    system_prompt=system_prompt,
                    user_message=user_message,
                    history=history
                )
            except Exception as e:
                logger.warning(f"Anthropic API call failed: {e}.")

        return None, None

    @classmethod
    async def _call_openai_compatible(
        cls,
        base_url: str,
        api_key: str,
        model: str,
        system_prompt: str,
        user_message: str,
        history: list = None
    ) -> Tuple[str, str]:
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            for h in history[-8:]:
                role = "assistant" if h.get("sender_type") == "assistant" else "user"
                messages.append({"role": role, "content": h.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.85,
            "max_tokens": 600,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"].strip()
            return cls._parse_thought_and_reply(raw_text)

    @classmethod
    async def _call_anthropic(
        cls,
        api_key: str,
        system_prompt: str,
        user_message: str,
        history: list = None
    ) -> Tuple[str, str]:
        messages = []
        if history:
            for h in history[-8:]:
                role = "assistant" if h.get("sender_type") == "assistant" else "user"
                messages.append({"role": role, "content": h.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": "claude-3-5-haiku-20241022",
            "system": system_prompt,
            "messages": messages,
            "max_tokens": 600,
            "temperature": 0.85
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            raw_text = data["content"][0]["text"].strip()
            return cls._parse_thought_and_reply(raw_text)

    @classmethod
    def _parse_thought_and_reply(cls, text: str) -> Tuple[str, str]:
        """Extracts <inner_thought>...</inner_thought> from model output."""
        thought_match = re.search(r"<inner_thought>(.*?)</inner_thought>", text, flags=re.DOTALL)
        if thought_match:
            thought = thought_match.group(1).strip()
            reply = re.sub(r"<inner_thought>.*?</inner_thought>", "", text, flags=re.DOTALL).strip()
            return thought, reply
        return "Attentively reflecting on our conversation.", text
