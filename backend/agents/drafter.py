"""Drafter uAgent — Gemini plain-English explanation with family context."""
import datetime
import json
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    chat_protocol_spec,
)

from agents.messages import DraftRequest, ExplanationDraft
from services.gemini import explain_in_plain_english

drafter = Agent(
    name="drafter",
    seed=os.getenv("DRAFTER_AGENT_SEED", "orision-drafter-agent-v1-lahacks2026"),
)

# ── Chat Protocol (required for Agentverse / ASI:One) ────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info("[drafter] chat greeting from %s", sender)
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
            metadata={"agent": "orision-drafter", "status": "ready"},
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


drafter.include(chat_proto)

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
