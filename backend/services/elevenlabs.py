"""ElevenLabs — TTS with cloned voice, Multilingual v2."""
import asyncio
import logging
import os

from elevenlabs.client import ElevenLabs
from elevenlabs.types import VoiceSettings

logger = logging.getLogger(__name__)

_client: ElevenLabs | None = None


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not set")
        _client = ElevenLabs(api_key=api_key)
    return _client


def _synthesize_blocking(text: str, voice_id: str, lang_code: str) -> bytes:
    client = _get_client()
    chunks = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",
        language_code=lang_code,
        voice_settings=VoiceSettings(stability=0.5, similarity_boost=0.75),
        output_format="mp3_44100_128",
    )
    audio = b"".join(chunks)
    logger.info("ElevenLabs TTS complete: lang=%s size=%d bytes", lang_code, len(audio))
    return audio


async def synthesize_speech(text: str, language: str = "zh-CN") -> bytes:
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")
    if not voice_id:
        raise RuntimeError("ELEVENLABS_VOICE_ID not set")
    lang_code = language.split("-")[0]
    return await asyncio.to_thread(_synthesize_blocking, text, voice_id, lang_code)
