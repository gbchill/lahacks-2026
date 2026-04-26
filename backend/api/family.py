"""Family memory endpoints — timeline + similar document search."""
import logging

from bson import ObjectId
from fastapi import APIRouter, Header, HTTPException

from services import mongo
from services.supabase_admin import verify_jwt

logger = logging.getLogger(__name__)

router = APIRouter()


def _extract_user(authorization: str) -> str:
    """Extract user_id from Bearer token; raise 401 if invalid."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    claims = verify_jwt(token)
    return claims["sub"]


@router.get("/timeline")
async def get_timeline(authorization: str = Header(...)):
    """All documents this family has ever received, newest first."""
    user_id = _extract_user(authorization)
    try:
        docs = await mongo.get_timeline(user_id)
        return docs
    except Exception as exc:
        logger.warning("get_timeline failed: %s", exc)
        return []


@router.get("/document/{document_id}")
async def get_document(document_id: str, authorization: str = Header(...)):
    """Fetch a single document by its document_id."""
    _extract_user(authorization)
    doc = await mongo.get_document_by_id(document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/similar/{document_id}")
async def find_similar(document_id: str, authorization: str = Header(...)):
    """Past documents similar to this one (vector search on MongoDB Atlas)."""
    user_id = _extract_user(authorization)
    try:
        db = mongo._get_db()
        embedding = None
        if db is not None:
            try:
                doc = await db["documents"].find_one({"_id": ObjectId(document_id)})
                if doc:
                    embedding = doc.get("embedding")
            except Exception as exc:
                logger.warning(
                    "Could not fetch document %s for embedding: %s", document_id, exc
                )
        results = await mongo.find_similar(user_id, embedding)
        return results
    except Exception as exc:
        logger.warning("find_similar failed: %s", exc)
        return []
