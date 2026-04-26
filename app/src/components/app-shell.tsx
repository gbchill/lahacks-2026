import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";

export function AppShell() {
  const { code } = useLanguage();
  const labels = getLabels(code);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-5 py-8 flex-1">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-xl px-5 pb-6">
        <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
          {labels.disclaimer}
        </p>
      </footer>
    </div>
  );
}
