"""Gemini 2.5 Flash Vision — OCR, explanation, translation, embeddings."""
import json
import logging
import os

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

MODEL = "gemini-2.5-flash"
EMBED_MODEL = "gemini-embedding-001"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")
        _client = genai.Client(api_key=api_key)
    return _client


async def extract_text_from_image(image_url: str) -> dict:
    client = _get_client()
    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_uri(file_uri=image_url, mime_type="image/jpeg"),
            types.Part.from_text(
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
    result = json.loads(response.text)
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
    result = json.loads(response.text)
    logger.info(
        "Gemini explanation complete: action=%s",
        result.get("key_facts", {}).get("action_required", "none"),
    )
    return result


async def translate_to_mandarin(english_text: str, document_type: str) -> str:
    client = _get_client()
    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=(
            f"Translate the following explanation of a {document_type} document "
            f"into Simplified Chinese (zh-CN).\n\n"
            f"Translation rules — follow ALL of these exactly:\n"
            f"- Audience: an immigrant mother whose adult daughter would normally explain this\n"
            f"- Tone: warm and respectful — use 您 (formal you) when addressing the parent\n"
            f"- DO NOT translate these proper nouns — keep them in English: "
            f"Medicaid, USCIS, IRS, DMV, Social Security, Medicare, SNAP\n"
            f"- DO NOT translate dates, dollar amounts, addresses, names, or case numbers — "
            f"keep them exactly as written in English\n"
            f"- Use natural everyday Mandarin, NOT bureaucratic literal translation\n"
            f"- Lead with what the parent needs to do, then explain what the letter is\n\n"
            f"Text to translate:\n{english_text}\n\n"
            f"Return ONLY the Simplified Chinese translation, no explanation or notes."
        ),
        config=types.GenerateContentConfig(
            temperature=0.3,
        ),
    )
    translated = response.text.strip()
    logger.info("Gemini translation complete: length=%d chars", len(translated))
    return translated


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
