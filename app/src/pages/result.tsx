import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowLeft } from "lucide-react";
import { DocumentPreview } from "@/components/document-preview";
import { ExplanationCard } from "@/components/explanation-card";
import { AudioPlayer } from "@/components/audio-player";
import { KeyFacts } from "@/components/key-facts";
import { SimilarLetters } from "@/components/similar-letters";
import { AgentTimeline } from "@/components/agent-timeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ExplainResponse } from "@/lib/api";

const LANGUAGE_NAMES: Record<string, string> = {
  "zh-CN": "Chinese",
  es: "Spanish",
  vi: "Vietnamese",
  ro: "Romanian",
};

export function ResultPage() {
  const location = useLocation();
  const data = location.state as ExplainResponse | null;
  const [callDialogOpen, setCallDialogOpen] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <p className="text-muted-foreground text-lg">
          Document not found
        </p>
        <Link
          to="/capture"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Take a new photo
        </Link>
      </div>
    );
  }

  const langName = LANGUAGE_NAMES[data.target_language] ?? data.target_language;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 max-w-2xl mx-auto pb-12"
    >
      <DocumentPreview src={data.original_photo_url} type={data.document_type} />

      <ExplanationCard
        translated={data.translated_explanation}
        english={data.english_explanation}
        targetLanguage={data.target_language}
      />

      <AudioPlayer
        src={data.audio_url}
        label={`Explained in ${langName}`}
      />

      <KeyFacts facts={data.key_facts} />

      <AgentTimeline timing={data.pipeline_timing_ms} data={data} />

      <SimilarLetters documentIds={data.similar_past_documents} />

      <div className="pt-4">
        <Button
          onClick={() => setCallDialogOpen(true)}
          variant="outline"
          className="w-full h-14 text-base gap-3 border-2"
        >
          <Phone className="w-5 h-5" />
          Call the office
        </Button>
      </div>

      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Live translated calls
            </DialogTitle>
            <DialogDescription className="text-base">
              Call any office with real-time translation — coming next.
              We'll connect you with an interpreter who speaks {langName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
