"""Parser uAgent — OCR + document classification via Gemini Vision."""
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

from agents.messages import ParseRequest, ParsedDocument
from services.gemini import extract_text_from_image

_endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")

parser = Agent(
    name="parser",
    seed=os.getenv("PARSER_AGENT_SEED", "orision-parser-agent-v1-lahacks2026"),
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
            ctx.logger.info(f"[parser] session started with {sender}")
        elif isinstance(item, TextContent):
            ctx.logger.info(f"[parser] processing text from {sender}")
            try:
                text_input = item.text.strip()
                if text_input.startswith("http"):
                    result = await extract_text_from_image(text_input)
                    raw_text = result.get("raw_text", "")
                    doc_type = result.get("document_type_guess", "unknown")
                    response_text = f"Document Type: {doc_type}\n\nExtracted Text:\n{raw_text}"
                else:
                    response_text = f"Parser received text (send an image URL for OCR):\n{text_input}"
            except Exception as exc:
                ctx.logger.error("[parser] chat processing failed: %s", exc)
                response_text = f"Parser error: {exc}"
            await ctx.send(sender, create_text_chat(response_text))
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"[parser] session ended with {sender}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


parser.include(chat_proto, publish_manifest=True)

# ── Pipeline Protocol ────────────────────────────────────────────────────────

pipeline_proto = Protocol(name="OrisionPipeline", version="1.0.0")


@pipeline_proto.on_message(ParseRequest, replies={ParsedDocument})
async def handle_parse(ctx: Context, sender: str, msg: ParseRequest):
    ctx.logger.info("[parser] cid=%s url=%s", msg.correlation_id, msg.image_url[:80])
    try:
        result = await extract_text_from_image(msg.image_url)
        response = ParsedDocument(
            correlation_id=msg.correlation_id,
            raw_text=result.get("raw_text", ""),
            document_type=result.get("document_type_guess", "other"),
            confidence=result.get("confidence", 0.0),
        )
    except Exception as exc:
        ctx.logger.error("[parser] OCR failed: %s", exc)
        response = ParsedDocument(
            correlation_id=msg.correlation_id,
            raw_text="",
            document_type="other",
            confidence=0.0,
            error=f"OCR failed: {exc}",
        )
    await ctx.send(sender, response)


parser.include(pipeline_proto)

if __name__ == "__main__":
    parser.run()
