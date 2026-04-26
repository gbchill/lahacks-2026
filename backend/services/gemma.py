"""Gemma 3 27B IT — PII redaction, document classification, fact extraction."""
import asyncio
import json
import logging
import os
import re

from google import genai

logger = logging.getLogger(__name__)

MODEL = "gemma-3-27b-it"

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")
        _client = genai.Client(api_key=api_key)
        logger.info("Gemma client: API key")
    return _client


def _parse_json(text: str) -> dict | list | None:
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try stripping trailing commas before } and ]
        cleaned2 = re.sub(r",\s*([}\]])", r"\1", cleaned)
        try:
            return json.loads(cleaned2)
        except json.JSONDecodeError:
            return None


def _regex_redact(text: str) -> str:
    """Fallback regex-based PII redaction for common patterns."""
    # SSN: xxx-xx-xxxx or xxxxxxxxx
    text = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[SSN REDACTED]", text)
    text = re.sub(r"\b\d{9}\b", "[SSN REDACTED]", text)
    # Account numbers: typically 8-17 digit sequences not already matched
    text = re.sub(r"\b\d{8,17}\b", "[ACCT REDACTED]", text)
    # Phone numbers: (xxx) xxx-xxxx, xxx-xxx-xxxx, xxxxxxxxxx
    text = re.sub(r"\(?\d{3}\)?[\s\-\.]\d{3}[\s\-\.]\d{4}", "[PHONE REDACTED]", text)
    return text


async def detect_pii(text: str) -> dict:
    """Scan text for PII and return redacted version with metadata.

    Returns:
        {
            "has_pii": bool,
            "pii_types": list[str],
            "redacted_text": str,
        }
    """
    logger.info("Gemma detect_pii: input_length=%d chars", len(text))
    prompt = (
        "You are a privacy-protection assistant. Analyze the following text for "
        "personally identifiable information (PII).\n\n"
        "Scan for these PII types:\n"
        "- SSN (Social Security Number, format xxx-xx-xxxx)\n"
        "- account_number (bank or financial account numbers)\n"
        "- date_of_birth (DOB, birth date)\n"
        "- address (home or mailing address)\n"
        "- phone_number (any phone number)\n"
        "- name (full personal names)\n"
        "- email (email addresses)\n\n"
        "Instructions:\n"
        "1. Identify all PII present.\n"
        "2. Produce a redacted copy of the text where:\n"
        "   - SSNs are replaced with [SSN REDACTED]\n"
        "   - Account numbers are replaced with [ACCT REDACTED]\n"
        "   - Dates of birth are replaced with [DOB REDACTED]\n"
        "   - Addresses are replaced with [ADDRESS REDACTED]\n"
        "   - Phone numbers are replaced with [PHONE REDACTED]\n"
        "   - Names are replaced with [NAME REDACTED]\n"
        "   - Emails are replaced with [EMAIL REDACTED]\n\n"
        "Return ONLY valid JSON with exactly these keys:\n"
        '{"has_pii": <bool>, "pii_types": [<list of pii type strings found>], '
        '"redacted_text": "<full redacted text>"}\n\n'
        f"Text to analyze:\n{text}"
    )

    default = {
        "has_pii": False,
        "pii_types": [],
        "redacted_text": text,
    }

    try:
        client = _get_client()

        def _call() -> str:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            return response.text

        raw = await asyncio.to_thread(_call)
        logger.info("Gemma detect_pii: response_length=%d chars", len(raw))

        parsed = _parse_json(raw)
        if parsed is None or not isinstance(parsed, dict):
            logger.warning(
                "Gemma detect_pii: JSON parse failed, falling back to regex redaction"
            )
            redacted = _regex_redact(text)
            return {
                "has_pii": redacted != text,
                "pii_types": [],
                "redacted_text": redacted,
            }

        # Ensure all expected keys are present
        result = {
            "has_pii": bool(parsed.get("has_pii", False)),
            "pii_types": list(parsed.get("pii_types", [])),
            "redacted_text": parsed.get("redacted_text", text),
        }
        logger.info(
            "Gemma detect_pii: has_pii=%s types=%s",
            result["has_pii"],
            result["pii_types"],
        )
        return result

    except Exception as exc:
        logger.warning("Gemma detect_pii failed, using regex fallback: %s", exc)
        redacted = _regex_redact(text)
        return {
            "has_pii": redacted != text,
            "pii_types": [],
            "redacted_text": redacted,
        }


async def classify_document(text: str) -> str:
    """Classify a document into a known category.

    Returns one of: medicaid, irs, uscis, dmv, school, medical, lease,
    car_insurance, other.
    """
    logger.info("Gemma classify_document: input_length=%d chars", len(text))
    prompt = (
        "Classify this document into exactly one category from this list:\n"
        "medicaid, irs, uscis, dmv, school, medical, lease, car_insurance, other\n\n"
        "Return ONLY the category name in lowercase, nothing else.\n\n"
        f"Document text:\n{text}"
    )

    try:
        client = _get_client()

        def _call() -> str:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            return response.text

        raw = await asyncio.to_thread(_call)
        logger.info("Gemma classify_document: response=%r", raw[:100])

        category = raw.strip().lower().split()[0] if raw.strip() else "other"
        valid = {
            "medicaid", "irs", "uscis", "dmv", "school",
            "medical", "lease", "car_insurance", "other",
        }
        if category not in valid:
            logger.warning(
                "Gemma classify_document: unexpected category %r, defaulting to 'other'",
                category,
            )
            category = "other"

        logger.info("Gemma classify_document: category=%s", category)
        return category

    except Exception as exc:
        logger.warning("Gemma classify_document failed, defaulting to 'other': %s", exc)
        return "other"


async def extract_facts(text: str) -> dict:
    """Extract key actionable facts from document text.

    Returns:
        {
            "deadline": str | None,
            "amount_due": str | None,
            "action_required": str | None,
            "sender": str | None,
        }
    """
    logger.info("Gemma extract_facts: input_length=%d chars", len(text))
    prompt = (
        "You are an assistant helping immigrant families understand important documents. "
        "Extract the key facts from the document below.\n\n"
        "Return ONLY valid JSON with exactly these keys:\n"
        '{"deadline": <string or null>, "amount_due": <string or null>, '
        '"action_required": <string or null>, "sender": <string or null>}\n\n'
        "Guidelines:\n"
        "- deadline: any date by which the recipient must act (e.g. 'May 15, 2026'). "
        "Null if none.\n"
        "- amount_due: any monetary amount owed or expected (e.g. '$245.00'). Null if none.\n"
        "- action_required: a short phrase describing what the person must do "
        "(e.g. 'Renew Medicaid coverage by submitting Form ABC'). Null if no action needed.\n"
        "- sender: the organization or agency that sent the document "
        "(e.g. 'California Department of Health Care Services'). Null if unknown.\n\n"
        f"Document text:\n{text}"
    )

    default: dict = {
        "deadline": None,
        "amount_due": None,
        "action_required": None,
        "sender": None,
    }

    try:
        client = _get_client()

        def _call() -> str:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            return response.text

        raw = await asyncio.to_thread(_call)
        logger.info("Gemma extract_facts: response_length=%d chars", len(raw))

        parsed = _parse_json(raw)
        if parsed is None or not isinstance(parsed, dict):
            logger.warning("Gemma extract_facts: JSON parse failed, returning defaults")
            return default

        result = {
            "deadline": parsed.get("deadline"),
            "amount_due": parsed.get("amount_due"),
            "action_required": parsed.get("action_required"),
            "sender": parsed.get("sender"),
        }
        logger.info(
            "Gemma extract_facts: deadline=%r action=%r",
            result["deadline"],
            result["action_required"],
        )
        return result

    except Exception as exc:
        logger.warning("Gemma extract_facts failed, returning defaults: %s", exc)
        return default
