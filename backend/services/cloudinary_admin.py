"""Cloudinary server-side — photo upload, OCR enhancement, audio storage."""
import asyncio
import io
import logging
import os

import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryImage

logger = logging.getLogger(__name__)

_configured = False


def _configure() -> None:
    global _configured
    if _configured:
        return
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    if not all([cloud_name, api_key, api_secret]):
        raise RuntimeError(
            "Missing Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
        )
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    _configured = True
    logger.info("Cloudinary configured for cloud=%s", cloud_name)


def _upload_photo_sync(photo_bytes: bytes, user_id: str) -> dict[str, str]:
    _configure()
    upload_preset = os.getenv("CLOUDINARY_UPLOAD_PRESET")
    kwargs: dict = {
        "folder": f"orision/{user_id}/photos",
        "resource_type": "image",
    }
    if upload_preset:
        kwargs["upload_preset"] = upload_preset
    result = cloudinary.uploader.upload(photo_bytes, **kwargs)
    public_id = result["public_id"]
    secure_url = result["secure_url"]
    logger.info(
        "Cloudinary photo uploaded: public_id=%s url=%s", public_id, secure_url
    )
    return {"public_id": public_id, "secure_url": secure_url}


async def upload_photo(photo_bytes: bytes, user_id: str) -> dict[str, str]:
    return await asyncio.to_thread(_upload_photo_sync, photo_bytes, user_id)


def enhance_for_ocr(public_id: str) -> str:
    _configure()
    transformations = [
        {"effect": "improve"},
        {"effect": "sharpen:100"},
        {"angle": "auto_right"},
        {"effect": "grayscale"},
        {"quality": "auto:best"},
        {"fetch_format": "auto"},
    ]
    url = CloudinaryImage(public_id).build_url(transformation=transformations)
    logger.info(
        "Cloudinary OCR enhancement applied: transforms=[e_improve, e_sharpen:100, a_auto_right, e_grayscale, q_auto:best, f_auto] url=%s",
        url,
    )
    return url


def _upload_audio_sync(audio_bytes: bytes, user_id: str, doc_id: str) -> str:
    _configure()
    result = cloudinary.uploader.upload(
        io.BytesIO(audio_bytes),
        folder=f"orision/{user_id}/audio",
        public_id=f"explanation_{doc_id}",
        resource_type="video",
        format="mp3",
    )
    secure_url = result["secure_url"]
    logger.info("Cloudinary audio uploaded: doc_id=%s url=%s", doc_id, secure_url)
    return secure_url


async def upload_audio(audio_bytes: bytes, user_id: str, doc_id: str) -> str:
    return await asyncio.to_thread(_upload_audio_sync, audio_bytes, user_id, doc_id)


def redact_pii_preview(public_id: str) -> str:
    _configure()
    try:
        url = CloudinaryImage(public_id).build_url(
            transformation=[
                {"effect": "gen_remove", "prompt": "social security number"},
                {"effect": "improve"},
                {"quality": "auto:best"},
            ]
        )
        logger.info("Cloudinary PII redaction URL built: %s", url)
        return url
    except Exception as exc:
        logger.warning(
            "Cloudinary PII redaction not available (may require paid plan), falling back to enhanced URL: %s",
            exc,
        )
        return enhance_for_ocr(public_id)
