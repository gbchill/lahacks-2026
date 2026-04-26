const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export type LanguageDetectionResult = {
  language_code: string;
  language_name: string;
  confidence: number;
};

export async function detectLanguageFromAudio(
  audioBlob: Blob,
): Promise<LanguageDetectionResult> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${BACKEND_URL}/language/detect`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Language detection failed: ${res.status}`);
  }

  return res.json() as Promise<LanguageDetectionResult>;
}
