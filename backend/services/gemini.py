"""Gemini 2.5 Flash Vision — OCR, explanation, translation, embeddings."""
import json
import logging
import os
import re

import httpx
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

MODEL = "gemini-2.5-flash"
EMBED_MODEL = "gemini-embedding-001"


def _parse_json(text: str) -> dict:
    # Strip markdown fences
    text = re.sub(r"^```(?:json)?\s*\n?", "", text.strip())
    text = re.sub(r"\n?```\s*$", "", text.strip())
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Strip trailing commas before } and ]
    cleaned = re.sub(r",\s*([}\]])", r"\1", text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.error("Gemini returned unparseable JSON: %s", text[:500])
        raise ValueError(f"Gemini JSON parse failed: {exc}") from exc


_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        gcp_project = os.getenv("GOOGLE_CLOUD_PROJECT")
        if gcp_project:
            # Vertex AI mode — uses Application Default Credentials
            _client = genai.Client(
                vertexai=True,
                project=gcp_project,
                location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
            )
            logger.info("Gemini client: Vertex AI (project=%s)", gcp_project)
        elif api_key:
            _client = genai.Client(api_key=api_key)
            logger.info("Gemini client: API key")
        else:
            raise RuntimeError("Set GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT")
    return _client


async def extract_text_from_image(image_url: str) -> dict:
    client = _get_client()
    async with httpx.AsyncClient() as http:
        img_resp = await http.get(image_url, timeout=30)
        img_resp.raise_for_status()
    img_bytes = img_resp.content
    content_type = img_resp.headers.get("content-type", "image/jpeg").split(";")[0]

    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=img_bytes, mime_type=content_type),
            types.Part.from_text(text=
                "Extract ALL text from this document image exactly as written. "
                "Also classify the document type as one of: medicaid, uscis, irs, dmv, "
                "school, medical, lease, car_insurance, utility, other. "
                "Return JSON with keys: raw_text (string with all extracted text), "
                "document_type_guess (one of the categories above), "
                "confidence (float 0-1 for your classification confidence)."
            ),
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )
    result = _parse_json(response.text)
    logger.info(
        "Gemini OCR complete: doc_type=%s confidence=%.2f text_length=%d",
        result.get("document_type_guess", "unknown"),
        result.get("confidence", 0),
        len(result.get("raw_text", "")),
    )
    return result


async def explain_in_plain_english(
    ocr_text: str, document_type: str, family_history: str = ""
) -> dict:
    client = _get_client()
    history_context = ""
    if family_history:
        history_context = (
            f"\n\nThis family has previously received these documents: {family_history}. "
            "Use this context to provide more relevant guidance."
        )

    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=(
            f"You are a helpful assistant explaining a US government document to an immigrant parent. "
            f"The document is a {document_type} document.\n\n"
            f"Rules:\n"
            f"- Write at a 6th-grade reading level\n"
            f"- 3-5 sentences maximum\n"
            f"- Lead with the action: 'You need to...' or 'There is nothing you need to do, but...'\n"
            f"- If this is NOT about deportation or legal trouble, reassure the reader\n"
            f"- Be warm and clear\n"
            f"{history_context}\n\n"
            f"Document text:\n{ocr_text}\n\n"
            f"Return JSON with keys:\n"
            f"- explanation (string: plain-English explanation following the rules above)\n"
            f"- key_facts (object with keys: deadline (string or null), "
            f"amount_due (string or null), action_required (string or null))"
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.3,
        ),
    )
    result = _parse_json(response.text)
    logger.info(
        "Gemini explanation complete: action=%s",
        result.get("key_facts", {}).get("action_required", "none"),
    )
    return result


_LANGUAGE_NAMES = {
    "zh-CN": "Simplified Chinese (zh-CN)",
    "zh-TW": "Traditional Chinese (zh-TW)",
    "es": "Spanish",
    "vi": "Vietnamese",
    "ko": "Korean",
    "tl": "Filipino (Tagalog)",
    "fr": "French",
    "ar": "Arabic",
    "hi": "Hindi",
    "ru": "Russian",
    "pt": "Portuguese",
}


async def translate_text(
    english_text: str, document_type: str, target_language: str = "zh-CN"
) -> str:
    client = _get_client()
    lang_name = _LANGUAGE_NAMES.get(target_language, target_language)
    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=(
            f"Translate the following explanation of a {document_type} document "
            f"into {lang_name}.\n\n"
            f"Translation rules — follow ALL of these exactly:\n"
            f"- Audience: an immigrant parent whose adult child would normally explain this\n"
            f"- Tone: warm and respectful\n"
            f"- DO NOT translate these proper nouns — keep them in English: "
            f"Medicaid, USCIS, IRS, DMV, Social Security, Medicare, SNAP\n"
            f"- DO NOT translate dates, dollar amounts, addresses, names, or case numbers — "
            f"keep them exactly as written in English\n"
            f"- Use natural everyday language, NOT bureaucratic literal translation\n"
            f"- Lead with what the parent needs to do, then explain what the letter is\n\n"
            f"Text to translate:\n{english_text}\n\n"
            f"Return ONLY the {lang_name} translation, no explanation or notes."
        ),
        config=types.GenerateContentConfig(
            temperature=0.3,
        ),
    )
    translated = response.text.strip()
    logger.info("Gemini translation complete: lang=%s length=%d chars", target_language, len(translated))
    return translated


async def translate_to_mandarin(english_text: str, document_type: str) -> str:
    return await translate_text(english_text, document_type, "zh-CN")


async def detect_language_from_audio(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    client = _get_client()
    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
            types.Part.from_text(text=(
                "Listen to this audio clip and identify the spoken language. "
                "Return JSON with keys: "
                "language_code (MUST be one of: 'en', 'zh-CN', 'es', 'vi', 'ro'), "
                "language_name (English name), "
                "confidence (float 0-1). "
                "If the language is not one of those five, pick the closest match."
            )),
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )
    result = _parse_json(response.text)
    logger.info(
        "Gemini language detection: code=%s confidence=%.2f",
        result.get("language_code", "unknown"),
        result.get("confidence", 0),
    )
    return result


async def embed_text(text: str) -> list[float]:
    try:
        client = _get_client()
        response = await client.aio.models.embed_content(
            model=EMBED_MODEL,
            contents=text,
        )
        values = response.embeddings[0].values
        logger.info("Gemini embedding complete: dim=%d", len(values))
        return list(values)
    except Exception as exc:
        logger.warning("Gemini embedding failed (non-critical, pipeline continues): %s", exc)
        return []
