"""Voice endpoints — clone user voice via ElevenLabs IVC."""
from fastapi import APIRouter, File, Header, HTTPException, UploadFile

from services.elevenlabs import clone_voice
from services.supabase_admin import verify_jwt

router = APIRouter()


@router.post("/clone")
async def clone_user_voice(
    audio: UploadFile = File(...),
    authorization: str = Header(...),
):
    """Clone the authenticated user's voice from an uploaded audio sample."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    claims = verify_jwt(token)
    user_id = claims["sub"]
    user_metadata = claims.get("user_metadata", {}) or {}
    name = user_metadata.get("name") or f"user-{user_id[:8]}"

    audio_bytes = await audio.read()
    voice_id = await clone_voice(name, audio_bytes)
    return {"voice_id": voice_id}
