"""Phone call endpoints — initiate live translated call to government office."""
from fastapi import APIRouter, WebSocket, HTTPException
from pydantic import BaseModel

router = APIRouter()


class StartCallRequest(BaseModel):
    user_id: str
    document_id: str
    target_phone: str
    user_language: str = "ro"


@router.post("/start")
async def start_call(req: StartCallRequest):
    """Initiate a Twilio call. Returns a call_id for websocket subscription."""
    # TODO: Twilio call.create with media stream URL pointing back to /calls/{id}/stream
    raise HTTPException(status_code=501, detail="not implemented")


@router.websocket("/{call_id}/stream")
async def call_stream(websocket: WebSocket, call_id: str):
    """Twilio Media Stream websocket — bidirectional translated audio + transcript."""
    await websocket.accept()
    # TODO: pump audio frames through ElevenLabs Conversational AI in both directions
    # TODO: push transcript chunks to frontend via this same socket
    await websocket.close(code=1011, reason="not implemented")
