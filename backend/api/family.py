"""Family memory endpoints — timeline + similar document search."""
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/{user_id}/timeline")
async def get_timeline(user_id: str):
    """All documents this family has ever received, newest first."""
    # TODO: fetch from MongoDB Atlas
    raise HTTPException(status_code=501, detail="not implemented")


@router.get("/{user_id}/similar/{document_id}")
async def find_similar(user_id: str, document_id: str):
    """Past documents similar to this one (vector search on MongoDB Atlas)."""
    # TODO: Atlas Vector Search query
    raise HTTPException(status_code=501, detail="not implemented")
