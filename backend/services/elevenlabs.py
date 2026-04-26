"""ElevenLabs — TTS with cloned voice, Multilingual v2."""
import asyncio
import io
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


def _resolve_voice(language: str, voice_id: str | None) -> str:
    """Pick the best voice: explicit > per-language default > global fallback."""
    if voice_id:
        return voice_id
    lang_code = language.split("-")[0]
    per_lang = os.getenv(f"ELEVENLABS_VOICE_ID_{lang_code.upper()}", "")
    if per_lang:
        return per_lang
    fallback = os.getenv("ELEVENLABS_VOICE_ID", "")
    if fallback:
        return fallback
    raise RuntimeError(f"No voice configured for language {language}")


async def synthesize_speech(
    text: str, language: str = "zh-CN", voice_id: str | None = None
) -> bytes:
    resolved_voice = _resolve_voice(language, voice_id)
    lang_code = language.split("-")[0]
    return await asyncio.to_thread(_synthesize_blocking, text, resolved_voice, lang_code)


def _clone_voice_blocking(name: str, audio_bytes: bytes) -> str:
    client = _get_client()
    response = client.voices.ivc.create(
        name=name,
        files=[io.BytesIO(audio_bytes)],
        description=f"Cloned voice for {name}",
    )
    return response.voice_id


async def clone_voice(user_name: str, audio_bytes: bytes) -> str:
    """Clone a user's voice using ElevenLabs Instant Voice Clone API."""
    return await asyncio.to_thread(_clone_voice_blocking, user_name, audio_bytes)
