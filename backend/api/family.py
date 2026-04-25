"""Family memory endpoints — timeline + similar document search."""
import logging

from bson import ObjectId
from fastapi import APIRouter

from services import mongo

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{user_id}/timeline")
async def get_timeline(user_id: str):
    """All documents this family has ever received, newest first."""
    try:
        docs = await mongo.get_timeline(user_id)
        return docs
    except Exception as exc:
        logger.warning("get_timeline failed: %s", exc)
        return []


@router.get("/{user_id}/similar/{document_id}")
async def find_similar(user_id: str, document_id: str):
    """Past documents similar to this one (vector search on MongoDB Atlas)."""
    try:
        db = mongo._get_db()
        embedding = None
        if db is not None:
            try:
                doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
                if doc:
                    embedding = doc.get("embedding")
            except Exception as exc:
                logger.warning("Could not fetch document %s for embedding: %s", document_id, exc)
        results = await mongo.find_similar(user_id, embedding)
        return results
    except Exception as exc:
        logger.warning("find_similar failed: %s", exc)
        return []
