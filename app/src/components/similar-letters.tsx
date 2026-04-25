import { FileText } from "lucide-react";

type SimilarLettersProps = {
  documentIds: string[];
};

export function SimilarLetters({ documentIds }: SimilarLettersProps) {
  if (documentIds.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        We've seen letters like this before
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {documentIds.map((id) => (
          <div
            key={id}
            className="flex-shrink-0 w-40 rounded-xl border border-border bg-card p-3"
            aria-label={`Past document ${id.slice(0, 8)}`}
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {id.slice(0, 8)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
