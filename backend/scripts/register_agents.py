"""Print agent registration info for manual Agentverse registration."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from uagents import Agent

AGENTS = [
    (
        "parser",
        os.getenv("PARSER_AGENT_SEED", "orision-parser-agent-v1-lahacks2026"),
        "OCR + document classification via Gemini Vision. Receives a Cloudinary "
        "photo URL and returns structured text with document type and confidence.",
    ),
    (
        "context",
        os.getenv("CONTEXT_AGENT_SEED", "orision-context-agent-v1-lahacks2026"),
        "Embeds document text, runs Atlas Vector Search to find similar past "
        "documents for the same family, builds family history context string.",
    ),
    (
        "drafter",
        os.getenv("DRAFTER_AGENT_SEED", "orision-drafter-agent-v1-lahacks2026"),
        "Generates plain-English explanation of a government document at "
        "6th-grade reading level, enriched with family history context.",
    ),
    (
        "translator",
        os.getenv("TRANSLATOR_AGENT_SEED", "orision-translator-agent-v1-lahacks2026"),
        "Translates English explanation to Simplified Chinese (zh-CN) with "
        "warm, respectful tone appropriate for immigrant families.",
    ),
    (
        "orchestrator",
        os.getenv("ORCHESTRATOR_AGENT_SEED", "orision-orchestrator-agent-v1-lahacks2026"),
        "Chains Parser -> Context -> Drafter -> Translator agents sequentially. "
        "Bridges FastAPI HTTP requests to the uAgent message network.",
    ),
]

TAGS_BASE = ["orision", "immigrant-families", "document-translation"]

print("=" * 70)
print("ORISION — Agent Registration Info")
print("=" * 70)

for name, seed, description in AGENTS:
    a = Agent(name=name, seed=seed)
    tags = TAGS_BASE + [name]
    print(f"\n{name.upper()}")
    print(f"  Address:     {a.address}")
    print(f"  Seed:        {seed}")
    print(f"  Description: {description}")
    print(f"  Tags:        {tags}")
    print(f"  Agentverse:  https://agentverse.ai/agents/{a.address}")

print("\n" + "=" * 70)
print("AGENTVERSE REGISTRATION")
print("=" * 70)
print("1. Go to https://agentverse.ai")
print("2. For each agent above, click My Agents -> Register Agent")
print("3. Enter the address and description")
print("4. Verify Chat Protocol shows green in the protocol list")
print("5. Test ASI:One discoverability at https://asi1.ai")
