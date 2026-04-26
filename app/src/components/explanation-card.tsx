import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels, getNativeName } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

type ExplanationCardProps = {
  translated: string;
  english: string;
  targetLanguage: string;
};

export function ExplanationCard({ translated, english, targetLanguage }: ExplanationCardProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  const { code } = useLanguage();
  const labels = getLabels(code);
  const langName = getNativeName(code ?? targetLanguage);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {labels.explainedIn(langName)}
        </p>
        <p className="text-xl sm:text-2xl leading-relaxed text-foreground">
          {translated}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowEnglish((s) => !s)}
        aria-expanded={showEnglish}
        aria-controls="english-explanation"
        className={cn(
          "flex items-center gap-2 text-sm font-medium text-muted-foreground",
          "hover:text-foreground transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "rounded-md px-2 py-1.5 -mx-2 min-h-[44px]",
        )}
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            showEnglish && "rotate-180",
          )}
        />
        {showEnglish ? labels.hideEnglish : labels.showEnglish}
      </button>

      <AnimatePresence>
        {showEnglish && (
          <motion.div
            id="english-explanation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-base leading-relaxed text-muted-foreground border-l-2 border-border pl-4 py-1">
              {english}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
