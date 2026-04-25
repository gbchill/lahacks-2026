"""Drafter uAgent — Gemini plain-English explanation with family context."""
from datetime import datetime
from uuid import uuid4
import json
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    StartSessionContent,
    TextContent,
    EndSessionContent,
    chat_protocol_spec,
)

from agents.messages import DraftRequest, ExplanationDraft
from services.gemini import explain_in_plain_english

_endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")

drafter = Agent(
    name="drafter",
    seed=os.getenv("DRAFTER_AGENT_SEED", "orision-drafter-agent-v1-lahacks2026"),
    endpoint=[f"{_endpoint}/submit"],
    agentverse=True,
)

# ── Chat Protocol (required for Agentverse / ASI:One) ────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


def create_text_chat(text: str) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.utcnow(),
            acknowledged_msg_id=msg.msg_id,
        ),
    )
    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"[drafter] session started with {sender}")
        elif isinstance(item, TextContent):
            ctx.logger.info(f"[drafter] processing text from {sender}")
            try:
                result = await explain_in_plain_english(item.text, "unknown", "")
                explanation = result.get("explanation", "Could not generate explanation.")
                key_facts = result.get("key_facts", {})
                response_text = f"Plain-Language Explanation:\n\n{explanation}"
                if key_facts:
                    facts_str = "\n".join(f"- {k}: {v}" for k, v in key_facts.items())
                    response_text += f"\n\nKey Facts:\n{facts_str}"
            except Exception as exc:
                ctx.logger.error("[drafter] chat processing failed: %s", exc)
                response_text = f"Drafter error: {exc}"
            await ctx.send(sender, create_text_chat(response_text))
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"[drafter] session ended with {sender}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


drafter.include(chat_proto, publish_manifest=True)

# ── Pipeline Protocol ────────────────────────────────────────────────────────

pipeline_proto = Protocol(name="OrisionPipeline", version="1.0.0")


@pipeline_proto.on_message(DraftRequest, replies={ExplanationDraft})
async def handle_draft(ctx: Context, sender: str, msg: DraftRequest):
    ctx.logger.info(
        "[drafter] cid=%s doc_type=%s", msg.correlation_id, msg.document_type
    )

    result = await explain_in_plain_english(
        msg.raw_text,
        msg.document_type,
        msg.family_history,
    )
    english_explanation = result.get("explanation", "")
    key_facts = result.get("key_facts", {})

    await ctx.send(
        sender,
        ExplanationDraft(
            correlation_id=msg.correlation_id,
            english_explanation=english_explanation,
            key_facts_json=json.dumps(key_facts),
            document_type=msg.document_type,
            embedding=msg.embedding,
        ),
    )


drafter.include(pipeline_proto)

if __name__ == "__main__":
    drafter.run()
