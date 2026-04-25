"""Test MCP tools directly (bypasses SSE transport)."""
import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from mcp_server.server import explain_government_letter, search_family_documents

SAMPLE_LETTER = """
DEPARTMENT OF MOTOR VEHICLES
STATE OF CALIFORNIA

NOTICE OF REGISTRATION RENEWAL

Vehicle License Plate: 8ABC123
Registration Expires: 06/30/2026
Amount Due: $287.00

Pay online at dmv.ca.gov or by mail by 06/15/2026.
Sincerely,
California DMV
"""


async def main():
    print("=== Test: explain_government_letter ===")
    result = await explain_government_letter(
        letter_text=SAMPLE_LETTER,
        document_type="dmv",
        user_id="test-mcp-user",
    )
    print("English:", result["english_explanation"][:200])
    print("Chinese:", result["translated_explanation"][:100])
    print("Key facts:", result["key_facts"])
    print("Similar docs:", len(result["similar_past_documents"]))
    print("PASS\n")

    print("=== Test: search_family_documents ===")
    docs = await search_family_documents(
        query_text="DMV registration renewal",
        user_id="test-mcp-user",
        k=3,
    )
    print(f"Found {len(docs)} documents")
    print("PASS")


if __name__ == "__main__":
    asyncio.run(main())
