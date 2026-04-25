import { Calendar, AlertCircle, DollarSign } from "lucide-react";
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
  const deadlineSoon = isDeadlineSoon(facts.deadline);
  const hasAny = facts.deadline || facts.action_required || facts.amount_due;

  if (!hasAny) return null;

  const cards = [
    {
      icon: Calendar,
      label: "Deadline",
      value: facts.deadline,
      urgent: deadlineSoon,
    },
    {
      icon: AlertCircle,
      label: "Action Required",
      value: facts.action_required,
      urgent: false,
    },
    {
      icon: DollarSign,
      label: "Amount Due",
      value: facts.amount_due,
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => (
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
          <p
            className={cn(
              "text-base font-medium",
              card.value ? "text-foreground" : "text-muted-foreground/40",
            )}
          >
            {card.value ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
