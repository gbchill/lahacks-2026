import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { Toaster } from "sonner";
import { App } from "./App";
import { LanguageProvider } from "./contexts/language-context";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "var(--radius)",
            },
          }}
        />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
