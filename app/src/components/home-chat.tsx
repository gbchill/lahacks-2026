import { useRef, useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, SendHorizonal, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { sendChatMessage, type ChatMessage } from "@/lib/chat-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function HomeChat({ hasDocuments }: { hasDocuments: boolean }) {
  const { session } = useAuth();
  const { code } = useLanguage();
  const labels = getLabels(code);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || !session?.access_token) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await sendChatMessage(
        session.access_token,
        trimmed,
        code ?? "en",
        [...messages, userMsg].slice(-10),
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setError(labels.chatError);
    } finally {
      setIsLoading(false);
    }
  }

  const showLocked = !hasDocuments || !session;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.24, ease }}
    >
      <div
        className={cn(
          "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-5",
          "flex flex-col gap-4",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground leading-tight">
              {labels.chatTitle}
            </p>
            <p className="text-sm text-muted-foreground leading-snug">
              {labels.chatSubtitle}
            </p>
          </div>
        </div>

        {showLocked ? (
          /* Locked empty state */
          <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-foreground">
              {labels.chatEmptyTitle}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
              {labels.chatEmptyBody}
            </p>
            <Link
              to="/capture"
              className="mt-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {labels.chatEmptyLink} &rarr;
            </Link>
          </div>
        ) : (
          /* Active chat */
          <>
            <ScrollArea className="max-h-[320px] min-h-[120px]">
              <div className="flex flex-col gap-3 pr-2">
                {messages.length === 0 && !isLoading && (
                  <p className="text-center text-sm text-muted-foreground py-6 px-2">
                    {labels.chatPlaceholder}
                  </p>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-base leading-relaxed",
                        msg.role === "user"
                          ? "ml-auto rounded-tr-sm bg-primary/15 text-foreground"
                          : "mr-auto rounded-tl-sm bg-white/5 ring-1 ring-white/8 text-foreground",
                      )}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mr-auto max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 ring-1 ring-white/8 px-4 py-2.5"
                  >
                    <div className="flex gap-1.5 items-center h-5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={labels.chatPlaceholder}
                disabled={isLoading}
                className={cn(
                  "flex-1 min-h-[44px] rounded-xl bg-white/5 ring-1 ring-white/10 px-4 text-base text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                  "disabled:opacity-50",
                )}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                aria-label={labels.chatSendLabel}
                className="h-[44px] w-[44px] rounded-xl shrink-0"
              >
                <SendHorizonal className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </form>
          </>
        )}
      </div>
    </motion.section>
  );
}
