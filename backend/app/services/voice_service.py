"""
Voice Audio Synthesis Service.
Generates spoken audio for companion voice notes and ambient duplex voice rooms.
Supports ElevenLabs, Cartesia Sonic, affective paralinguistic tag processing,
and ambient room co-presence soundscapes.
"""
import re
import random
import logging
import httpx
from typing import Dict, Any, Optional, Tuple, List
from app.core.config import settings

logger = logging.getLogger(__name__)

# Default character voice mapping
CHARACTER_VOICES = {
    "Aria": {"eleven_id": "21m00Tcm4TlvDq8ikWAM", "cartesia_id": "a0e99841-438c-4a64-b679-ae501e7d6091", "tone": "warm_whisper"},
    "Kai": {"eleven_id": "AZnzlk1XvdvUeBnXmlld", "cartesia_id": "69267136-1bdc-412f-ad78-0caad210fb40", "tone": "playful_baritone"},
    "Elena": {"eleven_id": "EXAVITQu4vr4xnSDxMaL", "cartesia_id": "79a125e8-cd45-4c13-8a67-188112f4dd22", "tone": "calm_alto"},
    "Maya": {"eleven_id": "21m00Tcm4TlvDq8ikWAM", "cartesia_id": "a0e99841-438c-4a64-b679-ae501e7d6091", "tone": "contemplative_warmth"},
    "Soren": {"eleven_id": "AZnzlk1XvdvUeBnXmlld", "cartesia_id": "69267136-1bdc-412f-ad78-0caad210fb40", "tone": "measured_baritone"},
}

ROOM_FOLEY_SOUNDS = [
    {"type": "distant_rain", "url": "https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3", "label": "Soft rain outside window"},
    {"type": "hearth_warmth", "url": "https://assets.mixkit.co/active_storage/sfx/2473/2473-preview.mp3", "label": "Subtle fireplace ember crackle"},
    {"type": "ocean_bluff", "url": "https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3", "label": "Rolling night surf"},
]


class VoiceService:
    """Service to handle text-to-speech generation, affective paralinguistics, and audio streaming."""

    @classmethod
    def parse_paralinguistics(cls, raw_text: str) -> Tuple[str, List[str], Dict[str, Any]]:
        """
        Extracts vocal paralinguistic cues (e.g. [whisper], [soft_laugh], [sigh])
        returning (clean_speech_text, tags, prosody_meta).
        """
        tags = re.findall(r"\[([a-zA-Z_\s]+)\]", raw_text)
        clean_text = re.sub(r"\[[a-zA-Z_\s]+\]", "", raw_text).strip()

        prosody = {
            "is_whisper": any("whisper" in t.lower() for t in tags),
            "is_laughing": any("laugh" in t.lower() or "giggle" in t.lower() for t in tags),
            "has_sigh": any("sigh" in t.lower() for t in tags),
            "pacing": 0.88 if any("whisper" in t.lower() for t in tags) else 1.0,
            "pitch_shift": -0.05 if any("whisper" in t.lower() for t in tags) else 0.0
        }
        return clean_text, tags, prosody

    @classmethod
    async def synthesize_speech(
        cls,
        text: str,
        persona_name: str = "Aria",
        voice_id: Optional[str] = None,
        mood_state: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes speech audio from text with affective paralinguistics and ambient foley.
        """
        clean_text, tags, prosody = cls.parse_paralinguistics(text)
        voice_info = CHARACTER_VOICES.get(persona_name, CHARACTER_VOICES["Aria"])
        eleven_voice = voice_id or voice_info["eleven_id"]

        # Mood-adjusted prosody
        mood = mood_state or {}
        vulnerability = mood.get("vulnerability", 0.3)
        if vulnerability > 0.65:
            prosody["is_whisper"] = True
            prosody["pacing"] = 0.85

        # Ambient room foley selection
        ambient_foley = random.choice(ROOM_FOLEY_SOUNDS)

        # 1. ElevenLabs API if available
        if settings.ELEVENLABS_API_KEY:
            try:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{eleven_voice}"
                headers = {
                    "xi-api-key": settings.ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                }
                stability = 0.65 if prosody["is_whisper"] else 0.5
                payload = {
                    "text": clean_text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {
                        "stability": stability,
                        "similarity_boost": 0.8,
                        "style": 0.3 if prosody["is_laughing"] else 0.1,
                        "use_speaker_boost": True
                    }
                }
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        import base64
                        audio_b64 = base64.b64encode(resp.content).decode("utf-8")
                        return {
                            "status": "success",
                            "audio_url": f"data:audio/mpeg;base64,{audio_b64}",
                            "duration_est": max(2, len(clean_text.split()) // 3),
                            "format": "mp3",
                            "clean_text": clean_text,
                            "paralinguistics": tags,
                            "prosody": prosody,
                            "ambient_foley": ambient_foley
                        }
            except Exception as e:
                logger.warning(f"ElevenLabs TTS failed: {e}. Falling back to browser synthesis.")

        # 2. Browser-ready synthesized speech metadata
        words = len(clean_text.split())
        duration = max(3, round(words / 2.5, 1))
        random.seed(len(clean_text))
        waveform = [round(random.uniform(0.2, 0.95), 2) for _ in range(24)]

        return {
            "status": "simulated",
            "text": clean_text,
            "raw_text": text,
            "persona_name": persona_name,
            "tone": voice_info["tone"],
            "duration_est": duration,
            "waveform": waveform,
            "format": "web_speech",
            "audio_url": None,
            "paralinguistics": tags,
            "prosody": prosody,
            "ambient_foley": ambient_foley
        }
