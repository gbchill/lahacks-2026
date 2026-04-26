const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export async function sendChatMessage(
  token: string,
  message: string,
  language: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  const res = await fetch(`${BACKEND_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, language, history }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(
      typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail),
    );
  }
  return res.json() as Promise<ChatResponse>;
}
