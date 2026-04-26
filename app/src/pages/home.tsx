import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, PhoneCall, FolderHeart, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type ServiceCard = {
  to: string;
  icon: LucideIcon;
  nativeKey: "scanTitle" | "callTitle" | "documentsTitle";
  subKey: "scanSubtitle" | "callSubtitle" | "documentsSubtitle";
  englishLabel: string;
};

const SERVICES: ServiceCard[] = [
  {
    to: "/capture",
    icon: ScanLine,
    nativeKey: "scanTitle",
    subKey: "scanSubtitle",
    englishLabel: "Scan a letter",
  },
  {
    to: "/call",
    icon: PhoneCall,
    nativeKey: "callTitle",
    subKey: "callSubtitle",
    englishLabel: "Make a call",
  },
  {
    to: "/family",
    icon: FolderHeart,
    nativeKey: "documentsTitle",
    subKey: "documentsSubtitle",
    englishLabel: "My documents",
  },
];

export function HomePage() {
  const { code } = useLanguage();
  const labels = getLabels(code);
  const englishLabels = getLabels("en");

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="max-w-lg text-center"
      >
        <h1 className="font-heading text-5xl sm:text-6xl text-foreground leading-[1.05]">
          Orision
        </h1>
        <p className="text-muted-foreground text-sm mt-3 tracking-wide">
          {labels.tagline}
        </p>
      </motion.div>

      <div className="w-full max-w-2xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          const native = labels[service.nativeKey];
          const sub = labels[service.subKey];
          const englishNative = englishLabels[service.nativeKey];
          const showEnglish = code && code !== "en" && native !== englishNative;

          return (
            <motion.div
              key={service.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease }}
            >
              <Link
                to={service.to}
                aria-label={service.englishLabel}
                className={cn(
                  "group relative block w-full h-full rounded-3xl border-2 border-border bg-card",
                  "p-6 sm:p-7 flex flex-col items-center text-center gap-4",
                  "transition-all duration-200 will-change-transform",
                  "hover:border-primary hover:bg-secondary/40 hover:-translate-y-1",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div
                  className={cn(
                    "w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center",
                    "transition-colors duration-200",
                    "group-hover:bg-primary/10",
                  )}
                >
                  <Icon
                    className="w-10 h-10 text-primary transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="font-heading text-2xl sm:text-[1.6rem] text-foreground leading-tight">
                    {native}
                  </span>
                  {showEnglish && (
                    <span className="text-xs text-muted-foreground/80 mt-1.5 uppercase tracking-wide">
                      {service.englishLabel}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground mt-3 leading-snug">
                    {sub}
                  </span>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-muted-foreground/40 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className="text-base text-muted-foreground/70 mt-auto pt-16 pb-8 max-w-sm text-center leading-relaxed"
      >
        {labels.statText}
      </motion.p>
    </div>
  );
}
