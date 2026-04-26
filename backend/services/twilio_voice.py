"""Twilio — phone calls, SMS, Media Streams."""
import asyncio
import os

from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream


def _build_stream_twiml(websocket_url: str) -> str:
    """Build TwiML that connects the call to a Media Stream websocket."""
    response = VoiceResponse()
    connect = Connect()
    connect.stream(url=websocket_url)
    response.append(connect)
    return str(response)


def _initiate_call_sync(
    to_number: str,
    from_number: str,
    websocket_url: str,
    account_sid: str,
    auth_token: str,
) -> str:
    """Synchronous Twilio call.create — run via asyncio.to_thread."""
    client = Client(account_sid, auth_token)
    twiml = _build_stream_twiml(websocket_url)
    call = client.calls.create(
        to=to_number,
        from_=from_number,
        twiml=twiml,
    )
    return call.sid


async def initiate_call(to_number: str, from_number: str, websocket_url: str) -> str:
    """Initiate a Twilio phone call with a Media Stream URL.

    Returns the Twilio call SID.
    Raises RuntimeError if Twilio env vars are not configured.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")

    if not account_sid or not auth_token:
        raise RuntimeError("Twilio credentials not configured")

    call_sid = await asyncio.to_thread(
        _initiate_call_sync,
        to_number,
        from_number,
        websocket_url,
        account_sid,
        auth_token,
    )
    return call_sid


def _send_sms_sync(
    to_number: str,
    body: str,
    from_number: str,
    account_sid: str,
    auth_token: str,
) -> str:
    """Synchronous Twilio messages.create — run via asyncio.to_thread."""
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        to=to_number,
        from_=from_number,
        body=body,
    )
    return message.sid


async def send_sms(to_number: str, body: str) -> str:
    """Send an SMS via Twilio.

    Returns the Twilio message SID.
    Raises RuntimeError if Twilio env vars are not configured.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid or not auth_token or not from_number:
        raise RuntimeError("Twilio credentials not configured")

    message_sid = await asyncio.to_thread(
        _send_sms_sync,
        to_number,
        body,
        from_number,
        account_sid,
        auth_token,
    )
    return message_sid
