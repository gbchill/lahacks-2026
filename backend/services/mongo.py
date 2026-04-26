"""MongoDB Atlas — document storage + vector search across family corpus."""
import logging
import os
from datetime import datetime, timezone

import certifi
import motor.motor_asyncio

logger = logging.getLogger(__name__)

_client: motor.motor_asyncio.AsyncIOMotorClient | None = None
_db: motor.motor_asyncio.AsyncIOMotorDatabase | None = None


def _get_db() -> motor.motor_asyncio.AsyncIOMotorDatabase | None:
    global _client, _db
    if _db is not None:
        return _db
    uri = os.getenv("MONGODB_URI")
    if not uri:
        logger.warning("MONGODB_URI not set — MongoDB disabled, pipeline will still run")
        return None
    db_name = os.getenv("MONGODB_DB_NAME", "orision")
    _client = motor.motor_asyncio.AsyncIOMotorClient(
        uri,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
    )
    _db = _client[db_name]
    logger.info("MongoDB connected: db=%s", db_name)
    return _db


async def save_document(
    user_id: str, doc: dict, embedding: list[float] | None = None
) -> str:
    db = _get_db()
    if db is None:
        logger.warning("MongoDB unavailable — skipping save_document")
        return ""
    try:
        record = {
            **doc,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        if embedding:
            record["embedding"] = embedding
        result = await db["documents"].insert_one(record)
        doc_id = str(result.inserted_id)
        logger.info("MongoDB document saved: user=%s doc_id=%s", user_id, doc_id)
        return doc_id
    except Exception as exc:
        logger.warning("MongoDB save_document failed (non-critical): %s", exc)
        return ""


async def update_document_field(
    document_id: str, field: str, value: object
) -> None:
    db = _get_db()
    if db is None:
        return
    try:
        await db["documents"].update_one(
            {"document_id": document_id},
            {"$set": {field: value}},
        )
    except Exception as exc:
        logger.warning("MongoDB update_document_field failed: %s", exc)


async def find_similar(
    user_id: str, embedding: list[float] | None = None, k: int = 5
) -> list[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        if embedding:
            # Atlas Vector Search — requires index "vector_index" on documents collection.
            # Create in Atlas UI: type=vectorSearch, path=embedding,
            # numDimensions=3072, similarity=cosine, filter path=user_id.
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "embedding",
                        "queryVector": embedding,
                        "numCandidates": max(k * 10, 100),
                        "limit": k,
                        "filter": {"user_id": user_id},
                    }
                },
                {
                    "$project": {
                        "_id": {"$toString": "$_id"},
                        "document_id": 1,
                        "document_type": 1,
                        "english_explanation": 1,
                        "created_at": 1,
                        "score": {"$meta": "vectorSearchScore"},
                    }
                },
            ]
            cursor = db["documents"].aggregate(pipeline)
            docs = await cursor.to_list(length=k)
            logger.info(
                "Atlas Vector Search: found %d similar docs for user=%s", len(docs), user_id
            )
            return docs

        # Recency fallback when no embedding provided
        cursor = (
            db["documents"]
            .find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(k)
        )
        docs = await cursor.to_list(length=k)
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception as exc:
        logger.warning("MongoDB find_similar failed (non-critical): %s", exc)
        return []


async def get_document_by_id(document_id: str) -> dict | None:
    db = _get_db()
    if db is None:
        return None
    try:
        doc = await db["documents"].find_one({"document_id": document_id})
        if doc is None:
            return None
        doc["_id"] = str(doc["_id"])
        doc.pop("embedding", None)
        return doc
    except Exception as exc:
        logger.warning("MongoDB get_document_by_id failed: %s", exc)
        return None


async def get_timeline(user_id: str) -> list[dict]:
    db = _get_db()
    if db is None:
        return []
    try:
        cursor = (
            db["documents"]
            .find({"user_id": user_id})
            .sort("created_at", -1)
        )
        docs = await cursor.to_list(length=100)
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception as exc:
        logger.warning("MongoDB get_timeline failed (non-critical): %s", exc)
        return []
