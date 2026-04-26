import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { OrisionWordmark } from "@/components/orision-wordmark";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { code } = useLanguage();
  const labels = getLabels(code);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5 px-5 py-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OrisionWordmark size="md" linked={false} />
      </motion.header>

      <div className="flex-1 flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className={cn(
          "w-full max-w-sm rounded-2xl",
          "bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5",
          "p-8",
        )}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
          {labels.loginHeading}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.emailPlaceholder}
            className={cn(
              "w-full rounded-xl bg-white/5 border border-white/10 h-12 px-4",
              "text-base text-foreground placeholder:text-muted-foreground/60",
              "focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all",
            )}
          />

          {/* Password with show/hide toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={labels.passwordPlaceholder}
              className={cn(
                "w-full rounded-xl bg-white/5 border border-white/10 h-12 px-4 pr-11",
                "text-base text-foreground placeholder:text-muted-foreground/60",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/30 outline-none transition-all",
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "rounded-xl bg-primary text-primary-foreground h-12 px-6 w-full font-medium",
              "hover:brightness-105 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          >
            {loading ? "…" : labels.loginSubmit}
          </button>
        </form>

        {/* Bottom links inside card */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {labels.loginNoAccount}{" "}
            <Link
              to="/signup"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {labels.loginCreateAccount}
            </Link>
          </p>
          <Link
            to="/home"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {labels.loginContinueWithout}
          </Link>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
