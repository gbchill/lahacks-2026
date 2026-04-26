import { Calendar, AlertCircle, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";
import type { KeyFacts as KeyFactsType } from "@/lib/api";

type KeyFactsProps = {
  facts: KeyFactsType;
};

function isDeadlineSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  try {
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return false;
    const daysUntil = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 14;
  } catch {
    return false;
  }
}

export function KeyFacts({ facts }: KeyFactsProps) {
  const { code } = useLanguage();
  const labels = getLabels(code);
  const deadlineSoon = isDeadlineSoon(facts.deadline);
  const hasAny = facts.deadline || facts.action_required || facts.amount_due;

  if (!hasAny) return null;

  const cards = [
    {
      icon: Calendar,
      label: labels.factsDeadline,
      value: facts.deadline,
      urgent: deadlineSoon,
    },
    {
      icon: AlertCircle,
      label: labels.factsAction,
      value: facts.action_required,
      urgent: false,
    },
    {
      icon: DollarSign,
      label: labels.factsAmount,
      value: facts.amount_due,
      urgent: false,
    },
  ];

  const visibleCards = cards.filter((card) => card.value);

  if (visibleCards.length === 0) return null;

  return (
    <div className={cn("grid gap-3", visibleCards.length === 1 ? "grid-cols-1" : visibleCards.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
      {visibleCards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl border p-4",
            card.urgent
              ? "border-primary/30 bg-primary/5"
              : "border-border bg-card",
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon
              className={cn(
                "w-4 h-4",
                card.urgent ? "text-primary" : "text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                card.urgent ? "text-primary" : "text-muted-foreground",
              )}
            >
              {card.label}
            </span>
          </div>
          <p className="text-base font-medium text-foreground">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
