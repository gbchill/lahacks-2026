import { cn } from "@/lib/utils";

export type Language = {
  code: string;
  native: string;
  label: string;
};

export const LANGUAGES: Language[] = [
  { code: "zh-CN", native: "中文", label: "Mandarin" },
  { code: "es", native: "Español", label: "Spanish" },
  { code: "vi", native: "Tiếng Việt", label: "Vietnamese" },
  { code: "ro", native: "Română", label: "Romanian" },
];

type LanguagePickerProps = {
  value: string;
  onChange: (code: string) => void;
};

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  return (
    <fieldset className="w-full" role="radiogroup" aria-label="Choose your language">
      <legend className="text-sm text-muted-foreground mb-3">
        Explain this letter in
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
