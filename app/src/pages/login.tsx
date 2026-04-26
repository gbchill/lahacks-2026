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
  const { signIn, signInWithGoogle } = useAuth();
  const { code } = useLanguage();
  const labels = getLabels(code);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

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
        <OrisionWordmark size="md" />
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

        <div className="flex flex-col gap-3 mb-2">
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className={cn(
              "w-full rounded-xl h-12 px-6 font-medium",
              "bg-white text-[#1f1f1f] border-2 border-black/20",
              "hover:bg-white/90 transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              "flex items-center justify-center gap-3",
            )}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91A8.8 8.8 0 0 0 17.64 9.2Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26a5.55 5.55 0 0 1-8.25-2.91H.77v2.33A9 9 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M2.8 10.65a5.39 5.39 0 0 1 0-3.3V4.99H.77a9 9 0 0 0 0 8.02L2.8 10.65Z"/>
              <path fill="#EA4335" d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35L14.5 2.87A8.65 8.65 0 0 0 9 .99 9 9 0 0 0 .77 4.99L2.8 7.34A5.36 5.36 0 0 1 9 3.58Z"/>
            </svg>
            <span className="text-base">
              {googleLoading ? "…" : labels.continueWithGoogle}
            </span>
          </button>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground/60 shrink-0">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </div>

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
