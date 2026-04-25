"""Context uAgent — embed text, vector-search past docs, build family history.

This agent is ALSO exposed as an MCP server (see mcp_server/server.py)
for the Cognition Augment the Agent challenge.
"""
import datetime
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    chat_protocol_spec,
)

from agents.messages import ContextRequest, ContextBundle
from services.gemini import embed_text
from services.mongo import find_similar

_endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")

context_agent = Agent(
    name="context",
    seed=os.getenv("CONTEXT_AGENT_SEED", "orision-context-agent-v1-lahacks2026"),
    endpoint=[f"{_endpoint}/submit"],
    agentverse=True,
)

# ── Chat Protocol (required for Agentverse / ASI:One) ────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info("[context] chat greeting from %s", sender)
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
            metadata={"agent": "orision-context", "status": "ready"},
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


context_agent.include(chat_proto, publish_manifest=True)

# ── Pipeline Protocol ────────────────────────────────────────────────────────

pipeline_proto = Protocol(name="OrisionPipeline", version="1.0.0")


@pipeline_proto.on_message(ContextRequest, replies={ContextBundle})
async def handle_context(ctx: Context, sender: str, msg: ContextRequest):
    ctx.logger.info("[context] cid=%s user=%s", msg.correlation_id, msg.user_id)

    embedding = await embed_text(msg.raw_text)

    past_docs = await find_similar(
        msg.user_id,
        embedding=embedding or None,
        k=5,
    )
    ctx.logger.info(
        "[context] found %d similar past docs for user=%s via Atlas Vector Search",
        len(past_docs),
        msg.user_id,
    )

    family_history = "; ".join(
        f"{d.get('document_type', 'unknown')} from {d.get('created_at', '?')}"
        for d in past_docs[:3]
    )
    similar_doc_ids = [
        d.get("document_id", "") for d in past_docs if d.get("document_id")
    ]

    await ctx.send(
        sender,
        ContextBundle(
            correlation_id=msg.correlation_id,
            raw_text=msg.raw_text,
            document_type=msg.document_type,
            family_history=family_history,
            similar_doc_ids=similar_doc_ids,
            embedding=embedding or [],
        ),
    )


context_agent.include(pipeline_proto)

if __name__ == "__main__":
    context_agent.run()
