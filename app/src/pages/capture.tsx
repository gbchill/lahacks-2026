import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { CameraCard } from "@/components/camera-card";
import { LanguagePicker } from "@/components/language-picker";
import { explainDocument } from "@/lib/api";

export function CapturePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("zh-CN");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const response = await explainDocument(file, "demo-user-1", language);
      navigate(`/result/${response.document_id}`, { state: response });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      const isRateLimit = message.includes("RESOURCE_EXHAUSTED") || message.includes("429");
      const isOcr = message.includes("ocr");
      toast.error(
        isRateLimit
          ? "Too many requests"
          : "We couldn't read that photo",
        {
          description: isRateLimit
            ? "The API is temporarily overloaded. Wait a minute and try again."
            : isOcr
              ? "Try better lighting or a clearer angle."
              : "Please try again in a moment.",
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 max-w-md mx-auto"
    >
      <div>
        <h1 className="font-heading text-3xl text-foreground">
          What letter did you get?
        </h1>
        <p className="text-muted-foreground mt-1.5">
          Take a photo and we'll explain it in your language.
        </p>
      </div>

      <CameraCard
        file={file}
        onPhotoCaptured={setFile}
        onContinue={handleContinue}
        disabled={loading}
      />

      <LanguagePicker value={language} onChange={setLanguage} />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-base">
            Our agents are reading your document...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
