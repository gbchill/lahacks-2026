import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchTimeline, type TimelineDoc } from "@/lib/family-api";

const USER_ID = "demo-user";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function docTypeLabel(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-[#E8E0D5]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#F5EDE6" }}
        aria-hidden="true"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C45D3E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h3 className="font-heading text-2xl text-[#2A1F1A] mb-3">
        No documents yet
      </h3>
      <p className="text-[#6B5B52] text-lg leading-relaxed max-w-xs">
        Upload your first document to get started. We'll keep a clear record of
        everything here for your family.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#FDE8E8" }}
        aria-hidden="true"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C45D3E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-heading text-2xl text-[#2A1F1A] mb-3">
        Couldn't load documents
      </h3>
      <p className="text-[#6B5B52] text-lg mb-6 max-w-xs">
        There was a problem connecting to the server. Please try again.
      </p>
      <Button
        onClick={onRetry}
        className="bg-[#C45D3E] hover:bg-[#A84C30] text-white px-8 py-3 text-lg h-auto"
      >
        Try again
      </Button>
    </div>
  );
}

function TimelineCard({ doc }: { doc: TimelineDoc }) {
  const [audioOpen, setAudioOpen] = useState(false);
  const snippet =
    doc.english_explanation.length > 180
      ? doc.english_explanation.slice(0, 180).trimEnd() + "…"
      : doc.english_explanation;

  return (
    <Card className="border border-[#E8E0D5] bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            className="text-white text-sm font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: "#C45D3E" }}
          >
            {docTypeLabel(doc.document_type)}
          </Badge>
          <time
            className="text-[#6B5B52] text-base"
            dateTime={doc.created_at}
          >
            {formatDate(doc.created_at)}
          </time>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p className="text-[#2A1F1A] text-lg leading-relaxed mb-4">{snippet}</p>
        {doc.audio_url && (
          <div>
            {audioOpen ? (
              <audio
                controls
                autoPlay={false}
                className="w-full mt-1"
                aria-label={`Audio explanation for ${docTypeLabel(doc.document_type)}`}
              >
                <source src={doc.audio_url} type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#C45D3E] text-[#C45D3E] hover:bg-[#F5EDE6] text-base h-auto py-2 px-4"
                onClick={() => setAudioOpen(true)}
                aria-label={`Play audio explanation for ${docTypeLabel(doc.document_type)}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-2 shrink-0"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Play explanation
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FamilyPage() {
  const [docs, setDocs] = useState<TimelineDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetchTimeline(USER_ID)
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main
      className="min-h-screen px-4 py-8 max-w-2xl mx-auto"
      style={{ backgroundColor: "#FDFBF7" }}
    >
      <header className="mb-8">
        <h1 className="font-heading text-4xl text-[#2A1F1A] leading-tight mb-2">
          Family Documents
        </h1>
        <p className="text-[#6B5B52] text-lg">
          A clear record of every document your family has received.
        </p>
      </header>

      {loading && <TimelineSkeleton />}

      {!loading && error && <ErrorState onRetry={load} />}

      {!loading && !error && docs.length === 0 && <EmptyState />}

      {!loading && !error && docs.length > 0 && (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <ol
            className="space-y-4 pr-2"
            aria-label="Document timeline"
          >
            {docs.map((doc) => (
              <li key={doc._id}>
                <TimelineCard doc={doc} />
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </main>
  );
}
