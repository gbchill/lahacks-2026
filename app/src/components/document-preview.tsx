import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type DocumentPreviewProps = {
  src: string;
  enhancedSrc?: string;
  type: string;
};

const TYPE_LABELS: Record<string, string> = {
  medicaid: "Medicaid",
  uscis: "USCIS",
  irs: "IRS",
  dmv: "DMV",
  school: "School",
  medical: "Medical",
  lease: "Lease",
  car_insurance: "Car Insurance",
  utility: "Utility",
  other: "Document",
};

export function DocumentPreview({ src, enhancedSrc, type }: DocumentPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const fullSrc = enhancedSrc || src;

  return (
    <>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-20 h-28 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0 cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src={src}
            alt="Original document"
            className="w-full h-full object-cover"
          />
        </button>
        <div className="pt-1">
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
            {TYPE_LABELS[type] ?? type}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <img
                src={fullSrc}
                alt="Document full view"
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
