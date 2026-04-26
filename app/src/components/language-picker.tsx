import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, getLanguage } from "@/lib/languages";
import { cn } from "@/lib/utils";

type LanguagePickerProps = {
  value: string;
  onChange: (code: string) => void;
  legend?: string;
};

export function LanguagePicker({ value, onChange, legend = "Explain this letter in" }: LanguagePickerProps) {
  return (
    <fieldset className="w-full" role="radiogroup" aria-label="Choose your language">
      <legend className="text-sm text-muted-foreground mb-3">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const selected = value === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${lang.label} (${lang.native})`}
              onClick={() => onChange(lang.code)}
              className={cn(
                "px-5 py-2.5 rounded-full text-base font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "min-h-[44px] min-w-[44px]",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
              )}
            >
              {lang.native}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

type LanguageDropdownProps = {
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;
};

export function LanguageDropdown({ value, onChange, placeholder = "Choose your language" }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = getLanguage(value);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full h-16 px-4 rounded-2xl border bg-background flex items-center gap-3 shadow-sm",
          "text-left transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0",
          open ? "border-primary/40" : "border-border hover:border-primary/40",
        )}
      >
        <Globe className="w-6 h-6 text-primary shrink-0" strokeWidth={2} />
        <span
          className={cn(
            "flex-1 text-lg font-medium truncate",
            selected ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {selected ? selected.native : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className={cn(
            "absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-border bg-popover shadow-lg",
            "max-h-72 overflow-y-auto p-1.5",
          )}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = value === lang.code;
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(lang.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 text-left rounded-xl cursor-pointer",
                    "transition-colors duration-150",
                    "hover:bg-[#F2F2F2] focus-visible:bg-[#F2F2F2] focus-visible:outline-none",
                  )}
                >
                  <span className="flex-1 flex items-baseline gap-2 min-w-0">
                    <span className="text-base font-medium text-foreground truncate">{lang.native}</span>
                    <span className="text-sm text-muted-foreground truncate">{lang.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
