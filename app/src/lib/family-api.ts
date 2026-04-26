const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:8000";

export interface TimelineDoc {
  _id: string;
  document_id?: string;
  document_type: string;
  english_explanation: string;
  translated_explanation?: string;
  target_language?: string;
  created_at: string;
  audio_url?: string;
  enhanced_photo_url?: string;
  original_photo_url?: string;
  key_facts?: Record<string, string | undefined>;
}

export interface SimilarDoc {
  _id: string;
  document_id?: string;
  document_type: string;
  english_explanation: string;
  created_at: string;
  score?: number;
}

export async function fetchTimeline(token: string): Promise<TimelineDoc[]> {
  const res = await fetch(`${BACKEND_URL}/family/timeline`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch timeline: ${res.status}`);
  }
  return res.json() as Promise<TimelineDoc[]>;
}

export async function fetchDocument(
  token: string,
  documentId: string,
): Promise<TimelineDoc> {
  const res = await fetch(`${BACKEND_URL}/family/document/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch document: ${res.status}`);
  }
  return res.json() as Promise<TimelineDoc>;
}

export async function deleteDocument(
  token: string,
  documentId: string,
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/family/document/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Delete failed: ${res.status}`);
  }
}

export async function fetchSimilar(
  token: string,
  documentId: string,
): Promise<SimilarDoc[]> {
  const res = await fetch(`${BACKEND_URL}/family/similar/${documentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch similar documents: ${res.status}`);
  }
  return res.json() as Promise<SimilarDoc[]>;
}
