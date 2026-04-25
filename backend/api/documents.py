"""Document endpoints — photo → OCR → translation → audio explanation."""
from fastapi import APIRouter, UploadFile, File, HTTPException

from models.schemas import ExplainResponse

router = APIRouter()


@router.post("/explain", response_model=ExplainResponse)
async def explain_document(
    photo: UploadFile = File(...),
    target_language: str = "ro",
    user_id: str | None = None,
):
    """Photo of a document → structured explanation + audio URL in target language."""
    # TODO: pipeline
    # 1. Upload to Cloudinary, apply enhancement transforms
    # 2. Send enhanced URL to Gemini Vision for OCR
    # 3. Pass OCR + user history to Fetch.ai Parser → Context → Drafter → Translator
    # 4. Send translated explanation to ElevenLabs TTS with cloned voice
    # 5. Persist document + embedding to MongoDB Atlas
    raise HTTPException(status_code=501, detail="not implemented")
