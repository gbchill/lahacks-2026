import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CameraCard } from "@/components/camera-card";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";

export function CapturePage() {
  const navigate = useNavigate();
  const { code } = useLanguage();
  const labels = getLabels(code);
  const [file, setFile] = useState<File | null>(null);

  const handleContinue = () => {
    if (!file || !code) return;
    navigate("/translating", {
      state: {
        file,
        targetLanguage: code,
        userId: "demo-user-1",
      },
    });
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
          {labels.captureHeading}
        </h1>
        <p className="text-muted-foreground mt-1.5">
          {labels.captureSubtitle}
        </p>
      </div>

      <CameraCard
        file={file}
        onPhotoCaptured={setFile}
        onContinue={handleContinue}
        disabled={false}
      />
    </motion.div>
  );
}
