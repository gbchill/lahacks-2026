"""Chat endpoint — multi-turn Q&A over user's document history."""
import logging
from typing import Literal

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from services import mongo
from services.gemini import chat_with_documents
from services.supabase_admin import verify_jwt

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


def _extract_user(authorization: str) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    claims = verify_jwt(token)
    return claims["sub"]


def _build_document_context(docs: list[dict]) -> str:
    if not docs:
        return "No documents on file yet."
    lines: list[str] = []
    for doc in docs[:15]:
        doc_type = doc.get("document_type", "unknown")
        created = doc.get("created_at", "unknown date")
        explanation = doc.get("english_explanation", "")
        lines.append(f"[{doc_type.upper()} — {created[:10]}]: {explanation}")
        kf = doc.get("key_facts", {})
        if isinstance(kf, dict):
            details = [
                f"deadline: {kf['deadline']}" if kf.get("deadline") else None,
                f"amount: {kf['amount_due']}" if kf.get("amount_due") else None,
                f"action: {kf['action_required']}" if kf.get("action_required") else None,
            ]
            non_null = [d for d in details if d]
            if non_null:
                lines.append("  " + " | ".join(non_null))
    return "\n".join(lines)


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    request: ChatRequest,
    authorization: str = Header(...),
) -> ChatResponse:
    user_id = _extract_user(authorization)
    docs = await mongo.get_timeline(user_id)
    document_context = _build_document_context(docs)

    history_dicts = [{"role": m.role, "content": m.content} for m in request.history[-10:]]

    try:
        reply = await chat_with_documents(
            message=request.message,
            document_context=document_context,
            history=history_dicts,
            language=request.language,
        )
    except Exception as exc:
        logger.exception("chat_with_documents failed for user=%s", user_id)
        raise HTTPException(status_code=500, detail="Chat service error") from exc

    return ChatResponse(reply=reply)
