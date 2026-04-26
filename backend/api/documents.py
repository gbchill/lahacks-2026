"""Document endpoints — photo → OCR → translation → audio explanation."""
import asyncio
import json
import logging
import time
import uuid

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from models.schemas import ExplainResponse, KeyFacts, PipelineTiming
from services.cloudinary_admin import enhance_for_ocr, upload_audio, upload_photo
from services.elevenlabs import synthesize_speech
from services.gemini import (
    embed_text,
    explain_in_plain_english,
    extract_text_from_image,
    translate_text,
)
from services.gemma import detect_pii
from services.mongo import find_similar, save_document, update_document_field

import agents.bridge as bridge
from agents.messages import OrchestrateRequest

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/explain", response_model=ExplainResponse)
async def explain_document(
    photo: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
    target_language: str = Form(default="zh-CN"),
    voice_id: str = Form(default=""),
    authorization: str = Header(default=""),
) -> ExplainResponse:
    """Photo of a document → structured explanation + audio URL in target language."""
    # Override user_id from JWT if present
    from services.supabase_admin import get_optional_user
    jwt_user = get_optional_user(authorization)
    if jwt_user:
        user_id = jwt_user

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

        # 3. OCR + context fetch in parallel
        current_step = "ocr+context"
        t0 = time.perf_counter()
        ocr_result, past_docs = await asyncio.gather(
            extract_text_from_image(enhanced_photo_url),
            find_similar(user_id),
        )
        timing["ocr"] = round((time.perf_counter() - t0) * 1000, 1)
        raw_text = ocr_result.get("raw_text", "")
        document_type = ocr_result.get("document_type_guess", "other")
        family_history = "; ".join(
            f"{d.get('document_type', 'unknown')} from {d.get('created_at', '?')}"
            for d in past_docs[:3]
        )

        # 3b+4. PII detection + explanation in parallel
        current_step = "pii+explanation"
        t0 = time.perf_counter()
        pii_result, explain_result = await asyncio.gather(
            detect_pii(raw_text),
            explain_in_plain_english(raw_text, document_type, family_history),
        )
        timing["explanation"] = round((time.perf_counter() - t0) * 1000, 1)
        redacted_text = pii_result.get("redacted_text", raw_text)
        if pii_result.get("has_pii"):
            logger.info(
                "PII detected: types=%s doc_id=%s",
                pii_result.get("pii_types"),
                doc_id,
            )
        english_explanation = explain_result.get("explanation", "")
        key_facts_raw = explain_result.get("key_facts", {})

        # 5. Translate to target language
        current_step = "translation"
        t0 = time.perf_counter()
        if target_language.startswith("en"):
            translated_text = english_explanation
        else:
            translated_text = await translate_text(english_explanation, document_type, target_language)
        timing["translation"] = round((time.perf_counter() - t0) * 1000, 1)

        # 6. TTS + embedding in parallel
        current_step = "tts+embedding"
        t0 = time.perf_counter()
        audio_bytes, embedding = await asyncio.gather(
            synthesize_speech(translated_text, target_language, voice_id=voice_id or None),
            embed_text(english_explanation + " " + translated_text),
        )
        timing["tts"] = round((time.perf_counter() - t0) * 1000, 1)

        # 7. Audio upload + MongoDB save in parallel
        current_step = "upload+save"
        t0 = time.perf_counter()
        audio_url, _ = await asyncio.gather(
            upload_audio(audio_bytes, user_id, doc_id),
            save_document(
                user_id,
                {
                    "document_id": doc_id,
                    "document_type": document_type,
                    "raw_text": redacted_text,
                    "english_explanation": english_explanation,
                    "translated_explanation": translated_text,
                    "target_language": target_language,
                    "audio_url": "",
                    "original_photo_url": original_photo_url,
                    "enhanced_photo_url": enhanced_photo_url,
                    "key_facts": key_facts_raw,
                },
                embedding=embedding if embedding else None,
            ),
        )
        timing["audio_upload"] = round((time.perf_counter() - t0) * 1000, 1)

        await update_document_field(doc_id, "audio_url", audio_url)

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


@router.post("/explain-via-agents", response_model=ExplainResponse)
async def explain_document_via_agents(
    photo: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
    target_language: str = Form(default="zh-CN"),
    voice_id: str = Form(default=""),
    authorization: str = Header(default=""),
) -> ExplainResponse:
    """Agent-powered pipeline: photo → Parser → Context → Drafter → Translator → audio."""
    # Override user_id from JWT if present
    from services.supabase_admin import get_optional_user
    jwt_user = get_optional_user(authorization)
    if jwt_user:
        user_id = jwt_user

    pipeline_start = time.perf_counter()
    timing: dict[str, float] = {}
    doc_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())

    try:
        photo_bytes = await photo.read()

        # 1. Cloudinary upload + enhance (before agents — pass URL only)
        t0 = time.perf_counter()
        upload_result = await upload_photo(photo_bytes, user_id)
        timing["cloudinary_upload"] = round((time.perf_counter() - t0) * 1000, 1)
        public_id = upload_result["public_id"]
        original_photo_url = upload_result["secure_url"]
        enhanced_photo_url = enhance_for_ocr(public_id)

        # 2. Enqueue for orchestrator agent
        loop = asyncio.get_running_loop()
        fut: asyncio.Future = loop.create_future()
        bridge.pending_futures[correlation_id] = fut

        req = OrchestrateRequest(
            correlation_id=correlation_id,
            image_url=enhanced_photo_url,
            user_id=user_id,
            doc_id=doc_id,
            target_language=target_language,
        )
        await bridge.request_queue.put((correlation_id, req))

        # 3. Wait for agent chain to complete
        try:
            result = await asyncio.wait_for(fut, timeout=120.0)
        except asyncio.TimeoutError:
            bridge.pending_futures.pop(correlation_id, None)
            raise HTTPException(status_code=504, detail="Agent pipeline timed out")

        timing["agent_pipeline"] = round((time.perf_counter() - pipeline_start) * 1000, 1)

        # 4. TTS on translated text
        t0 = time.perf_counter()
        audio_bytes = await synthesize_speech(
            result.translated_explanation, target_language, voice_id=voice_id or None
        )
        timing["tts"] = round((time.perf_counter() - t0) * 1000, 1)

        # 5. Audio upload + MongoDB save in parallel
        t0 = time.perf_counter()
        key_facts_raw = json.loads(result.key_facts_json) if result.key_facts_json else {}
        audio_url, _ = await asyncio.gather(
            upload_audio(audio_bytes, user_id, doc_id),
            save_document(
                user_id,
                {
                    "document_id": doc_id,
                    "document_type": result.document_type,
                    "english_explanation": result.english_explanation,
                    "translated_explanation": result.translated_explanation,
                    "target_language": target_language,
                    "audio_url": "",
                    "original_photo_url": original_photo_url,
                    "enhanced_photo_url": enhanced_photo_url,
                    "key_facts": key_facts_raw,
                },
                embedding=result.embedding if result.embedding else None,
            ),
        )
        timing["audio_upload"] = round((time.perf_counter() - t0) * 1000, 1)

        await update_document_field(doc_id, "audio_url", audio_url)

        timing["total"] = round((time.perf_counter() - pipeline_start) * 1000, 1)

        logger.info(
            "Agent pipeline complete: doc_id=%s type=%s total_ms=%.1f",
            doc_id,
            result.document_type,
            timing["total"],
        )

        return ExplainResponse(
            document_id=doc_id,
            document_type=result.document_type,
            english_explanation=result.english_explanation,
            translated_explanation=result.translated_explanation,
            target_language=target_language,
            audio_url=audio_url,
            original_photo_url=original_photo_url,
            enhanced_photo_url=enhanced_photo_url,
            key_facts=KeyFacts(
                deadline=key_facts_raw.get("deadline"),
                amount_due=key_facts_raw.get("amount_due"),
                action_required=key_facts_raw.get("action_required"),
            ),
            similar_past_documents=result.similar_doc_ids or [],
            pipeline_timing_ms=PipelineTiming(**timing),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Agent pipeline failed doc_id=%s", doc_id)
        raise HTTPException(
            status_code=500,
            detail={"error": str(exc), "document_id": doc_id},
        )
