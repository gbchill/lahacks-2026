"""Translator uAgent — English explanation to Mandarin translation via Gemini."""
from datetime import datetime
from uuid import uuid4
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

from agents.messages import TranslateRequest, TranslatedExplanation
from services.gemini import translate_text

_endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")

translator = Agent(
    name="translator",
    seed=os.getenv("TRANSLATOR_AGENT_SEED", "orision-translator-agent-v1-lahacks2026"),
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
            ctx.logger.info(f"[translator] session started with {sender}")
        elif isinstance(item, TextContent):
            ctx.logger.info(f"[translator] processing text from {sender}")
            try:
                text_input = item.text.strip()
                target_lang = "es"
                if text_input.lower().startswith("to:"):
                    parts = text_input.split(" ", 1)
                    target_lang = parts[0][3:]
                    text_input = parts[1] if len(parts) > 1 else ""
                translated = await translate_text(text_input, "unknown", target_lang)
                response_text = f"Translation ({target_lang}):\n\n{translated}"
            except Exception as exc:
                ctx.logger.error("[translator] chat processing failed: %s", exc)
                response_text = f"Translation error: {exc}"
            await ctx.send(sender, create_text_chat(response_text))
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"[translator] session ended with {sender}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


translator.include(chat_proto, publish_manifest=True)

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
