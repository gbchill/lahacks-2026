import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CameraCard } from "@/components/camera-card";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { getLabels } from "@/lib/menu-labels";

const ease = [0.16, 1, 0.3, 1] as const;

const DOC_EXAMPLES: Record<string, string[]> = {
  en: [
    "Medical bills & prescriptions",
    "USCIS immigration notices",
    "School enrollment forms",
    "IRS tax letters",
    "Lease & rental agreements",
    "Medicaid & insurance documents",
    "DMV registration notices",
    "Utility bills & statements",
  ],
  "zh-CN": [
    "医疗账单和处方",
    "USCIS 移民通知",
    "学校入学表格",
    "IRS 税务信件",
    "租赁合同",
    "Medicaid 和保险文件",
    "DMV 登记通知",
    "水电费账单",
  ],
  es: [
    "Facturas médicas y recetas",
    "Avisos de inmigración USCIS",
    "Formularios de inscripción escolar",
    "Cartas del IRS",
    "Contratos de alquiler",
    "Documentos de Medicaid y seguros",
    "Avisos del DMV",
    "Facturas de servicios públicos",
  ],
  vi: [
    "Hóa đơn y tế và đơn thuốc",
    "Thông báo di trú USCIS",
    "Biểu mẫu nhập học",
    "Thư thuế IRS",
    "Hợp đồng thuê nhà",
    "Tài liệu Medicaid và bảo hiểm",
    "Thông báo DMV",
    "Hóa đơn tiện ích",
  ],
  ro: [
    "Facturi medicale și rețete",
    "Notificări USCIS de imigrare",
    "Formulare de înscriere școlară",
    "Scrisori IRS",
    "Contracte de închiriere",
    "Documente Medicaid și asigurări",
    "Notificări DMV",
    "Facturi de utilități",
  ],
};

function getDocExamples(code: string | null): string[] {
  if (!code) return DOC_EXAMPLES.en;
  return DOC_EXAMPLES[code] ?? DOC_EXAMPLES.en;
}

export function CapturePage() {
  const navigate = useNavigate();
  const { code } = useLanguage();
  const { user, session } = useAuth();
  const labels = getLabels(code);
  const [file, setFile] = useState<File | null>(null);
  const examples = getDocExamples(code);
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setExampleIndex((i) => (i + 1) % examples.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [examples.length]);

  const handleContinue = () => {
    if (!file || !code) return;
    navigate("/translating", {
      state: {
        file,
        targetLanguage: code,
        userId: user?.id ?? "anonymous",
        token: session?.access_token,
        voiceId: user?.user_metadata?.voice_id,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      className="flex flex-col gap-8 max-w-md mx-auto"
    >
      <div className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {labels.captureHeading}
        </h1>

        <div className="mt-3 h-7 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={exampleIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease }}
              className="text-base font-medium text-foreground"
            >
              {examples[exampleIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
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
