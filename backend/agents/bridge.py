"""Shared state for FastAPI <-> orchestrator agent communication.

FastAPI puts work items in request_queue; orchestrator drains via on_interval.
pending_futures maps correlation_id -> asyncio.Future for result delivery.
"""
import asyncio

request_queue: asyncio.Queue = asyncio.Queue()
pending_futures: dict[str, asyncio.Future] = {}
