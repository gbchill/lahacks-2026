import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  token?: string;
  voiceId?: string;
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
  progressLabel: string;
  footer: string;
  progressAria: string;
  steps: Array<Omit<TranslationStep, "Icon">>;
};

const STEP_INTERVAL_MS = 8000;
const FINISH_HOLD_MS = 1200;
const STEP_ICONS = [FileScan, Brain, Languages, Sparkles];
const WORD_ROTATE_MS = 4500;

const ROTATING_WORDS: Record<string, string[]> = {
  en: [
    "Brewing...",
    "Decoding...",
    "Polishing...",
    "Weaving...",
    "Unfolding...",
    "Crafting...",
    "Simmering...",
    "Piecing together...",
  ],
  "zh-CN": [
    "酝酿中...",
    "解读中...",
    "润色中...",
    "编织中...",
    "展开中...",
    "打磨中...",
    "翻阅中...",
    "拼凑中...",
  ],
  es: [
    "Cocinando...",
    "Descifrando...",
    "Puliendo...",
    "Hilvanando...",
    "Revelando...",
    "Armando...",
    "Pensando...",
    "Juntando piezas...",
  ],
  vi: [
    "Đang pha chế...",
    "Đang giải mã...",
    "Đang trau chuốt...",
    "Đang dệt...",
    "Đang mở ra...",
    "Đang ghép nối...",
    "Đang suy ngẫm...",
    "Đang lắp ghép...",
  ],
  ro: [
    "Se prepară...",
    "Se descifrează...",
    "Se șlefuiește...",
    "Se țese...",
    "Se dezvăluie...",
    "Se asamblează...",
    "Se gândește...",
    "Se îmbină...",
  ],
};

const TRANSLATING_COPY: Record<string, TranslatingCopy> = {
  en: {
    cancel: "Cancel",
    live: "Live translation",
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

function getRotatingWords(code: string | null): string[] {
  if (!code) return ROTATING_WORDS.en;
  return ROTATING_WORDS[code] ?? ROTATING_WORDS.en;
}

export function TranslatingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { code } = useLanguage();
  const state = location.state as TranslatingLocationState | null;
  const targetCode = state?.targetLanguage ?? code;
  const labels = getLabels(targetCode);
  const translatingCopy = getTranslatingCopy(targetCode);
  const rotatingWords = getRotatingWords(targetCode);
  const prefersReducedMotion = useReducedMotion();
  const startedRef = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const steps = translatingCopy.steps.map((step, index) => ({
    ...step,
    Icon: STEP_ICONS[index] ?? Sparkles,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % rotatingWords.length);
    }, WORD_ROTATE_MS);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  useEffect(() => {
    if (!state?.file || !state.targetLanguage) {
      navigate("/capture", { replace: true });
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    explainDocument(
      state.file,
      state.userId ?? "anonymous",
      state.targetLanguage,
      state.token,
      state.voiceId,
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
      setProgress(70);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const next = 88 * (1 - Math.exp(-elapsed / 20));
      setProgress(next);

      if (next < 87.5) {
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
          <div className="h-[3.5rem] sm:h-[4rem] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h1
                key={wordIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-4xl leading-[1.05] tracking-tight text-balance text-foreground sm:text-5xl"
              >
                {rotatingWords[wordIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 w-full rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-4 text-left sm:p-5"
          >
            <motion.ol
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
              className="space-y-1"
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
                    step={step}
                    state={state}
                    prefersReducedMotion={Boolean(prefersReducedMotion)}
                  />
                );
              })}
            </motion.ol>

            <div className="mt-4 rounded-xl border border-border/40 bg-background/50 p-3">
              <div className="flex items-center justify-between gap-4 text-sm font-medium">
                <span className="text-muted-foreground">{translatingCopy.progressLabel}</span>
                <span className="font-mono text-xs text-muted-foreground/70">
                  {Math.floor(progress)}%
                </span>
              </div>
              <div className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-secondary">
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
            className="mt-8 text-center text-sm font-medium text-muted-foreground/60"
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
  step,
  state,
  prefersReducedMotion,
}: {
  step: TranslationStep;
  state: StepState;
  prefersReducedMotion: boolean;
}) {
  const Icon = step.Icon;

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-300",
        state === "active" && "bg-primary/5",
        state === "done" && "bg-transparent",
        state === "pending" && "bg-transparent",
      )}
    >
      <div className="relative flex-shrink-0">
        {state === "pending" && (
          <div className="flex h-8 w-8 items-center justify-center">
            <div className="h-2 w-2 rounded-full border border-white/20" />
          </div>
        )}
        {state === "active" && (
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"
            animate={
              prefersReducedMotion
                ? undefined
                : { opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </motion.div>
        )}
        {state === "done" && (
          <div className="flex h-8 w-8 items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "text-sm transition-colors duration-200",
              state === "active" && "font-medium text-foreground",
              state === "done" && "text-muted-foreground",
              state === "pending" && "text-muted-foreground/40",
            )}
          >
            {step.label}
          </span>
          {state === "active" && (
            <Loader2 className="h-3 w-3 animate-spin text-primary/60" />
          )}
        </div>
        {state === "active" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-0.5 text-xs text-muted-foreground/60"
          >
            {step.detail}
          </motion.p>
        )}
      </div>
    </motion.li>
  );
}
