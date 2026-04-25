import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { LandingPage } from "./pages/landing";
import { CapturePage } from "./pages/capture";
import { ResultPage } from "./pages/result";
import { FamilyPage } from "./pages/family";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/capture" element={<CapturePage />} />
        <Route path="/result/:documentId" element={<ResultPage />} />
        <Route path="/family" element={<FamilyPage />} />
      </Route>
    </Routes>
  );
}
