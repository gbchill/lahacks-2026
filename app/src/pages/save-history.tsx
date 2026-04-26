import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, EyeOff, Clock, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type Choice = {
  id: "save" | "skip" | "later";
  icon: LucideIcon;
  titleKey: "saveAndAccount" | "dontSave" | "decideLater";
  subKey: "saveAndAccountSub" | "dontSaveSub" | "decideLaterSub";
  to: string;
  primary?: boolean;
};

const CHOICES: Choice[] = [
  {
    id: "save",
    icon: Bookmark,
    titleKey: "saveAndAccount",
    subKey: "saveAndAccountSub",
    to: "/signup",
    primary: true,
  },
  {
    id: "skip",
    icon: EyeOff,
    titleKey: "dontSave",
    subKey: "dontSaveSub",
    to: "/",
  },
  {
    id: "later",
    icon: Clock,
    titleKey: "decideLater",
    subKey: "decideLaterSub",
    to: "/",
  },
];

export function SaveHistoryPage() {
  const navigate = useNavigate();
  const { code } = useLanguage();
  const labels = getLabels(code);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex flex-col gap-8 max-w-xl mx-auto"
    >
      <div className="text-center">
        <h1 className="font-heading text-3xl sm:text-4xl text-foreground leading-tight">
          {labels.saveHeading}
        </h1>
        <p className="text-muted-foreground text-base mt-3 max-w-md mx-auto leading-relaxed">
          {labels.saveBody}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CHOICES.map((choice, i) => {
          const Icon = choice.icon;
          return (
            <motion.button
              key={choice.id}
              type="button"
              onClick={() => navigate(choice.to)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease }}
              className={cn(
                "group w-full rounded-2xl border-2 p-5 flex items-center gap-5",
                "transition-all duration-200 will-change-transform",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "hover:-translate-y-0.5",
                choice.primary
                  ? "border-primary bg-primary/5 hover:bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                  "transition-colors duration-200",
                  choice.primary
                    ? "bg-primary/15 group-hover:bg-primary/20"
                    : "bg-secondary group-hover:bg-primary/10",
                )}
              >
                <Icon
                  className={cn(
                    "w-7 h-7",
                    choice.primary ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                  )}
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-heading text-xl text-foreground leading-tight">
                  {labels[choice.titleKey]}
                </div>
                <div className="text-sm text-muted-foreground mt-1 leading-snug">
                  {labels[choice.subKey]}
                </div>
              </div>
              <ArrowRight
                className={cn(
                  "w-5 h-5 shrink-0 transition-all duration-200 group-hover:translate-x-1",
                  choice.primary ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary",
                )}
                strokeWidth={2}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
