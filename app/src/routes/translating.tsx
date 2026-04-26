import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  FileScan,
  Languages,
  Loader2,
  Sparkles,
  Waves,
} from "lucide-react";
import { explainDocument } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

type TranslatingLocationState = {
  file?: File;
  targetLanguage?: string;
  userId?: string;
};

type StepState = "pending" | "active" | "done";

type TranslationStep = {
  label: string;
  detail: string;
  Icon: typeof Waves;
};

type TranslatingCopy = {
  cancel: string;
  live: string;
  title: string;
  progressLabel: string;
  footer: string;
  progressAria: string;
  steps: Array<Omit<TranslationStep, "Icon">>;
};

const STEP_INTERVAL_MS = 2200;
const PROGRESS_DURATION_MS = 9500;
const FINISH_HOLD_MS = 2000;
const STEP_ICONS = [FileScan, Brain, Languages, Sparkles];

const TRANSLATING_COPY: Record<string, TranslatingCopy> = {
  en: {
    cancel: "Cancel",
    live: "Live translation",
    title: "Translating...",
    progressLabel: "Working on your translation",
    footer: "Hold on - your translation is on its way",
    progressAria: "Translation progress",
    steps: [
      { label: "Scanning letter", detail: "Reading the document clearly" },
      { label: "Understanding", detail: "Detecting language and intent" },
      {
        label: "Translating",
        detail: "Carefully matching meaning, not just words",
      },
      { label: "Polishing", detail: "Adjusting tone so it feels natural" },
    ],
  },
  "zh-CN": {
    cancel: "取消",
    live: "实时翻译",
    title: "正在翻译...",
    progressLabel: "正在处理您的翻译",
    footer: "请稍等 - 您的翻译马上就好",
    progressAria: "翻译进度",
    steps: [
      { label: "扫描信件", detail: "清楚读取文件内容" },
      { label: "理解", detail: "识别语言和意图" },
      { label: "翻译", detail: "认真保留意思，而不只是逐字翻译" },
      { label: "润色", detail: "调整语气，让表达更自然" },
    ],
  },
  es: {
    cancel: "Cancelar",
    live: "Traducción en vivo",
    title: "Traduciendo...",
    progressLabel: "Trabajando en tu traducción",
    footer: "Espera un momento - tu traducción ya viene",
    progressAria: "Progreso de traducción",
    steps: [
      { label: "Escaneando carta", detail: "Leyendo el documento con claridad" },
      { label: "Entendiendo", detail: "Detectando idioma e intención" },
      {
        label: "Traduciendo",
        detail: "Cuidando el significado, no solo las palabras",
      },
      { label: "Puliendo", detail: "Ajustando el tono para que suene natural" },
    ],
  },
  vi: {
    cancel: "Hủy",
    live: "Dịch trực tiếp",
    title: "Đang dịch...",
    progressLabel: "Đang xử lý bản dịch của bạn",
    footer: "Chờ một chút - bản dịch của bạn sắp xong",
    progressAria: "Tiến trình dịch",
    steps: [
      { label: "Đang quét thư", detail: "Đọc rõ nội dung tài liệu" },
      { label: "Đang hiểu", detail: "Nhận diện ngôn ngữ và ý định" },
      { label: "Đang dịch", detail: "Giữ đúng ý, không chỉ dịch từng chữ" },
      { label: "Đang chỉnh", detail: "Điều chỉnh giọng văn cho tự nhiên" },
    ],
  },
  ro: {
    cancel: "Anulați",
    live: "Traducere live",
    title: "Se traduce...",
    progressLabel: "Lucrăm la traducerea dumneavoastră",
    footer: "Așteptați puțin - traducerea este pe drum",
    progressAria: "Progresul traducerii",
    steps: [
      { label: "Scanare scrisoare", detail: "Citim clar conținutul documentului" },
      { label: "Înțelegere", detail: "Detectăm limba și intenția" },
      {
        label: "Traducere",
        detail: "Păstrăm sensul, nu doar cuvintele",
      },
      { label: "Finisare", detail: "Ajustăm tonul ca să sune natural" },
    ],
  },
};

function getTranslatingCopy(code: string | null): TranslatingCopy {
  if (!code) return TRANSLATING_COPY.en;
  return TRANSLATING_COPY[code] ?? TRANSLATING_COPY.en;
}

export function TranslatingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code } = useLanguage();
  const state = location.state as TranslatingLocationState | null;
  const targetCode = state?.targetLanguage ?? code;
  const labels = getLabels(targetCode);
  const translatingCopy = getTranslatingCopy(targetCode);
  const prefersReducedMotion = useReducedMotion();
  const startedRef = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const steps = translatingCopy.steps.map((step, index) => ({
    ...step,
    Icon: STEP_ICONS[index] ?? Sparkles,
  }));

  useEffect(() => {
    if (!state?.file || !state.targetLanguage) {
      navigate("/capture", { replace: true });
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    explainDocument(
      state.file,
      state.userId ?? "demo-user-1",
      state.targetLanguage,
    )
      .then((response) => {
        setFinishing(true);
        setActiveStep(steps.length);
        setProgress(100);

        window.setTimeout(() => {
          navigate(`/result/${response.document_id}`, {
            replace: true,
            state: response,
          });
        }, FINISH_HOLD_MS);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        const isRateLimit =
          message.includes("RESOURCE_EXHAUSTED") || message.includes("429");
        const isOcr = message.toLowerCase().includes("ocr");

        toast.error(isRateLimit ? labels.toastTooMany : labels.toastReadFailed, {
          description: isRateLimit
            ? labels.toastTooManyDesc
            : isOcr
              ? labels.toastReadOcrDesc
              : labels.toastTryAgain,
        });
        navigate("/capture", { replace: true });
      });
  }, [labels, navigate, state, steps.length]);

  useEffect(() => {
    if (finishing) return;

    const timer = setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [finishing, steps.length]);

  useEffect(() => {
    if (finishing) {
      setProgress(100);
      return;
    }

    if (prefersReducedMotion) {
      setProgress(90);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const next = Math.min((elapsed / PROGRESS_DURATION_MS) * 99, 99);
      setProgress(next);

      if (next < 99) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finishing, prefersReducedMotion]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[var(--translating-background)] px-6 py-10 text-[var(--translating-foreground)] sm:py-16"
    >
      <motion.div
        aria-hidden="true"
        className="absolute -left-32 -top-36 h-80 w-80 rounded-full bg-[var(--translating-glow-cool)] blur-3xl"
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 34, 10, 0], y: [0, 18, 42, 0] }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--translating-glow-soft)] blur-3xl"
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, -26, -52, 0], y: [0, -34, -10, 0] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col sm:min-h-[calc(100vh-8rem)]">
        <nav className="flex items-center justify-between">
          <Link
            to="/home"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 text-sm font-semibold text-foreground/70 shadow-sm backdrop-blur-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="h-4 w-4" />
            {translatingCopy.cancel}
          </Link>

          <div className="inline-flex h-11 items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 text-sm font-semibold text-foreground/70 shadow-sm backdrop-blur-sm">
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-[var(--translating-primary-strong)]"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.5, 1], opacity: [0.8, 0.35, 0.8] }
              }
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {translatingCopy.live}
          </div>
        </nav>

        <section className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-6xl leading-[1.05] tracking-tight text-balance text-foreground sm:text-7xl"
          >
            {translatingCopy.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full rounded-3xl border border-border/60 bg-card/80 p-5 text-left backdrop-blur-sm sm:p-6"
            style={{
              boxShadow:
                "0 20px 60px -30px var(--translating-shadow)",
            }}
          >
            <motion.ol
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
              className="space-y-3"
              aria-label={translatingCopy.progressAria}
            >
              {steps.map((step, index) => {
                const state =
                  index < activeStep
                    ? "done"
                    : index === activeStep
                      ? "active"
                      : "pending";

                return (
                  <TranslationStepRow
                    key={step.label}
                    index={index}
                    step={step}
                    state={state}
                    prefersReducedMotion={Boolean(prefersReducedMotion)}
                  />
                );
              })}
            </motion.ol>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                <span>{translatingCopy.progressLabel}</span>
                <span className="font-mono text-muted-foreground">
                  {Math.floor(progress)}%
                </span>
              </div>
              <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-[var(--translating-primary)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-[var(--translating-shimmer)] to-transparent"
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : { x: ["-5rem", "38rem"] }
                    }
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="mt-8 text-center text-base font-medium text-muted-foreground"
            aria-live="polite"
          >
            {translatingCopy.footer}
          </motion.p>
        </section>
      </div>
    </main>
  );
}

function TranslationStepRow({
  index,
  step,
  state,
  prefersReducedMotion,
}: {
  index: number;
  step: TranslationStep;
  state: StepState;
  prefersReducedMotion: boolean;
}) {
  const Icon = step.Icon;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border p-4 transition-colors duration-300",
        state === "active" &&
          "border-primary/50 bg-primary/10",
        state === "done" &&
          "border-[var(--translating-success-border)] bg-[var(--translating-success-surface)]",
        state === "pending" &&
          "border-border/70 bg-background/70",
      )}
    >
      <motion.div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl",
          state === "active" && "bg-primary text-primary-foreground",
          state === "done" && "bg-[var(--translating-success-icon)]",
          state === "pending" && "bg-secondary",
        )}
        animate={
          state === "active" && !prefersReducedMotion
            ? { scale: [1, 1.07, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1.15, repeat: state === "active" ? Infinity : 0 }}
      >
        {state === "active" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-[var(--translating-primary)]"
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.55], opacity: [0.28, 0] }
            }
            transition={{ duration: 1.25, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        {state === "done" ? (
          <CheckCircle2 className="relative h-6 w-6 text-[var(--translating-on-success)]" />
        ) : (
          <Icon
            className={cn(
              "relative h-6 w-6",
              state === "active"
                ? "text-primary-foreground"
                : "text-muted-foreground",
            )}
            strokeWidth={1.8}
          />
        )}
      </motion.div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-base font-bold">{step.label}</h2>
          {state === "active" && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {step.detail}
        </p>
      </div>

      <span className="font-mono text-sm font-semibold text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
    </motion.li>
  );
}
