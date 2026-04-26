import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { WelcomePage } from "./pages/welcome";
import { HomePage } from "./pages/home";
import { CapturePage } from "./pages/capture";
import { ResultPage } from "./pages/result";
import { SignupPage } from "./pages/signup";
import { FamilyPage } from "./pages/family";
import { TranslatingPage } from "./routes/translating";
import { LoginPage } from "./pages/login";
import { AccountPage } from "./pages/account";
import { OnboardingPage } from "./pages/onboarding";

export function App() {
  return (
    <Routes>
      {/* Standalone (no shell) */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/translating" element={<TranslatingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* AppShell (with bottom tab bar) */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result/:documentId" element={<ResultPage />} />

        {/* AppShell + ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/documents" element={<FamilyPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
