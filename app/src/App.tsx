import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { WelcomePage } from "./pages/welcome";
import { HomePage } from "./pages/home";
import { CapturePage } from "./pages/capture";
import { ResultPage } from "./pages/result";
import { SaveHistoryPage } from "./pages/save-history";
import { SignupPage } from "./pages/signup";
import { FamilyPage } from "./pages/family";
import { TranslatingPage } from "./routes/translating";
import { useLanguage } from "./contexts/language-context";

function RequireLanguage({ children }: { children: React.ReactNode }) {
  const { code } = useLanguage();
  if (!code) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route
        path="/translating"
        element={
          <RequireLanguage>
            <TranslatingPage />
          </RequireLanguage>
        }
      />
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <RequireLanguage>
              <HomePage />
            </RequireLanguage>
          }
        />
        <Route
          path="/capture"
          element={
            <RequireLanguage>
              <CapturePage />
            </RequireLanguage>
          }
        />
        <Route
          path="/result/:documentId"
          element={
            <RequireLanguage>
              <ResultPage />
            </RequireLanguage>
          }
        />
        <Route
          path="/save-history"
          element={
            <RequireLanguage>
              <SaveHistoryPage />
            </RequireLanguage>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireLanguage>
              <SignupPage />
            </RequireLanguage>
          }
        />
        <Route
          path="/family"
          element={
            <RequireLanguage>
              <FamilyPage />
            </RequireLanguage>
          }
        />
      </Route>
    </Routes>
  );
}
