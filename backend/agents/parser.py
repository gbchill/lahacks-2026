"""Parser uAgent — OCR + document classification via Gemini Vision."""
import datetime
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec,
)

from agents.messages import ParseRequest, ParsedDocument
from services.gemini import extract_text_from_image

parser = Agent(
    name="parser",
    seed=os.getenv("PARSER_AGENT_SEED", "orision-parser-agent-v1-lahacks2026"),
)

# ── Chat Protocol (required for Agentverse / ASI:One) ────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info("[parser] chat greeting from %s", sender)
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
            metadata={"agent": "orision-parser", "status": "ready"},
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


parser.include(chat_proto)

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
        )
    await ctx.send(sender, response)


parser.include(pipeline_proto)

if __name__ == "__main__":
    parser.run()
