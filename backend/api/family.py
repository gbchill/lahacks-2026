"""Family memory endpoints — timeline + similar document search."""
import asyncio
import logging

from bson import ObjectId
from fastapi import APIRouter, Header, HTTPException

from services import cloudinary_admin, mongo
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


@router.delete("/document/{document_id}")
async def delete_document(document_id: str, authorization: str = Header(...)):
    """Delete a document and its Cloudinary assets. Only the owner can delete."""
    user_id = _extract_user(authorization)
    deleted_doc = await mongo.delete_document(document_id, user_id)
    if deleted_doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    cleanup_tasks = []
    photo_public_id = deleted_doc.get("photo_public_id")
    if not photo_public_id:
        photo_url = deleted_doc.get("original_photo_url", "")
        if photo_url:
            photo_public_id = cloudinary_admin.extract_public_id_from_url(photo_url)
    if photo_public_id:
        cleanup_tasks.append(cloudinary_admin.delete_asset(photo_public_id, "image"))
    audio_public_id = f"orision/{user_id}/audio/explanation_{document_id}"
    cleanup_tasks.append(cloudinary_admin.delete_asset(audio_public_id, "video"))

    if cleanup_tasks:
        try:
            await asyncio.gather(*cleanup_tasks)
        except Exception as exc:
            logger.warning("Cloudinary cleanup failed (non-critical) doc_id=%s: %s", document_id, exc)

    return {"deleted": True, "document_id": document_id}


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
