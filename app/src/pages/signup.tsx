import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function SignupPage() {
  const navigate = useNavigate();
  const { code } = useLanguage();
  const labels = getLabels(code);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend yet — just route home for now.
    navigate("/", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="max-w-md mx-auto flex flex-col gap-8"
    >
      <div className="flex flex-col">
        <Link
          to="/save-history"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          {labels.back}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl text-foreground leading-tight mt-4">
          {labels.signupHeading}
        </h1>
        <p className="text-muted-foreground text-base mt-2 leading-relaxed">
          {labels.signupBody}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{labels.signupEmail}</span>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-border bg-card",
                "text-base text-foreground placeholder:text-muted-foreground/60",
                "transition-colors duration-200",
                "focus:outline-none focus:border-primary",
              )}
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">{labels.signupPassword}</span>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={cn(
                "w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-border bg-card",
                "text-base text-foreground placeholder:text-muted-foreground/60",
                "transition-colors duration-200",
                "focus:outline-none focus:border-primary",
              )}
              placeholder="••••••••"
            />
          </div>
        </label>

        <button
          type="submit"
          className={cn(
            "mt-2 inline-flex items-center justify-center gap-2 h-14 rounded-full",
            "bg-primary text-primary-foreground text-lg font-medium",
            "transition-all hover:bg-primary/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          {labels.signupSubmit}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <Link
        to="/"
        className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {labels.signupSkip}
      </Link>
    </motion.div>
  );
}
