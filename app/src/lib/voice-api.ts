const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:8000";

/**
 * Clone the user's voice via the backend ElevenLabs IVC endpoint.
 * Requires an authenticated Supabase JWT token.
 *
 * @param audioBlob - Recorded audio sample (any format accepted by ElevenLabs)
 * @param token - Supabase session access_token
 * @returns ElevenLabs voice_id for the cloned voice
 */
export async function cloneVoice(audioBlob: Blob, token: string): Promise<string> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${BACKEND_URL}/voice/clone`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Voice clone failed" }));
    throw new Error(typeof body.detail === "string" ? body.detail : "Voice clone failed");
  }

  const data = await res.json() as { voice_id: string };
  return data.voice_id;
}
