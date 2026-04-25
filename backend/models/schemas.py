"""Shared Pydantic models for request/response bodies."""
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentFacts(BaseModel):
    document_type: str
    deadline: datetime | None = None
    amount_due: float | None = None
    action_required: str | None = None
    sender: str | None = None


class ExplainResponse(BaseModel):
    document_id: str
    document_type: str
    facts: DocumentFacts
    explanation_text: str
    explanation_audio_url: str
    target_language: str
    similar_past_documents: list[str] = Field(default_factory=list)


class TimelineItem(BaseModel):
    document_id: str
    document_type: str
    received_at: datetime
    summary: str
    audio_url: str | None = None
