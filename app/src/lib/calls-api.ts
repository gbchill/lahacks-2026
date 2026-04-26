const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:8000";

/** Convert an http(s) base URL to a ws(s) URL for WebSocket connections. */
const WS_URL = BACKEND_URL.replace(/^https:\/\//, "wss://").replace(
  /^http:\/\//,
  "ws://",
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallStartResponse = {
  call_id: string;
  status: string;
};

export type TranscriptMessage =
  | {
      type: "transcript";
      speaker: "caller" | "agent";
      text: string;
      language: string;
    }
  | {
      type: "status";
      status: "connecting" | "active" | "ended";
      call_id: string;
    }
  | {
      type: "error";
      detail: string;
    }
  | {
      type: "pong";
    };

// ─── API functions ─────────────────────────────────────────────────────────────

/**
 * Start a live translated call to the given phone number.
 * Returns a call_id that can be used to subscribe to transcripts.
 */
export async function startCall(
  userId: string,
  documentId: string,
  targetPhone: string,
  userLanguage: string,
): Promise<CallStartResponse> {
  const res = await fetch(`${BACKEND_URL}/calls/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      document_id: documentId,
      target_phone: targetPhone,
      user_language: userLanguage,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(
      typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail),
    );
  }

  return res.json() as Promise<CallStartResponse>;
}

/**
 * Open a WebSocket that streams live transcript events for a call.
 * The socket emits TranscriptMessage JSON objects.
 * The caller is responsible for closing the socket when done.
 */
export function connectTranscript(callId: string): WebSocket {
  return new WebSocket(`${WS_URL}/calls/${callId}/transcript`);
}
