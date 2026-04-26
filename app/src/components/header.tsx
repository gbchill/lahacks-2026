import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

export function Header() {
  const { code } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const labels = getLabels(code);

  const onWelcome = location.pathname === "/welcome";

  return (
    <header className="w-full border-b border-border/60 bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="font-heading text-2xl text-foreground no-underline hover:opacity-80 transition-opacity"
        >
          Orision
        </Link>

        {!onWelcome && (
          <button
            type="button"
            onClick={() => navigate("/welcome")}
            aria-label={labels.goBack}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border bg-card",
              "text-sm font-medium text-foreground",
              "transition-colors hover:bg-secondary hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <span>{labels.goBack}</span>
          </button>
        )}
      </div>
    </header>
  );
}
