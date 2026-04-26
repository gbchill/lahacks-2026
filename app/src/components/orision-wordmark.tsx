import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type WordmarkSize = "sm" | "md" | "lg" | "xl";

const sizeConfig: Record<WordmarkSize, { icon: string; iconSize: string; text: string; gap: string; bubble: string }> = {
  sm: { icon: "h-4 w-4", iconSize: "w-7 h-7", text: "text-base", gap: "gap-2", bubble: "bg-primary/15" },
  md: { icon: "h-5 w-5", iconSize: "w-8 h-8", text: "text-lg", gap: "gap-2.5", bubble: "bg-primary/15" },
  lg: { icon: "h-5 w-5", iconSize: "w-10 h-10", text: "text-2xl", gap: "gap-3", bubble: "bg-primary/20" },
  xl: { icon: "h-6 w-6", iconSize: "w-14 h-14", text: "text-3xl", gap: "gap-3", bubble: "bg-primary" },
};

type OrisionWordmarkProps = {
  size?: WordmarkSize;
  linked?: boolean;
  className?: string;
};

export function OrisionWordmark({ size = "md", linked = true, className }: OrisionWordmarkProps) {
  const s = sizeConfig[size];
  const isXl = size === "xl";

  const content = (
    <span
      className={cn(
        "inline-flex items-center", s.gap,
        "transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span
        className={cn(
          s.iconSize, "rounded-full flex items-center justify-center shrink-0",
          s.bubble,
          isXl ? "text-primary-foreground animate-orision-float" : "text-primary",
        )}
      >
        <Globe className={s.icon} strokeWidth={isXl ? 2.5 : 2} />
      </span>
      <span className={cn("font-heading tracking-tight text-foreground/80", s.text)}>
        Orision
      </span>
    </span>
  );

  if (!linked) return content;

  return (
    <Link to="/" className="no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg">
      {content}
    </Link>
  );
}
