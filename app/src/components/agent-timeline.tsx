import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineTiming, ExplainResponse } from "@/lib/api";

type AgentState = "idle" | "active" | "done";

type AgentDef = {
  id: string;
  name: string;
  activeLabel: string;
  getDetail: (data: ExplainResponse) => string;
  getTiming: (t: PipelineTiming) => number;
};

const AGENTS: AgentDef[] = [
  {
    id: "parser",
    name: "Parser",
    activeLabel: "Reading the document...",
    getDetail: (data) => {
      const snippet = data.english_explanation.split(".")[0];
      return snippet ? `"${snippet.trim().slice(0, 80)}..."` : "Extracted document text";
    },
    getTiming: (t) => t.ocr ?? 0,
  },
  {
    id: "context",
    name: "Context",
    activeLabel: "Looking through your past letters...",
    getDetail: (data) =>
      data.similar_past_documents.length > 0
        ? `Found ${data.similar_past_documents.length} similar past document${data.similar_past_documents.length > 1 ? "s" : ""}`
        : "No past documents found — this is your first",
    getTiming: (t) => {
      const gap = (t.explanation ?? 0) - (t.ocr ?? 0);
      return Math.max(gap * 0.3, 200);
    },
  },
  {
    id: "drafter",
    name: "Drafter",
    activeLabel: "Writing the explanation...",
    getDetail: (data) => {
      const first = data.english_explanation.split(".")[0];
      return first ? `"${first.trim()}"` : "Composed plain-English explanation";
    },
    getTiming: (t) => t.explanation ?? 0,
  },
  {
    id: "translator",
    name: "Translator",
    activeLabel: "Translating...",
    getDetail: (data) => {
      const langs: Record<string, string> = {
        "zh-CN": "Simplified Chinese",
        es: "Spanish",
        vi: "Vietnamese",
        ro: "Romanian",
      };
      return `Translated to ${langs[data.target_language] ?? data.target_language}`;
    },
    getTiming: (t) => (t.translation ?? 0) + (t.tts ?? 0),
  },
];

type AgentTimelineProps = {
  timing: PipelineTiming;
  data: ExplainResponse;
};

export function AgentTimeline({ timing, data }: AgentTimelineProps) {
  const [agentStates, setAgentStates] = useState<AgentState[]>(() =>
    AGENTS.map(() => "idle"),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const realTimings = useMemo(
    () => AGENTS.map((a) => a.getTiming(timing)),
    [timing],
  );

  const totalReal = useMemo(
    () => realTimings.reduce((sum, t) => sum + t, 0),
    [realTimings],
  );

  const ANIMATION_TOTAL_MS = 5000;

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    AGENTS.forEach((_, i) => {
      const proportion = totalReal > 0 ? realTimings[i] / totalReal : 0.25;
      const stepDuration = proportion * ANIMATION_TOTAL_MS;
      const activeDelay = elapsed;
      const doneDelay = elapsed + Math.max(stepDuration * 0.7, 300);

      timeouts.push(
        setTimeout(() => {
          setAgentStates((prev) => {
            const next = [...prev];
            next[i] = "active";
            return next;
          });
        }, activeDelay),
      );

      timeouts.push(
        setTimeout(() => {
          setAgentStates((prev) => {
            const next = [...prev];
            next[i] = "done";
            return next;
          });
        }, doneDelay),
      );

      elapsed += stepDuration;
    });

    return () => timeouts.forEach(clearTimeout);
  }, [realTimings, totalReal]);

  const allDone = agentStates.every((s) => s === "done");
  const totalSeconds = timing.total ? (timing.total / 1000).toFixed(1) : "—";

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-5">
        4 specialist agents working together
      </p>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
        <motion.div
          className="absolute left-[15px] top-4 w-px bg-success origin-top"
          initial={{ scaleY: 0 }}
          animate={{
            scaleY: allDone ? 1 : agentStates.filter((s) => s === "done").length / AGENTS.length,
          }}
          style={{ height: "calc(100% - 2rem)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="space-y-0">
          {AGENTS.map((agent, i) => {
            const state = agentStates[i];
            const expanded = expandedId === agent.id;
            const elapsedMs = realTimings[i];
            const elapsedLabel = (elapsedMs / 1000).toFixed(1) + "s";

            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => state === "done" && toggleExpand(agent.id)}
                aria-expanded={expanded}
                aria-label={`${agent.name} agent — ${state === "done" ? "completed" : state}`}
                disabled={state !== "done"}
                className={cn(
                  "relative w-full text-left pl-10 pr-2 py-3.5 rounded-lg transition-colors duration-200",
                  state === "done" && "hover:bg-secondary/50 cursor-pointer",
                  state !== "done" && "cursor-default",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
              >
                {/* Circle indicator */}
                <div className="absolute left-0 top-3.5 w-[31px] flex items-center justify-center">
                  {state === "idle" && (
                    <div className="w-[11px] h-[11px] rounded-full border-2 border-border bg-card" />
                  )}
                  {state === "active" && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-[11px] h-[11px] rounded-full bg-primary"
                    >
                      <motion.div
                        className="absolute inset-0 w-[11px] h-[11px] rounded-full bg-primary"
                        animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                        }}
                      />
                    </motion.div>
                  )}
                  {state === "done" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="w-[17px] h-[17px] rounded-full bg-success flex items-center justify-center"
                    >
                      <Check className="w-[11px] h-[11px] text-success-foreground" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        state === "idle" && "text-muted-foreground/60",
                        state === "active" && "text-primary",
                        state === "done" && "text-foreground",
                      )}
                    >
                      {agent.name}
                    </span>
                    {state === "active" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-primary/70 mt-0.5"
                      >
                        {agent.activeLabel}
                      </motion.p>
                    )}
                  </div>

                  {state === "done" && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-xs text-muted-foreground flex-shrink-0"
                    >
                      {elapsedLabel}
                    </motion.span>
                  )}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expanded && state === "done" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        {agent.getDetail(data)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total time footer */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 pt-4 border-t border-border flex items-center justify-center"
          >
            <span className="font-mono text-sm text-muted-foreground">
              Done in {totalSeconds}s&nbsp;&nbsp;·&nbsp;&nbsp;4 agents
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
