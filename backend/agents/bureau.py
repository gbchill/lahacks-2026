"""Bureau factory — assembles all 5 agents into one in-process Bureau."""
import asyncio
import os

from uagents import Bureau

from agents.orchestrator import orchestrator
from agents.parser import parser
from agents.context import context_agent
from agents.drafter import drafter
from agents.translator import translator


def build_bureau() -> Bureau:
    _endpoint = os.getenv("AGENT_ENDPOINT", "http://144.202.31.14:8001")
    bureau = Bureau(
        port=int(os.getenv("BUREAU_PORT", "8001")),
        loop=asyncio.get_running_loop(),
        endpoint=[f"{_endpoint}/submit"],
    )
    bureau.add(orchestrator)
    bureau.add(parser)
    bureau.add(context_agent)
    bureau.add(drafter)
    bureau.add(translator)
    return bureau
