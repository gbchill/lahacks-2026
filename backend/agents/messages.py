"""Inter-agent message types for the Orision pipeline.

All types use uagents.Model (pydantic v1). Use plain `list` for
embedding fields — parameterized generics break in pydantic v1 on 3.10.
"""
from uagents import Model


class OrchestrateRequest(Model):
    correlation_id: str
    image_url: str
    user_id: str
    doc_id: str
    target_language: str = "zh-CN"


class ParseRequest(Model):
    correlation_id: str
    image_url: str
    user_id: str


class ParsedDocument(Model):
    correlation_id: str
    raw_text: str
    document_type: str
    confidence: float
    error: str = ""


class ContextRequest(Model):
    correlation_id: str
    user_id: str
    raw_text: str
    document_type: str


class ContextBundle(Model):
    correlation_id: str
    raw_text: str
    document_type: str
    family_history: str
    similar_doc_ids: list
    embedding: list


class DraftRequest(Model):
    correlation_id: str
    raw_text: str
    document_type: str
    family_history: str
    embedding: list


class ExplanationDraft(Model):
    correlation_id: str
    english_explanation: str
    key_facts_json: str
    document_type: str
    embedding: list


class TranslateRequest(Model):
    correlation_id: str
    english_explanation: str
    document_type: str
    key_facts_json: str
    embedding: list
    target_language: str = "zh-CN"


class TranslatedExplanation(Model):
    correlation_id: str
    english_explanation: str
    translated_explanation: str
    document_type: str
    key_facts_json: str
    embedding: list
    similar_doc_ids: list = []
