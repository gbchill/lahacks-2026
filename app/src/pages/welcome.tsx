import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic } from "lucide-react";
import { toast } from "sonner";
import { LanguageDropdown } from "@/components/language-picker";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { LANGUAGES } from "@/lib/languages";
import { useMicLanguageDetection } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const SUBTITLE_CYCLE = LANGUAGES.map((l) => {
  const labels = getLabels(l.code);
  return { code: l.code, text: labels.welcomeSubtitle };
});

export function WelcomePage() {
  const navigate = useNavigate();
  const { code, set } = useLanguage();
  const [pending, setPending] = useState<string | null>(code);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [detectedFlash, setDetectedFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const langRef = useRef(pending ?? code);
  langRef.current = pending ?? code;

  const { supported, listening, detecting, detectedLang, error, start, stop } =
    useMicLanguageDetection(4000);

  const busy = listening || detecting;

  // Subtitle cycling
  useEffect(() => {
    const id = window.setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % SUBTITLE_CYCLE.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  // Cleanup flash timer
  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, []);

  // Handle successful detection
  useEffect(() => {
    if (!detectedLang) return;
    setPending(detectedLang);
    setDetectedFlash(detectedLang);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setDetectedFlash(null), 2500);
  }, [detectedLang]);

  // Handle errors
  useEffect(() => {
    if (!error) return;
    const l = getLabels(langRef.current);
    if (error === "permission-denied") toast.error(l.voiceMicDenied);
    else if (error === "not-supported") toast.error(l.voiceNotSupported);
    else if (error === "detection-failed") toast.error(l.voiceNotDetected);
  }, [error]);

  const handleMicClick = () => {
    if (!supported) {
      toast.error(getLabels(langRef.current).voiceNotSupported);
      return;
    }
    if (listening) {
      stop();
      return;
    }
    if (detecting) return;
    setDetectedFlash(null);
    start();
  };

  const handleContinue = () => {
    if (!pending) return;
    set(pending);
    navigate("/", { replace: true });
  };

  const labels = getLabels(pending ?? code);
  const current = SUBTITLE_CYCLE[subtitleIndex];

  return (
    <div className="flex min-h-[80vh] flex-col items-center px-4 text-center">
      <div className="flex min-h-[62vh] w-full flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="w-full max-w-lg"
        >
          <h1 className="font-heading text-6xl sm:text-7xl text-foreground leading-[1.05]">
            Orision
          </h1>
          <div className="h-7 mt-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={current.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
                className="text-muted-foreground text-base tracking-wide"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="mt-10 flex w-full max-w-md items-stretch justify-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <LanguageDropdown
              value={pending}
              onChange={setPending}
              placeholder={labels.welcomeSubtitle}
            />
          </div>
          <button
            type="button"
            onClick={handleMicClick}
            disabled={!supported || detecting}
            aria-label={labels.voicePrompt}
            aria-pressed={listening}
            title={labels.voicePrompt}
            className={cn(
              "h-16 w-16 rounded-2xl border-2 flex items-center justify-center shrink-0",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              busy
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <Mic
              className={cn(
                "w-6 h-6 transition-colors duration-200",
                busy ? "text-primary" : "text-muted-foreground",
              )}
              strokeWidth={1.75}
            />
            {listening && (
              <span className="sr-only">{labels.voiceListening}</span>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: busy || detectedFlash ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="h-6 mt-3 flex items-center gap-2 text-sm"
          aria-live="polite"
        >
          {listening && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary">{labels.voiceListening}</span>
            </>
          )}
          {detecting && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary">{labels.voiceDetecting}</span>
            </>
          )}
          {detectedFlash && !busy && (
            <span className="text-green-600 font-medium">
              {labels.voiceDetected}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease }}
          className="mt-12"
        >
          <button
            type="button"
            onClick={handleContinue}
            disabled={!pending}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-14 px-10 text-lg font-medium rounded-full",
              "bg-primary text-primary-foreground transition-all",
              "hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {labels.welcomeContinue}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className="text-base text-muted-foreground/70 mt-auto pt-20 pb-8 max-w-sm leading-relaxed"
      >
        {labels.statText}
      </motion.p>
    </div>
  );
}
