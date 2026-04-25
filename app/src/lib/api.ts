const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export type KeyFacts = {
  deadline: string | null;
  amount_due: string | null;
  action_required: string | null;
};

export type PipelineTiming = {
  cloudinary_upload: number | null;
  ocr: number | null;
  explanation: number | null;
  translation: number | null;
  tts: number | null;
  audio_upload: number | null;
  total: number | null;
};

export type ExplainResponse = {
  document_id: string;
  document_type: string;
  english_explanation: string;
  translated_explanation: string;
  target_language: string;
  audio_url: string;
  original_photo_url: string;
  enhanced_photo_url: string;
  key_facts: KeyFacts;
  similar_past_documents: string[];
  pipeline_timing_ms: PipelineTiming;
};

type ErrorDetail = {
  step: string;
  error: string;
  document_id: string;
};

export class ApiError extends Error {
  status: number;
  detail: ErrorDetail | string;

  constructor(status: number, detail: ErrorDetail | string) {
    const msg =
      typeof detail === "object"
        ? `Pipeline failed at ${detail.step}: ${detail.error}`
        : detail;
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function explainDocument(
  photo: File,
  userId: string,
  targetLanguage: string,
): Promise<ExplainResponse> {
  const form = new FormData();
  form.append("photo", photo);
  form.append("user_id", userId);
  form.append("target_language", targetLanguage);

  const res = await fetch(`${BACKEND_URL}/documents/explain`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(res.status, body.detail);
  }

  return res.json() as Promise<ExplainResponse>;
}
