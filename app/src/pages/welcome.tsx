import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Mic } from "lucide-react";
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
    <main className="flex min-h-screen flex-col overflow-hidden bg-background px-6 py-10 sm:py-16">
      {/* Brand header — pinned to top-left of the viewport */}
      <header className="flex items-center justify-center gap-3">
        <span className="animate-orision-float h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Globe className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <span className="text-3xl tracking-tight text-foreground/70">
          Orision
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        {/* Hero + selector card */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="font-heading text-6xl sm:text-7xl leading-[1.05] tracking-tight text-balance text-foreground"
          >
            {labels.welcomeTitle}
          </motion.h1>

          <div className="h-9 sm:h-10 mt-5 overflow-hidden max-w-md">
            <AnimatePresence mode="wait">
              <motion.p
                key={current.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease }}
                className="text-xl sm:text-2xl text-foreground/75"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="mt-3 text-base text-muted-foreground max-w-md">
            {labels.voicePrompt}
          </p>

          {/* Selector card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className={cn(
              "mt-10 w-full max-w-lg rounded-3xl border border-border/60",
              "bg-card/80 backdrop-blur-sm p-5 sm:p-6",
            )}
            style={{
              boxShadow:
                "0 20px 60px -30px oklch(0.5 0.08 60 / 0.35)",
            }}
          >
            <label
              htmlFor="welcome-language"
              className="block text-base font-medium text-foreground/70 mb-3 text-start"
            >
              Your language
            </label>

            <div className="flex items-stretch gap-3">
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
                  "h-16 w-16 rounded-2xl border bg-background shadow-sm shrink-0",
                  "flex items-center justify-center cursor-pointer transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  listening
                    ? "border-primary/60 animate-orision-mic-pulse"
                    : "border-border hover:border-primary/40 hover:bg-accent",
                )}
              >
                <Mic
                  className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    listening ? "text-primary" : "text-foreground/70 group-hover:text-primary",
                  )}
                  strokeWidth={2}
                />
                {listening && (
                  <span className="sr-only">{labels.voiceListening}</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!pending}
              className={cn(
                "group mt-6 w-full h-16 rounded-2xl bg-primary text-primary-foreground",
                "text-xl font-semibold inline-flex items-center justify-center gap-2 cursor-pointer",
                "transition-all duration-200",
                "hover:bg-primary/90 hover:scale-[1.015]",
                "active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
              )}
              style={{
                boxShadow:
                  "0 14px 30px -12px oklch(0.853 0.044 233 / 0.6)",
              }}
            >
              {labels.welcomeContinue}
              <ArrowRight
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          </motion.div>

          {/* Listening / detecting / detected indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: busy || detectedFlash ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="h-6 mt-4 flex items-center gap-2 text-sm"
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
              <span className="text-primary">{labels.voiceDetecting}</span>
            )}
            {detectedFlash && !busy && (
              <span className="text-green-600 font-medium">{labels.voiceDetected}</span>
            )}
          </motion.div>
        </section>

        {/* Footer disclaimer */}
        <p className="mt-10 mx-auto max-w-xl text-center text-xs leading-relaxed text-muted-foreground/70">
          {labels.disclaimer}
        </p>
      </div>
    </main>
  );
}
