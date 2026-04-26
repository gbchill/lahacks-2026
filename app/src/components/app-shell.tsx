import { Outlet } from "react-router-dom";
import { BottomTabBar } from "./bottom-tab-bar";
import { OrisionWordmark } from "./orision-wordmark";
import { useLanguage } from "@/contexts/language-context";
import { getLabels } from "@/lib/menu-labels";

export function AppShell() {
  const { code } = useLanguage();
  const labels = getLabels(code);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-5 h-14 flex items-center">
          <OrisionWordmark size="lg" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pt-8 pb-24 flex-1">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-xl px-5 pb-6">
        <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
          {labels.disclaimer}
        </p>
      </footer>

      <BottomTabBar />
    </div>
  );
}
