const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface TimelineDoc {
  _id: string;
  document_id?: string;
  document_type: string;
  english_explanation: string;
  created_at: string;
  audio_url?: string;
  enhanced_photo_url?: string;
  original_photo_url?: string;
}

export interface SimilarDoc {
  _id: string;
  document_id?: string;
  document_type: string;
  english_explanation: string;
  created_at: string;
  score?: number;
}

export async function fetchTimeline(userId: string): Promise<TimelineDoc[]> {
  const res = await fetch(`${BACKEND_URL}/family/${userId}/timeline`);
  if (!res.ok) {
    throw new Error(`Failed to fetch timeline: ${res.status}`);
  }
  return res.json() as Promise<TimelineDoc[]>;
}

export async function fetchSimilar(
  userId: string,
  documentId: string,
): Promise<SimilarDoc[]> {
  const res = await fetch(
    `${BACKEND_URL}/family/${userId}/similar/${documentId}`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch similar documents: ${res.status}`);
  }
  return res.json() as Promise<SimilarDoc[]>;
}
