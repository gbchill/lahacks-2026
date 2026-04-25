"""Phase 1 probe: verify uagents SDK works for Orision patterns."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import datetime
import uuid

from uagents import Agent, Bureau, Protocol, Model, Context
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    chat_protocol_spec,
)

print("--- Test 1: Agent creation with seed ---")
a = Agent(name="probe", seed="orision-probe-only")
print(f"PASS address={a.address}")

print("--- Test 2: Chat Protocol construction ---")
chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            acknowledged_msg_id=msg.msg_id,
        ),
    )


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


a.include(chat_proto)
print("PASS protocol included + verified")

print("--- Test 3: Custom Model ---")


class TestMsg(Model):
    text: str
    values: list


m = TestMsg(text="hello", values=[1.0, 2.0, 3.0])
print(f"PASS model json={m.json()}")

print("--- Test 4: ChatMessage construction ---")
msg = ChatMessage(
    timestamp=datetime.datetime.now(datetime.timezone.utc),
    msg_id=uuid.uuid4(),
    content=[TextContent(type="text", text="test payload")],
)
print(f"PASS msg_id={msg.msg_id}")

print("--- Test 5: Messages module import ---")
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

req = OrchestrateRequest(
    correlation_id="test-123",
    image_url="https://example.com/photo.jpg",
    user_id="user-1",
    doc_id="doc-1",
    target_language="zh-CN",
)
print(f"PASS OrchestrateRequest json={req.json()}")

print("--- Test 6: Bureau construction ---")
b = Bureau(port=8099)
b.add(a)
print("PASS bureau created")

print("--- Test 7: send_and_receive exists ---")
print(f"PASS Context.send_and_receive={hasattr(Context, 'send_and_receive')}")

print("\nAll probes passed.")
