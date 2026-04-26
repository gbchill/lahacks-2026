"""Orchestrator uAgent — chains Parser -> Context -> Drafter -> Translator.

Polls bridge.request_queue via on_interval and runs each request through
the 4-agent chain using ctx.send_and_receive. Resolves the corresponding
asyncio.Future in bridge.pending_futures when the chain completes.
"""
import asyncio
import datetime
import os

from uagents import Agent, Protocol, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    chat_protocol_spec,
)
from uagents_core.types import DeliveryStatus

import agents.bridge as bridge
from agents.messages import (
    OrchestrateRequest,
    ParseRequest,
    ParsedDocument,
    ContextRequest,
    ContextBundle,
    DraftRequest,
    ExplanationDraft,
    TranslateRequest,
    TranslatedExplanation,
)

def _resolve_addr(env_var: str, import_fn) -> str:
    addr = os.environ.get(env_var)
    if addr:
        return addr
    return import_fn()


def _parser_addr():
    from agents.parser import parser
    return parser.address


def _context_addr():
    from agents.context import context_agent
    return context_agent.address


def _drafter_addr():
    from agents.drafter import drafter
    return drafter.address


def _translator_addr():
    from agents.translator import translator
    return translator.address

_endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")

orchestrator = Agent(
    name="orchestrator",
    seed=os.getenv("ORCHESTRATOR_AGENT_SEED", "orision-orchestrator-agent-v1-lahacks2026"),
    endpoint=[f"{_endpoint}/submit"],
    agentverse=True,
)

# ── Chat Protocol ────────────────────────────────────────────────────────────

chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
            metadata={"agent": "orision-orchestrator", "status": "ready"},
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


orchestrator.include(chat_proto, publish_manifest=True)

# ── Pipeline dispatch loop ───────────────────────────────────────────────────


@orchestrator.on_interval(period=0.05)
async def dispatch(ctx: Context):
    try:
        correlation_id, req = bridge.request_queue.get_nowait()
    except asyncio.QueueEmpty:
        return

    ctx.logger.info("[orchestrator] processing cid=%s", correlation_id)

    try:
        result = await _run_pipeline(ctx, req)
    except Exception as exc:
        ctx.logger.error("[orchestrator] pipeline failed cid=%s: %s", correlation_id, exc)
        result = exc

    fut = bridge.pending_futures.get(correlation_id)
    if fut and not fut.done():
        if isinstance(result, Exception):
            fut.set_exception(result)
        else:
            fut.set_result(result)
    bridge.pending_futures.pop(correlation_id, None)


async def _run_pipeline(
    ctx: Context, req: OrchestrateRequest
) -> TranslatedExplanation:
    cid = req.correlation_id
    timeout = 60

    parser_addr = _resolve_addr("PARSER_AGENT_ADDRESS", _parser_addr)
    context_addr = _resolve_addr("CONTEXT_AGENT_ADDRESS", _context_addr)
    drafter_addr = _resolve_addr("DRAFTER_AGENT_ADDRESS", _drafter_addr)
    translator_addr = _resolve_addr("TRANSLATOR_AGENT_ADDRESS", _translator_addr)

    # 1. Parser — OCR + classify
    ctx.logger.info("[orchestrator] cid=%s -> parser", cid)
    parsed, status = await ctx.send_and_receive(
        parser_addr,
        ParseRequest(
            correlation_id=cid,
            image_url=req.image_url,
            user_id=req.user_id,
        ),
        response_type=ParsedDocument,
        timeout=timeout,
    )
    if status.status == DeliveryStatus.FAILED or parsed is None:
        raise RuntimeError(f"Parser failed: {status.detail}")
    if parsed.error:
        raise RuntimeError(f"Parser OCR failed: {parsed.error}")
    ctx.logger.info("[orchestrator] cid=%s parser done, doc_type=%s", cid, parsed.document_type)

    # 2. Context — embed + vector search + family history
    ctx.logger.info("[orchestrator] cid=%s -> context", cid)
    context_bundle, status = await ctx.send_and_receive(
        context_addr,
        ContextRequest(
            correlation_id=cid,
            user_id=req.user_id,
            raw_text=parsed.raw_text,
            document_type=parsed.document_type,
        ),
        response_type=ContextBundle,
        timeout=timeout,
    )
    if status.status == DeliveryStatus.FAILED or context_bundle is None:
        raise RuntimeError(f"Context agent failed: {status.detail}")
    ctx.logger.info("[orchestrator] cid=%s context done, %d similar docs", cid, len(context_bundle.similar_doc_ids))

    # 3. Drafter — plain-English explanation
    ctx.logger.info("[orchestrator] cid=%s -> drafter", cid)
    draft, status = await ctx.send_and_receive(
        drafter_addr,
        DraftRequest(
            correlation_id=cid,
            raw_text=context_bundle.raw_text,
            document_type=context_bundle.document_type,
            family_history=context_bundle.family_history,
            embedding=context_bundle.embedding,
        ),
        response_type=ExplanationDraft,
        timeout=timeout,
    )
    if status.status == DeliveryStatus.FAILED or draft is None:
        raise RuntimeError(f"Drafter failed: {status.detail}")
    ctx.logger.info("[orchestrator] cid=%s drafter done", cid)

    # 4. Translator — English -> target language
    ctx.logger.info("[orchestrator] cid=%s -> translator", cid)
    translated, status = await ctx.send_and_receive(
        translator_addr,
        TranslateRequest(
            correlation_id=cid,
            english_explanation=draft.english_explanation,
            document_type=draft.document_type,
            key_facts_json=draft.key_facts_json,
            embedding=draft.embedding,
            target_language=req.target_language,
        ),
        response_type=TranslatedExplanation,
        timeout=timeout,
    )
    if status.status == DeliveryStatus.FAILED or translated is None:
        raise RuntimeError(f"Translator failed: {status.detail}")
    ctx.logger.info("[orchestrator] cid=%s translator done — chain complete", cid)

    translated.similar_doc_ids = context_bundle.similar_doc_ids
    return translated


if __name__ == "__main__":
    orchestrator.run()
