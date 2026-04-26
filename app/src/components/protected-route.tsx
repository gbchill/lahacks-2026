import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
