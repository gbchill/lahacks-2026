import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const isOnboarded = user.user_metadata?.onboarding_complete === true;
      navigate(isOnboarded ? "/home" : "/onboarding", { replace: true });
      return;
    }

    // OAuth callback: Supabase is still exchanging the URL hash for a session.
    // Wait for onAuthStateChange to fire with the real session instead of
    // immediately redirecting to /login. Fall back after 5s if it never arrives.
    const hasOAuthParams =
      window.location.hash.includes("access_token") ||
      window.location.search.includes("code=");

    if (hasOAuthParams) {
      timerRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 5000);
      return;
    }

    navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      aria-label="Loading"
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent opacity-60" />
    </div>
  );
}
