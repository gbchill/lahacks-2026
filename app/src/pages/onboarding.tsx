import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Square, Check, Users, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLabels } from "@/lib/menu-labels";
import { VOICE_PASSAGES } from "@/lib/voice-passages";
import { useLanguage } from "@/contexts/language-context";
import { LanguageDropdown } from "@/components/language-picker";
import { supabase } from "@/lib/supabase";

type Relationship = "parent" | "child" | "family";

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const SLIDE_TRANSITION = {
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1],
};

// ───────────────────────────────────────────────
// Progress dots
// ───────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i === current
              ? "bg-primary w-5"
              : i < current
              ? "bg-primary/50"
              : "bg-white/10",
          )}
        />
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────
// Step 1 — Profile
// ───────────────────────────────────────────────
function StepProfile({
  name,
  setName,
  relationship,
  setRelationship,
  onContinue,
  labels,
}: {
  name: string;
  setName: (v: string) => void;
  relationship: Relationship | null;
  setRelationship: (v: Relationship) => void;
  onContinue: () => void;
  labels: ReturnType<typeof getLabels>;
}) {
  const options: { id: Relationship; label: string; icon: React.ReactNode }[] =
    [
      { id: "parent", label: labels.onboardingParent, icon: <User className="w-5 h-5" /> },
      { id: "child", label: labels.onboardingChild, icon: <Heart className="w-5 h-5" /> },
      { id: "family", label: labels.onboardingFamily, icon: <Users className="w-5 h-5" /> },
    ];

  return (
    <div className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6 w-full max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {labels.onboardingProfile}
      </h1>

      {/* Name input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground font-medium">
          {labels.onboardingName}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.onboardingName}
          className="rounded-xl bg-white/5 border border-white/10 h-12 px-4 focus:ring-2 focus:ring-primary/30 outline-none transition-all w-full text-base"
          autoComplete="given-name"
        />
      </div>

      {/* Relationship selector */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground font-medium">
          {labels.onboardingRelationship}
        </span>
        <div className="flex gap-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRelationship(opt.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 p-3 cursor-pointer transition-all text-sm font-medium",
                relationship === opt.id
                  ? "ring-2 ring-primary bg-primary/5 text-primary"
                  : "hover:bg-white/10 text-foreground",
              )}
            >
              {opt.icon}
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!name.trim()}
        className="rounded-xl bg-primary text-primary-foreground h-12 w-full font-medium transition-opacity disabled:opacity-40"
      >
        {labels.onboardingContinue}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Step 2 — Language
// ───────────────────────────────────────────────
function StepLanguage({
  langCode,
  setLangCode,
  onContinue,
  labels,
}: {
  langCode: string | null;
  setLangCode: (v: string) => void;
  onContinue: () => void;
  labels: ReturnType<typeof getLabels>;
}) {
  return (
    <div className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6 w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {labels.onboardingLanguage}
        </h1>
        <p className="text-muted-foreground text-base">
          {labels.onboardingLanguageDesc}
        </p>
      </div>

      <LanguageDropdown value={langCode} onChange={setLangCode} />

      <button
        type="button"
        onClick={onContinue}
        disabled={!langCode}
        className="rounded-xl bg-primary text-primary-foreground h-12 w-full font-medium transition-opacity disabled:opacity-40"
      >
        {labels.onboardingContinue}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Animated bars (voice visualizer)
// ───────────────────────────────────────────────
function RecordingBars() {
  return (
    <div className="flex items-end justify-center gap-1 h-8" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-primary animate-[recordBar_0.9s_ease-in-out_infinite]"
          style={{
            animationDelay: `${i * 0.15}s`,
            height: "8px",
          }}
        />
      ))}
      <style>{`
        @keyframes recordBar {
          0%, 100% { height: 8px; }
          50% { height: 28px; }
        }
      `}</style>
    </div>
  );
}

// ───────────────────────────────────────────────
// Step 3 — Voice Clone
// ───────────────────────────────────────────────
function StepVoice({
  langCode,
  audioBlob,
  setAudioBlob,
  onFinish,
  onSkip,
  labels,
}: {
  langCode: string | null;
  audioBlob: Blob | null;
  setAudioBlob: (b: Blob | null) => void;
  onFinish: () => void;
  onSkip: () => void;
  labels: ReturnType<typeof getLabels>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxSeconds = 30;

  const passage =
    VOICE_PASSAGES[langCode ?? "en"] ?? VOICE_PASSAGES["en"];

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      chunks.current = [];
      recorder.ondataavailable = (e) => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        clearTimer();
        setIsRecording(false);
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setElapsed(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= maxSeconds) {
            mediaRecorder.current?.stop();
          }
          return next;
        });
      }, 1000);
    } catch {
      // Permission denied or not supported — silently ignore
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
  }

  useEffect(() => {
    return () => {
      clearTimer();
      mediaRecorder.current?.stop();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-8 w-full max-w-md mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {labels.onboardingVoiceTitle}
        </h1>
        <p className="text-muted-foreground text-base">
          {labels.onboardingVoiceDesc}
        </p>
      </div>

      {/* Passage card */}
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-lg leading-relaxed">{passage}</p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!audioBlob}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto transition-all",
            isRecording && "ring-4 ring-primary/30 animate-pulse",
            !!audioBlob && "opacity-40 cursor-not-allowed",
          )}
        >
          {isRecording ? (
            <Square className="w-6 h-6 fill-current" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {isRecording && (
          <div className="flex flex-col items-center gap-2">
            <RecordingBars />
            <span className="text-sm text-muted-foreground">
              {formatTime(elapsed)} / {formatTime(maxSeconds)}
            </span>
          </div>
        )}

        {audioBlob && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-primary font-medium"
          >
            <Check className="w-5 h-5" />
            <span>{labels.onboardingVoiceRecorded}</span>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={onFinish}
        className="rounded-xl bg-primary text-primary-foreground h-12 w-full font-medium"
      >
        {labels.onboardingFinish}
      </button>

      <button
        type="button"
        onClick={onSkip}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline mx-auto"
      >
        {labels.onboardingSkip}
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────
// Main wizard
// ───────────────────────────────────────────────
export function OnboardingPage() {
  const navigate = useNavigate();
  const { code: langCode, set: setLang } = useLanguage();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Step 1 state
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<Relationship | null>(null);

  // Step 2 state — pre-fill from context
  const [selectedLang, setSelectedLang] = useState<string | null>(langCode);

  // Step 3 state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const labels = getLabels(langCode);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  async function complete() {
    try {
      await supabase.auth.updateUser({
        data: {
          name,
          relationship,
          onboarding_complete: true,
        },
      });
    } catch {
      // Non-blocking — continue regardless
    }
    navigate("/home", { replace: true });
  }

  function handleLangChange(code: string) {
    setSelectedLang(code);
    setLang(code);
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)] px-4 pt-10 pb-6">
      <ProgressDots current={step} total={3} />

      <div className="flex-1 flex items-start justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {step === 0 && (
            <motion.div
              key="step-profile"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
              className="w-full"
            >
              <StepProfile
                name={name}
                setName={setName}
                relationship={relationship}
                setRelationship={setRelationship}
                onContinue={() => goTo(1)}
                labels={labels}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-language"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
              className="w-full"
            >
              <StepLanguage
                langCode={selectedLang}
                setLangCode={handleLangChange}
                onContinue={() => goTo(2)}
                labels={labels}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-voice"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_TRANSITION}
              className="w-full"
            >
              <StepVoice
                langCode={selectedLang}
                audioBlob={audioBlob}
                setAudioBlob={setAudioBlob}
                onFinish={complete}
                onSkip={complete}
                labels={labels}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
