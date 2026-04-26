import { Outlet } from "react-router-dom";
import { BottomTabBar } from "./bottom-tab-bar";
import { OrisionWordmark } from "./orision-wordmark";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-5 h-14 flex items-center">
          <OrisionWordmark size="md" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pt-8 pb-24 flex-1">
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  );
}
