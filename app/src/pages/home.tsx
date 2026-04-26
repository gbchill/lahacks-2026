import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, PhoneCall, FolderHeart } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { getLabels } from "@/lib/menu-labels";
import { fetchTimeline } from "@/lib/family-api";
import { HomeChat } from "@/components/home-chat";
import { cn } from "@/lib/utils";

const TERMS_KEY = "orision-terms-agreed";
const ease = [0.16, 1, 0.3, 1] as const;

export function HomePage() {
  const { code } = useLanguage();
  const { user, session } = useAuth();
  const labels = getLabels(code);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(() => localStorage.getItem(TERMS_KEY) === "true");

  useEffect(() => {
    if (!session?.access_token) {
      setHasDocuments(false);
      return;
    }
    fetchTimeline(session.access_token)
      .then((docs) => setHasDocuments(docs.length > 0))
      .catch(() => setHasDocuments(false));
  }, [session?.access_token]);

  const name = user?.user_metadata?.name as string | undefined;

  return (
    <div className="flex flex-col gap-6 px-1 pb-8">
      {/* Greeting / tagline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {user ? (
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {labels.homeGreeting}{name ? `, ${name}` : ""}
          </h1>
        ) : (
          <p className="text-base text-muted-foreground leading-relaxed">
            {labels.tagline}
          </p>
        )}
      </motion.div>

      {!termsAgreed && (
        <label className="flex items-center gap-2.5 -mt-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => {
              setTermsAgreed(e.target.checked);
              localStorage.setItem(TERMS_KEY, String(e.target.checked));
            }}
            className="h-5 w-5 rounded border-white/20 bg-card/60 accent-primary shrink-0"
          />
          <span className="text-xs leading-relaxed text-muted-foreground/70">
            {labels.termsAgree}
          </span>
        </label>
      )}

      {/* Hero card — Scan a letter (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease }}
      >
        <Link
          to="/capture"
          aria-label="Scan a letter"
          className={cn(
            "group flex items-center gap-5 w-full min-h-[180px]",
            "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6",
            "hover:scale-[1.02] transition-transform duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-xl font-semibold text-foreground leading-tight">
              {labels.scanTitle}
            </p>
            <p className="text-base text-muted-foreground mt-1.5 leading-snug">
              {labels.scanSubtitle}
            </p>
          </div>
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ScanLine
              className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110"
              strokeWidth={1.5}
            />
          </div>
        </Link>
      </motion.div>

      {/* Secondary row — Make a call + My documents */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            to: "/call",
            icon: PhoneCall,
            title: labels.callTitle,
            sub: labels.callSubtitle,
            delay: 0.12,
          },
          {
            to: "/documents",
            icon: FolderHeart,
            title: labels.documentsTitle,
            sub: labels.documentsSubtitle,
            delay: 0.18,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: card.delay, ease }}
            >
              <Link
                to={card.to}
                className={cn(
                  "group flex flex-col gap-4 w-full h-full",
                  "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-5",
                  "hover:scale-[1.02] transition-transform duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon
                    className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground leading-tight">
                    {card.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">
                    {card.sub}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <HomeChat hasDocuments={hasDocuments} />
    </div>
  );
}
