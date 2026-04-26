import { Routes, Route } from "react-router-dom";
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

export function App() {
  const { code } = useLanguage();

  if (!code) {
    return (
      <Routes>
        <Route path="*" element={<WelcomePage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/translating" element={<TranslatingPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result/:documentId" element={<ResultPage />} />
        <Route path="/save-history" element={<SaveHistoryPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/family" element={<FamilyPage />} />
      </Route>
    </Routes>
  );
}
