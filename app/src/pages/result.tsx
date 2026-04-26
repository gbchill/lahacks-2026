import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowLeft, PhoneOff, Loader2, PhoneCall, CheckCircle2, X } from "lucide-react";
import { DocumentPreview } from "@/components/document-preview";
import { ExplanationCard } from "@/components/explanation-card";
import { AudioPlayer } from "@/components/audio-player";
import { KeyFacts } from "@/components/key-facts";
import { SimilarLetters } from "@/components/similar-letters";
import { AgentTimeline } from "@/components/agent-timeline";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  startCall,
  connectTranscript,
  type TranscriptMessage,
} from "@/lib/calls-api";

type CallStatus = "idle" | "connecting" | "active" | "ended";

type TranscriptLine = {
  speaker: "caller" | "agent";
  text: string;
  language: string;
};

export function ResultPage() {
  const location = useLocation();
  const { code } = useLanguage();
  const { user, session } = useAuth();
  const labels = getLabels(code);
  const data = location.state as ExplainResponse | null;
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [savePromptDismissed, setSavePromptDismissed] = useState(false);

  // Call state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [, setCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [callError, setCallError] = useState<string | null>(null);
  const transcriptWsRef = useRef<WebSocket | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Clean up websocket when dialog closes
  function handleDialogClose(open: boolean) {
    if (!open) {
      transcriptWsRef.current?.close();
      transcriptWsRef.current = null;
    }
    setCallDialogOpen(open);
  }

  async function handleStartCall() {
    if (!data || !phoneNumber.trim()) return;
    setCallError(null);
    setCallStatus("connecting");
    setTranscript([]);

    try {
      const res = await startCall(
        user?.id ?? "anonymous",
        data.document_id,
        phoneNumber.trim(),
        data.target_language,
        session?.access_token,
      );
      setCallId(res.call_id);

      // Open transcript websocket
      const ws = connectTranscript(res.call_id);
      transcriptWsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as TranscriptMessage;
          if (msg.type === "status") {
            setCallStatus(msg.status as CallStatus);
          } else if (msg.type === "transcript") {
            setTranscript((prev) => [
              ...prev,
              { speaker: msg.speaker, text: msg.text, language: msg.language },
            ]);
          } else if (msg.type === "error") {
            setCallError(msg.detail);
            setCallStatus("ended");
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        setCallError("Connection error — please try again.");
        setCallStatus("ended");
      };

      ws.onclose = () => {
        setCallStatus((prev) => (prev !== "ended" ? "ended" : prev));
      };
    } catch (err) {
      setCallError(err instanceof Error ? err.message : "Failed to start call");
      setCallStatus("idle");
    }
  }

  function handleEndCall() {
    transcriptWsRef.current?.close();
    transcriptWsRef.current = null;
    setCallStatus("ended");
  }

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
      <DocumentPreview src={data.original_photo_url} enhancedSrc={data.enhanced_photo_url} type={data.document_type} />

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

      <SimilarLetters documentIds={data.similar_past_documents} token={session?.access_token} />

      <div className="pt-4 flex flex-col gap-3">
        {/* Auth-aware save section */}
        {user ? (
          /* Signed in: show "Saved" badge */
          <div className="flex items-center gap-3 rounded-xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 px-5 py-4">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-medium text-foreground">{labels.resultSaved}</span>
          </div>
        ) : !savePromptDismissed ? (
          /* Not signed in: show save prompt card */
          <div className="rounded-xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-semibold text-foreground leading-snug">
                {labels.resultSavePrompt}
              </p>
              <button
                type="button"
                onClick={() => setSavePromptDismissed(true)}
                aria-label={labels.resultNotNow}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex gap-3">
              <Link
                to="/signup"
                className="flex-1 rounded-xl bg-primary text-primary-foreground h-12 px-6 font-medium hover:brightness-105 transition-all inline-flex items-center justify-center text-sm"
              >
                {labels.resultCreateAccount}
              </Link>
              <button
                type="button"
                onClick={() => setSavePromptDismissed(true)}
                className="rounded-xl text-muted-foreground hover:bg-white/5 transition-colors px-4 h-12 text-sm"
              >
                {labels.resultNotNow}
              </button>
            </div>
          </div>
        ) : null}

        <Button
          onClick={() => setCallDialogOpen(true)}
          variant="outline"
          className="w-full h-14 text-base gap-3 border-2"
        >
          <Phone className="w-5 h-5" />
          {labels.resultCallOffice}
        </Button>
      </div>

      <Dialog open={callDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {labels.callDialogTitle}
            </DialogTitle>
            <DialogDescription className="text-base">
              {labels.callDialogBody(langName)}
            </DialogDescription>
          </DialogHeader>

          {/* Status pill */}
          <div className="flex items-center gap-2">
            {callStatus === "idle" && (
              <Badge variant="outline">{labels.callReady}</Badge>
            )}
            {callStatus === "connecting" && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {labels.callConnecting}
              </Badge>
            )}
            {callStatus === "active" && (
              <Badge variant="default" className="gap-1">
                <PhoneCall className="w-3 h-3" />
                {labels.callActive}
              </Badge>
            )}
            {callStatus === "ended" && (
              <Badge variant="outline">{labels.callEnded}</Badge>
            )}
          </div>

          {/* Phone number input — shown when idle or after a call ended */}
          {(callStatus === "idle" || callStatus === "ended") && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone-input"
                className="text-sm font-medium text-foreground"
              >
                {labels.callPhoneLabel}
              </label>
              <Input
                id="phone-input"
                type="tel"
                placeholder="+1-800-555-0123"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-11 text-base"
                disabled={(callStatus as string) === "connecting" || (callStatus as string) === "active"}
              />
            </div>
          )}

          {/* Error message */}
          {callError && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {callError}
            </p>
          )}

          {/* Transcript viewer — shown during/after a call */}
          {(callStatus === "active" ||
            callStatus === "ended" ||
            transcript.length > 0) && (
            <ScrollArea className="h-52 rounded-lg border bg-muted/30 p-3">
              {transcript.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {labels.callWaitingAudio}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {transcript.map((line, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-0.5 ${
                        line.speaker === "agent" ? "items-end" : "items-start"
                      }`}
                    >
                      <Badge
                        variant={
                          line.speaker === "agent" ? "default" : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {line.speaker === "agent" ? labels.callOfficeLabel : labels.callYouLabel}
                        {" · "}
                        {line.language}
                      </Badge>
                      <p
                        className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                          line.speaker === "agent"
                            ? "bg-primary/10 text-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {line.text}
                      </p>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </ScrollArea>
          )}

          <DialogFooter showCloseButton>
            {callStatus === "idle" && (
              <Button
                onClick={handleStartCall}
                disabled={!phoneNumber.trim()}
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                {labels.callStart}
              </Button>
            )}
            {callStatus === "connecting" && (
              <Button disabled className="gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {labels.callConnecting}
              </Button>
            )}
            {callStatus === "active" && (
              <Button
                onClick={handleEndCall}
                variant="destructive"
                className="gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                {labels.callEnd}
              </Button>
            )}
            {callStatus === "ended" && (
              <Button
                onClick={() => {
                  setCallStatus("idle");
                  setTranscript([]);
                  setCallId(null);
                  setCallError(null);
                }}
                variant="outline"
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                {labels.callAgain}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
