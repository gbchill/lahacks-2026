"""Shared Pydantic models for request/response bodies."""
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentFacts(BaseModel):
    document_type: str
    deadline: datetime | None = None
    amount_due: float | None = None
    action_required: str | None = None
    sender: str | None = None


class KeyFacts(BaseModel):
    deadline: str | None = None
    amount_due: str | None = None
    action_required: str | None = None


class PipelineTiming(BaseModel):
    cloudinary_upload: float | None = None
    ocr: float | None = None
    explanation: float | None = None
    translation: float | None = None
    tts: float | None = None
    audio_upload: float | None = None
    total: float | None = None


class ExplainResponse(BaseModel):
    document_id: str
    document_type: str
    english_explanation: str
    translated_explanation: str
    target_language: str
    audio_url: str
    original_photo_url: str
    enhanced_photo_url: str
    key_facts: KeyFacts = Field(default_factory=KeyFacts)
    similar_past_documents: list[str] = Field(default_factory=list)
    pipeline_timing_ms: PipelineTiming = Field(default_factory=PipelineTiming)


class TimelineItem(BaseModel):
    document_id: str
    document_type: str
    received_at: datetime
    summary: str
    audio_url: str | None = None
