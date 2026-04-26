import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "orision.language";

type LanguageContextValue = {
  code: string | null;
  set: (code: string) => void;
  clear: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<string | null>(() => readStoredLanguage());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCode(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const set = useCallback((next: string) => {
    setCode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, []);

  const clear = useCallback(() => {
    setCode(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ code, set, clear }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
