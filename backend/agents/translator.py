"""Translator uAgent — English explanation to Mandarin translation via Gemini."""
import datetime
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    chat_protocol_spec,
)

from agents.messages import TranslateRequest, TranslatedExplanation
from services.gemini import translate_text

translator = Agent(
    name="translator",
    seed=os.getenv("TRANSLATOR_AGENT_SEED", "orision-translator-agent-v1-lahacks2026"),
)

# ── Chat Protocol (required for Agentverse / ASI:One) ────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info("[translator] chat greeting from %s", sender)
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
            metadata={"agent": "orision-translator", "status": "ready"},
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


translator.include(chat_proto)

# ── Pipeline Protocol ────────────────────────────────────────────────────────

pipeline_proto = Protocol(name="OrisionPipeline", version="1.0.0")


@pipeline_proto.on_message(TranslateRequest, replies={TranslatedExplanation})
async def handle_translate(ctx: Context, sender: str, msg: TranslateRequest):
    ctx.logger.info("[translator] cid=%s", msg.correlation_id)
    try:
        zh_text = await translate_text(
            msg.english_explanation, msg.document_type, msg.target_language
        )
    except Exception as exc:
        ctx.logger.error("[translator] translation failed: %s", exc)
        zh_text = msg.english_explanation

    await ctx.send(
        sender,
        TranslatedExplanation(
            correlation_id=msg.correlation_id,
            english_explanation=msg.english_explanation,
            translated_explanation=zh_text,
            document_type=msg.document_type,
            key_facts_json=msg.key_facts_json,
            embedding=msg.embedding,
        ),
    )


translator.include(pipeline_proto)

if __name__ == "__main__":
    translator.run()
