import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";

export function FamilyPage() {
  const { code } = useLanguage();
  const labels = getLabels(code);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="font-heading text-3xl">{labels.familyTitle}</h2>
      <p className="text-muted-foreground mt-2">{labels.familySubtitle}</p>
    </div>
  );
}
