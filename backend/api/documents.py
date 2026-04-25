"""Document endpoints — photo → OCR → translation → audio explanation."""
import logging
import time
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import ExplainResponse, KeyFacts, PipelineTiming
from services.cloudinary_admin import enhance_for_ocr, upload_audio, upload_photo
from services.elevenlabs import synthesize_speech
from services.gemini import (
    embed_text,
    explain_in_plain_english,
    extract_text_from_image,
    translate_to_mandarin,
)
from services.mongo import find_similar, save_document

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/explain", response_model=ExplainResponse)
async def explain_document(
    photo: UploadFile = File(...),
    user_id: str = Form(default="demo-user-1"),
    target_language: str = Form(default="zh-CN"),
) -> ExplainResponse:
    """Photo of a document → structured explanation + audio URL in target language."""
    current_step = "init"
    timing: dict[str, float] = {}
    doc_id = str(uuid.uuid4())
    pipeline_start = time.perf_counter()

    try:
        photo_bytes = await photo.read()

        # 1. Upload to Cloudinary
        current_step = "cloudinary_upload"
        t0 = time.perf_counter()
        upload_result = await upload_photo(photo_bytes, user_id)
        timing["cloudinary_upload"] = round((time.perf_counter() - t0) * 1000, 1)
        public_id = upload_result["public_id"]
        original_photo_url = upload_result["secure_url"]

        # 2. Build enhanced OCR URL
        enhanced_photo_url = enhance_for_ocr(public_id)

        # 3. OCR via Gemini Vision
        current_step = "ocr"
        t0 = time.perf_counter()
        ocr_result = await extract_text_from_image(enhanced_photo_url)
        timing["ocr"] = round((time.perf_counter() - t0) * 1000, 1)
        raw_text = ocr_result.get("raw_text", "")
        document_type = ocr_result.get("document_type_guess", "other")

        # 4. Fetch recent docs for family context
        current_step = "context"
        past_docs = await find_similar(user_id)
        family_history = "; ".join(
            f"{d.get('document_type', 'unknown')} from {d.get('created_at', '?')}"
            for d in past_docs[:3]
        )

        # 5. Plain-English explanation
        current_step = "explanation"
        t0 = time.perf_counter()
        explain_result = await explain_in_plain_english(
            raw_text, document_type, family_history
        )
        timing["explanation"] = round((time.perf_counter() - t0) * 1000, 1)
        english_explanation = explain_result.get("explanation", "")
        key_facts_raw = explain_result.get("key_facts", {})

        # 6. Translate to target language
        current_step = "translation"
        t0 = time.perf_counter()
        translated_text = await translate_to_mandarin(english_explanation, document_type)
        timing["translation"] = round((time.perf_counter() - t0) * 1000, 1)

        # 7. TTS via ElevenLabs
        current_step = "tts"
        t0 = time.perf_counter()
        audio_bytes = await synthesize_speech(translated_text, target_language)
        timing["tts"] = round((time.perf_counter() - t0) * 1000, 1)

        # 8. Upload audio to Cloudinary
        current_step = "audio_upload"
        t0 = time.perf_counter()
        audio_url = await upload_audio(audio_bytes, user_id, doc_id)
        timing["audio_upload"] = round((time.perf_counter() - t0) * 1000, 1)

        # 9. Embed for future vector search
        current_step = "embedding"
        embedding = await embed_text(english_explanation + " " + translated_text)

        # 10. Save to MongoDB
        current_step = "mongo_save"
        await save_document(
            user_id,
            {
                "document_id": doc_id,
                "document_type": document_type,
                "raw_text": raw_text,
                "english_explanation": english_explanation,
                "translated_explanation": translated_text,
                "target_language": target_language,
                "audio_url": audio_url,
                "original_photo_url": original_photo_url,
                "enhanced_photo_url": enhanced_photo_url,
                "key_facts": key_facts_raw,
            },
            embedding=embedding if embedding else None,
        )

        timing["total"] = round((time.perf_counter() - pipeline_start) * 1000, 1)

        logger.info(
            "Pipeline complete: doc_id=%s type=%s total_ms=%.1f",
            doc_id,
            document_type,
            timing["total"],
        )

        return ExplainResponse(
            document_id=doc_id,
            document_type=document_type,
            english_explanation=english_explanation,
            translated_explanation=translated_text,
            target_language=target_language,
            audio_url=audio_url,
            original_photo_url=original_photo_url,
            enhanced_photo_url=enhanced_photo_url,
            key_facts=KeyFacts(
                deadline=key_facts_raw.get("deadline"),
                amount_due=key_facts_raw.get("amount_due"),
                action_required=key_facts_raw.get("action_required"),
            ),
            similar_past_documents=[
                d.get("document_id", "") for d in past_docs if d.get("document_id")
            ],
            pipeline_timing_ms=PipelineTiming(**timing),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Pipeline failed at step=%s doc_id=%s", current_step, doc_id
        )
        raise HTTPException(
            status_code=500,
            detail={"step": current_step, "error": str(exc), "document_id": doc_id},
        )
