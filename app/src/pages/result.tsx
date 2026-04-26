import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { DocumentPreview } from "@/components/document-preview";
import { ExplanationCard } from "@/components/explanation-card";
import { AudioPlayer } from "@/components/audio-player";
import { KeyFacts } from "@/components/key-facts";
import { SimilarLetters } from "@/components/similar-letters";
import { AgentTimeline } from "@/components/agent-timeline";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ExplainResponse } from "@/lib/api";
import { getLabels, getNativeName } from "@/lib/menu-labels";

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code } = useLanguage();
  const labels = getLabels(code);
  const data = location.state as ExplainResponse | null;
  const [callDialogOpen, setCallDialogOpen] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <p className="text-muted-foreground text-lg">
          {labels.resultNotFound}
        </p>
        <Link
          to="/capture"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {labels.resultTakeNew}
        </Link>
      </div>
    );
  }

  const langName = getNativeName(code ?? data.target_language);

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
        label={labels.explainedIn(langName)}
      />

      <KeyFacts facts={data.key_facts} />

      <AgentTimeline timing={data.pipeline_timing_ms} data={data} />

      <SimilarLetters documentIds={data.similar_past_documents} />

      <div className="pt-4 flex flex-col gap-3">
        <Button
          onClick={() => navigate("/save-history")}
          className="w-full h-14 text-base gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {labels.resultContinue}
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setCallDialogOpen(true)}
          variant="outline"
          className="w-full h-14 text-base gap-3 border-2"
        >
          <Phone className="w-5 h-5" />
          {labels.resultCallOffice}
        </Button>
      </div>

      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {labels.callDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-base">
              {labels.callDialogBody(langName)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
