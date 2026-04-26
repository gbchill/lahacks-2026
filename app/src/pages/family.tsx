import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchTimeline, deleteDocument, type TimelineDoc } from "@/lib/family-api";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

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
        <div
          key={i}
          className="rounded-2xl bg-white/5 animate-pulse p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-24 rounded-full bg-white/10" />
            <div className="h-4 w-32 rounded bg-white/10" />
          </div>
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] text-center px-6 py-10",
        "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5",
      )}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No documents yet
      </h3>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
        Upload your first document to get started. We'll keep a clear record of
        everything here for your family.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] text-center px-6 py-10",
        "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5",
      )}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Couldn't load documents
      </h3>
      <p className="text-base text-muted-foreground mb-5 max-w-xs">
        There was a problem connecting to the server. Please try again.
      </p>
      <Button
        onClick={onRetry}
        className="rounded-xl bg-primary text-primary-foreground h-12 px-6 font-medium hover:brightness-105 transition-all"
      >
        Try again
      </Button>
    </div>
  );
}

function UnauthenticatedState() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] text-center px-6 py-10",
        "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5",
      )}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Sign in to view your documents
      </h3>
      <p className="text-base text-muted-foreground mb-5 max-w-xs">
        Create a free account to keep a record of every document your family has received.
      </p>
      <Link
        to="/login"
        className="rounded-xl bg-primary text-primary-foreground h-12 px-6 font-medium hover:brightness-105 transition-all inline-flex items-center justify-center text-sm"
      >
        Sign in
      </Link>
    </div>
  );
}

function TimelineCard({
  doc,
  onDeleteRequest,
}: {
  doc: TimelineDoc;
  onDeleteRequest: (docId: string) => void;
}) {
  const docId = doc.document_id || doc._id;
  const snippet =
    doc.english_explanation.length > 180
      ? doc.english_explanation.slice(0, 180).trimEnd() + "…"
      : doc.english_explanation;

  return (
    <div className="relative group rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5">
      <Link
        to={`/result/${docId}`}
        state={{
          document_id: docId,
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
        }}
        className="block px-5 pt-4 pb-5 pr-14 active:scale-[0.98] transition-transform"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
            {docTypeLabel(doc.document_type)}
          </Badge>
          <time
            className="text-muted-foreground text-base"
            dateTime={doc.created_at}
          >
            {formatDate(doc.created_at)}
          </time>
        </div>
        <p className="text-foreground text-base leading-relaxed">{snippet}</p>
      </Link>
      <button
        type="button"
        onClick={() => onDeleteRequest(docId)}
        aria-label="Delete document"
        className="absolute top-3 right-3 w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function FamilyPage() {
  const { user, session } = useAuth();
  const [docs, setDocs] = useState<TimelineDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(false);
    fetchTimeline(session.access_token)
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  async function handleDelete(docId: string) {
    if (!session?.access_token) return;
    const previous = docs;
    setDocs((prev) => prev.filter((d) => (d.document_id || d._id) !== docId));
    setDeletingId(null);
    setDeleteError(null);
    try {
      await deleteDocument(session.access_token, docId);
    } catch (err) {
      setDocs(previous);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete document",
      );
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      load();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your documents
        </h1>
      </motion.header>

      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-base flex items-center justify-between"
          >
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              aria-label="Dismiss error"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!user && <UnauthenticatedState />}

      {user && loading && <TimelineSkeleton />}

      {user && !loading && error && <ErrorState onRetry={load} />}

      {user && !loading && !error && docs.length === 0 && <EmptyState />}

      {user && !loading && !error && docs.length > 0 && (
        <ol className="space-y-4" aria-label="Document timeline">
          <AnimatePresence mode="popLayout">
            {docs.map((doc, i) => (
              <motion.li
                key={doc.document_id || doc._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
              >
                <TimelineCard doc={doc} onDeleteRequest={setDeletingId} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      <Dialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              This will permanently remove the document and its audio
              explanation. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              className="h-12 text-base"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <DialogClose
              render={
                <Button variant="outline" className="h-12 text-base" />
              }
            >
              Keep it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
