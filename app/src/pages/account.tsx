import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { getLabels, getNativeName } from "@/lib/menu-labels";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function AccountPage() {
  const { user, signOut } = useAuth();
  const { code } = useLanguage();
  const labels = getLabels(code);
  const navigate = useNavigate();

  const name = (user?.user_metadata?.name as string | undefined) ?? "";
  const email = user?.email ?? "";
  const relationship = user?.user_metadata?.relationship as string | undefined;
  const voiceId = user?.user_metadata?.voice_id as string | undefined;
  const initials = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : "?";
  const langName = getNativeName(code);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-base text-muted-foreground">You are not signed in.</p>
        <Link
          to="/login"
          className="rounded-xl bg-primary text-primary-foreground h-12 px-6 font-medium hover:brightness-105 transition-all inline-flex items-center justify-center text-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="text-3xl font-semibold tracking-tight text-foreground"
      >
        {labels.accountTitle}
      </motion.h1>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06, ease }}
        className={cn(
          "rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6",
          "flex items-center gap-5",
        )}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span className="text-2xl font-semibold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          {name && (
            <p className="text-lg font-semibold text-foreground truncate">{name}</p>
          )}
          <p className="text-base text-muted-foreground truncate">{email}</p>
          {relationship && (
            <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {relationship}
            </span>
          )}
        </div>
      </motion.div>

      {/* Language section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease }}
        className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-0.5">
              {labels.accountLanguage}
            </p>
            <p className="text-base font-semibold text-foreground">{langName}</p>
          </div>
          <Link
            to="/"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Change
          </Link>
        </div>
      </motion.div>

      {/* Voice section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease }}
        className="rounded-2xl bg-card/60 backdrop-blur-xl ring-1 ring-white/10 shadow-lg shadow-black/5 p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-0.5">
              {labels.accountVoice}
            </p>
            {voiceId ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                <p className="text-base font-semibold text-foreground">
                  {labels.accountVoiceSet}
                </p>
              </div>
            ) : (
              <p className="text-base text-muted-foreground">
                {labels.accountVoiceRecord}
              </p>
            )}
          </div>
          {!voiceId && (
            <Link
              to="/onboarding"
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium shrink-0"
            >
              Set up
            </Link>
          )}
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24, ease }}
      >
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-xl border border-destructive/30 text-destructive h-12 w-full hover:bg-destructive/5 transition-colors text-sm font-medium"
        >
          {labels.accountSignOut}
        </button>
      </motion.div>
    </div>
  );
}
