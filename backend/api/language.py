"""Language detection from audio via Gemini."""
import logging

from fastapi import APIRouter, File, UploadFile

from services.gemini import detect_language_from_audio

logger = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_CODES = {"en", "zh-CN", "es", "vi", "ro"}


@router.post("/detect")
async def detect_language(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    mime_type = audio.content_type or "audio/webm"
    result = await detect_language_from_audio(audio_bytes, mime_type)

    code = result.get("language_code", "en")
    if code not in SUPPORTED_CODES:
        code = "en"

    return {
        "language_code": code,
        "language_name": result.get("language_name", "English"),
        "confidence": result.get("confidence", 0),
    }
