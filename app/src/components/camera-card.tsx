import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CameraCardProps = {
  onPhotoCaptured: (file: File) => void;
  onContinue: () => void;
  file: File | null;
  disabled?: boolean;
};

export function CameraCard({ onPhotoCaptured, onContinue, file, disabled }: CameraCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      const url = URL.createObjectURL(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      onPhotoCaptured(f);
    },
    [onPhotoCaptured],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRetake = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onPhotoCaptured(null as unknown as File);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasPhoto = file && preview;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!hasPhoto ? (
          <motion.button
            key="dropzone"
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Take a photo or upload a document"
            className={cn(
              "w-full aspect-[3/4] sm:aspect-square rounded-2xl border-2 border-dashed",
              "flex flex-col items-center justify-center gap-5 cursor-pointer",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/50",
            )}
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200",
                isDragging ? "bg-primary/10" : "bg-secondary",
              )}
            >
              <Camera
                className={cn(
                  "w-7 h-7 transition-colors duration-200",
                  isDragging ? "text-primary" : "text-muted-foreground",
                )}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-center px-6">
              <p className="text-foreground font-medium text-lg">
                Take a photo of any English letter
              </p>
              <p className="text-muted-foreground text-sm mt-1.5">
                Tap to open camera, or drag a photo here
              </p>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="relative w-full aspect-[3/4] sm:aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img
                src={preview}
                alt="Document preview"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-3 mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="flex-1 h-12 text-base gap-2"
                aria-label="Retake photo"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
              <Button
                type="button"
                onClick={onContinue}
                disabled={disabled}
                className="flex-1 h-12 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Continue to explanation"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
