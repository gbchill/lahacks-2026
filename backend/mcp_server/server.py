"""MCP server exposing Orision document understanding for the Cognition challenge.

Mounted in FastAPI at /mcp (SSE transport). Tools available to Claude Desktop,
Devin, and any MCP-compatible client.
"""
from mcp.server.fastmcp import FastMCP

from services.gemini import embed_text, explain_in_plain_english, translate_to_mandarin
from services.mongo import find_similar

mcp = FastMCP(
    "Orision",
    instructions=(
        "Orision helps immigrant families understand US government documents. "
        "Use explain_government_letter to get a plain-English + Chinese explanation "
        "of any letter text. Use search_family_documents to find past documents "
        "similar to a query."
    ),
)


@mcp.tool(
    description=(
        "Explain a US government letter in plain English and Simplified Chinese. "
        "Returns explanation, key facts (deadline, amount due, action required), "
        "and similar past documents for the user."
    )
)
async def explain_government_letter(
    letter_text: str,
    document_type: str = "other",
    user_id: str = "anonymous",
    target_language: str = "zh-CN",
) -> dict:
    explain_result = await explain_in_plain_english(letter_text, document_type)
    english_explanation = explain_result.get("explanation", "")
    key_facts = explain_result.get("key_facts", {})

    translated = await translate_to_mandarin(english_explanation, document_type)

    embedding = await embed_text(english_explanation + " " + translated)
    similar_docs = await find_similar(
        user_id, embedding=embedding if embedding else None, k=3
    )

    return {
        "english_explanation": english_explanation,
        "translated_explanation": translated,
        "document_type": document_type,
        "key_facts": key_facts,
        "similar_past_documents": [
            {
                "document_type": d.get("document_type"),
                "created_at": d.get("created_at"),
                "summary": d.get("english_explanation", "")[:200],
            }
            for d in similar_docs
        ],
    }


@mcp.tool(
    description=(
        "Search a user's past government documents using semantic similarity. "
        "Returns matching documents ranked by relevance."
    )
)
async def search_family_documents(
    query_text: str,
    user_id: str,
    k: int = 5,
) -> list:
    embedding = await embed_text(query_text)
    docs = await find_similar(
        user_id, embedding=embedding if embedding else None, k=k
    )
    return [
        {
            "document_id": d.get("document_id"),
            "document_type": d.get("document_type"),
            "created_at": d.get("created_at"),
            "summary": d.get("english_explanation", "")[:300],
            "similarity_score": d.get("score"),
        }
        for d in docs
    ]
