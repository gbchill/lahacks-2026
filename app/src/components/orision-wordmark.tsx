import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type WordmarkSize = "sm" | "md" | "lg" | "xl";

const sizeConfig: Record<WordmarkSize, { imgSize: string; text: string; gap: string }> = {
  sm: { imgSize: "h-9 w-9", text: "text-base", gap: "gap-2" },
  md: { imgSize: "h-11 w-11", text: "text-lg", gap: "gap-2.5" },
  lg: { imgSize: "h-14 w-14", text: "text-2xl", gap: "gap-3" },
  xl: { imgSize: "h-20 w-20", text: "text-3xl", gap: "gap-3" },
};

type OrisionWordmarkProps = {
  size?: WordmarkSize;
  linked?: boolean;
  className?: string;
};

export function OrisionWordmark({ size = "md", linked = true, className }: OrisionWordmarkProps) {
  const s = sizeConfig[size];

  const content = (
    <span
      className={cn(
        "inline-flex items-center", s.gap,
        "transition-opacity hover:opacity-80",
        className,
      )}
    >
      <img
        src="/logo.png"
        alt="Orision"
        className={cn(s.imgSize, "object-contain shrink-0")}
      />
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
