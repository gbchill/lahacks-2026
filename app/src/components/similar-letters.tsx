import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { fetchDocument, type TimelineDoc } from "@/lib/family-api";

type SimilarLettersProps = {
  documentIds: string[];
  token?: string;
};

function docTypeLabel(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SimilarLetters({ documentIds, token }: SimilarLettersProps) {
  const { code } = useLanguage();
  const labels = getLabels(code);
  const [docs, setDocs] = useState<Record<string, TimelineDoc>>({});

  useEffect(() => {
    if (!token || documentIds.length === 0) return;
    documentIds.forEach((id) => {
      fetchDocument(token, id)
        .then((doc) => setDocs((prev) => ({ ...prev, [id]: doc })))
        .catch(() => {});
    });
  }, [documentIds, token]);

  if (documentIds.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {labels.similarHeading}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {documentIds.map((id) => {
          const doc = docs[id];
          return (
            <Link
              key={id}
              to={`/result/${id}`}
              state={
                doc
                  ? {
                      document_id: doc.document_id ?? id,
                      document_type: doc.document_type,
                      english_explanation: doc.english_explanation,
                      translated_explanation: doc.translated_explanation ?? "",
                      target_language: doc.target_language ?? "",
                      audio_url: doc.audio_url ?? "",
                      original_photo_url: doc.original_photo_url ?? "",
                      enhanced_photo_url: doc.enhanced_photo_url ?? "",
                      key_facts: doc.key_facts ?? {},
                      similar_past_documents: [],
                      pipeline_timing_ms: {},
                    }
                  : undefined
              }
              className="flex-shrink-0 w-44 rounded-xl border border-border bg-card p-3 active:scale-[0.97] transition-transform"
              aria-label={`Past document ${id.slice(0, 8)}`}
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
              </div>
              {doc ? (
                <>
                  <Badge className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full mb-1">
                    {docTypeLabel(doc.document_type)}
                  </Badge>
                  <p className="text-xs text-muted-foreground truncate">
                    {doc.english_explanation.slice(0, 60)}...
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {id.slice(0, 8)}...
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
