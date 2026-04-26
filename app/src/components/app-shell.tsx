import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Toaster } from "sonner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-5 py-8 flex-1">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-xl px-5 pb-6">
        <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
          Orision is not responsible for the accuracy or authenticity of uploaded documents. Users should independently verify documents by contacting the issuing office directly.
        </p>
      </footer>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            borderRadius: "var(--radius)",
          },
        }}
      />
    </div>
  );
}
