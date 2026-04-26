import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, ArrowRight, Upload, SwitchCamera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";

type CameraCardProps = {
  onPhotoCaptured: (file: File) => void;
  onContinue: () => void;
  file: File | null;
  disabled?: boolean;
};

type Mode = "choose" | "camera" | "preview";

export function CameraCard({ onPhotoCaptured, onContinue, file, disabled }: CameraCardProps) {
  const { code } = useLanguage();
  const labels = getLabels(code);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("choose");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setMode("choose");
    }
  }, [stopStream]);

  useEffect(() => {
    if (mode === "camera") {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return stopStream;
  }, [mode, facingMode, startCamera, stopStream]);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      const url = URL.createObjectURL(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setMode("preview");
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

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFile(f);
    }, "image/jpeg", 0.92);
  };

  const handleRetake = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onPhotoCaptured(null as unknown as File);
    if (inputRef.current) inputRef.current.value = "";
    setMode("choose");
  };

  const hasPhoto = file && preview;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {mode === "choose" && !hasPhoto && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <button
              type="button"
              onClick={() => setMode("camera")}
              className={cn(
                "w-full aspect-[3/4] sm:aspect-square rounded-2xl border-2 border-dashed",
                "flex flex-col items-center justify-center gap-5 cursor-pointer",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "border-border hover:border-primary/50 hover:bg-secondary/50",
              )}
              aria-label={labels.cameraTitle}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-secondary">
                <Camera className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="text-center px-6">
                <p className="text-foreground font-medium text-lg">
                  {labels.cameraTitle}
                </p>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {labels.cameraSubtitle}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "w-full rounded-2xl border-2 border-dashed py-6",
                "flex flex-col items-center justify-center gap-3 cursor-pointer",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50",
              )}
            >
              <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-muted-foreground text-sm font-medium">
                Upload from gallery
              </p>
            </button>
          </motion.div>
        )}

        {mode === "camera" && !hasPhoto && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="relative w-full aspect-[3/4] sm:aspect-square rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFacingMode((f) => f === "environment" ? "user" : "environment")}
                  className="rounded-full w-11 h-11 bg-black/40 border-white/20 text-white hover:bg-black/60"
                  aria-label="Switch camera"
                >
                  <SwitchCamera className="w-5 h-5" />
                </Button>

                <button
                  type="button"
                  onClick={handleCapture}
                  className="w-16 h-16 rounded-full bg-white border-4 border-white/50 shadow-lg active:scale-90 transition-transform"
                  aria-label="Take photo"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setMode("choose")}
                  className="rounded-full w-11 h-11 bg-black/40 border-white/20 text-white hover:bg-black/60"
                  aria-label="Cancel"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {mode === "preview" && hasPhoto && (
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
                aria-label={labels.cameraRetake}
              >
                <RotateCcw className="w-4 h-4" />
                {labels.cameraRetake}
              </Button>
              <Button
                type="button"
                onClick={onContinue}
                disabled={disabled}
                className="flex-1 h-12 text-base gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label={labels.cameraContinue}
              >
                {labels.cameraContinue}
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
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
