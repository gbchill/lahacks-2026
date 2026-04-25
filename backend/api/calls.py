"""Phone call endpoints — initiate live translated call to government office."""
import json
import logging
import os
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
from pydantic import BaseModel

from backend.services import twilio_voice

logger = logging.getLogger(__name__)

router = APIRouter()

# Module-level call state: call_id → call metadata
active_calls: dict[str, dict[str, Any]] = {}

# Frontend transcript subscribers: call_id → set of WebSocket connections
transcript_subscribers: dict[str, set[WebSocket]] = {}

# Accumulated transcript lines: call_id → list of transcript dicts
call_transcripts: dict[str, list[dict[str, Any]]] = {}


class StartCallRequest(BaseModel):
    user_id: str
    document_id: str
    target_phone: str
    user_language: str = "ro"


async def _broadcast_transcript(call_id: str, event: dict[str, Any]) -> None:
    """Push a transcript event to all frontend subscribers for this call."""
    subscribers = transcript_subscribers.get(call_id, set())
    dead: set[WebSocket] = set()
    for ws in list(subscribers):
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.add(ws)
    for ws in dead:
        subscribers.discard(ws)


@router.post("/start")
async def start_call(req: StartCallRequest, request: Request):
    """Initiate a Twilio call. Returns a call_id for websocket subscription."""
    # Validate Twilio configuration
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not from_number:
        raise HTTPException(status_code=503, detail="Twilio not configured")

    call_id = str(uuid4())

    # Store call state
    active_calls[call_id] = {
        "user_id": req.user_id,
        "document_id": req.document_id,
        "target_phone": req.target_phone,
        "user_language": req.user_language,
        "status": "connecting",
        "call_sid": None,
    }
    call_transcripts[call_id] = []
    transcript_subscribers[call_id] = set()

    # Build the websocket stream URL from the incoming request's base URL
    base_url = str(request.base_url).rstrip("/")
    # Twilio Media Streams require wss:// — convert http(s) → ws(s)
    ws_base = base_url.replace("https://", "wss://").replace("http://", "ws://")
    websocket_url = f"{ws_base}/calls/{call_id}/stream"

    try:
        call_sid = await twilio_voice.initiate_call(
            to_number=req.target_phone,
            from_number=from_number,
            websocket_url=websocket_url,
        )
        active_calls[call_id]["call_sid"] = call_sid
        logger.info("Twilio call initiated: call_id=%s sid=%s", call_id, call_sid)
    except Exception as exc:
        active_calls[call_id]["status"] = "failed"
        logger.error("Failed to initiate Twilio call: %s", exc)
        raise HTTPException(status_code=500, detail=f"Failed to start call: {exc}") from exc

    return {"call_id": call_id, "status": "connecting"}


@router.websocket("/{call_id}/stream")
async def call_stream(websocket: WebSocket, call_id: str):
    """Twilio Media Stream websocket — receives audio frames from the Twilio platform.

    Handles the Twilio Media Streams protocol:
      - "connected" event: connection established
      - "start"    event: stream metadata (accountSid, callSid, tracks, etc.)
      - "media"    event: base64-encoded μ-law 8kHz audio chunk
      - "stop"     event: call ended
    """
    await websocket.accept()

    if call_id not in active_calls:
        await websocket.close(code=1008, reason="unknown call_id")
        return

    active_calls[call_id]["status"] = "active"
    await _broadcast_transcript(
        call_id,
        {"type": "status", "status": "active", "call_id": call_id},
    )

    audio_frame_count = 0

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            event = msg.get("event", "")

            if event == "connected":
                logger.info("Twilio stream connected for call %s", call_id)

            elif event == "start":
                stream_sid = msg.get("streamSid", "")
                logger.info(
                    "Twilio stream started for call %s, streamSid=%s", call_id, stream_sid
                )
                active_calls[call_id]["stream_sid"] = stream_sid

            elif event == "media":
                # Payload: {"event": "media", "sequenceNumber": "...", "media": {"track": "inbound", "chunk": "...", "timestamp": "...", "payload": "<base64>"}}
                audio_frame_count += 1
                media = msg.get("media", {})
                track = media.get("track", "inbound")

                # For hackathon demo: log every 50th frame to avoid flooding
                if audio_frame_count % 50 == 0:
                    logger.debug(
                        "call %s: received %d audio frames (track=%s)",
                        call_id,
                        audio_frame_count,
                        track,
                    )

                # Placeholder transcript simulation: push a frame-count update
                # In production this would pipe through ElevenLabs STT → translation → TTS
                if audio_frame_count % 100 == 0:
                    transcript_event = {
                        "type": "transcript",
                        "speaker": "caller" if track == "inbound" else "agent",
                        "text": f"[Audio received — {audio_frame_count} frames]",
                        "language": active_calls[call_id].get("user_language", "en"),
                    }
                    call_transcripts[call_id].append(transcript_event)
                    await _broadcast_transcript(call_id, transcript_event)

            elif event == "stop":
                logger.info("Twilio stream stopped for call %s", call_id)
                active_calls[call_id]["status"] = "ended"
                await _broadcast_transcript(
                    call_id,
                    {"type": "status", "status": "ended", "call_id": call_id},
                )
                break

    except WebSocketDisconnect:
        logger.info("Twilio stream websocket disconnected for call %s", call_id)
    except Exception as exc:
        logger.error("Error in stream for call %s: %s", call_id, exc)
    finally:
        active_calls.get(call_id, {})["status"] = "ended"
        # Notify frontend subscribers that the call ended
        await _broadcast_transcript(
            call_id,
            {"type": "status", "status": "ended", "call_id": call_id},
        )


@router.websocket("/{call_id}/transcript")
async def call_transcript(websocket: WebSocket, call_id: str):
    """Frontend websocket — subscribe to live transcript events for a call.

    Pushes JSON events:
      {"type": "transcript", "speaker": "caller"|"agent", "text": "...", "language": "..."}
      {"type": "status",     "status": "connecting"|"active"|"ended", "call_id": "..."}

    On connect, replays all transcript lines collected so far, then streams live events.
    """
    await websocket.accept()

    if call_id not in active_calls:
        await websocket.send_text(
            json.dumps({"type": "error", "detail": "unknown call_id"})
        )
        await websocket.close(code=1008, reason="unknown call_id")
        return

    # Register subscriber
    transcript_subscribers.setdefault(call_id, set()).add(websocket)

    # Send current status
    current_status = active_calls[call_id].get("status", "connecting")
    await websocket.send_text(
        json.dumps({"type": "status", "status": current_status, "call_id": call_id})
    )

    # Replay existing transcript lines
    for line in call_transcripts.get(call_id, []):
        try:
            await websocket.send_text(json.dumps(line))
        except Exception:
            break

    # Keep connection alive until the frontend disconnects
    try:
        while True:
            # We don't expect messages from the frontend on this channel,
            # but we need to await something so the connection stays open.
            data = await websocket.receive_text()
            # If frontend sends "ping" we respond with "pong"
            if data.strip() == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.debug("Transcript subscriber disconnected for call %s: %s", call_id, exc)
    finally:
        transcript_subscribers.get(call_id, set()).discard(websocket)
