export type Language = {
  code: string;
  native: string;
  label: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", native: "English", label: "English" },
  { code: "zh-CN", native: "中文", label: "Mandarin" },
  { code: "es", native: "Español", label: "Spanish" },
  { code: "vi", native: "Tiếng Việt", label: "Vietnamese" },
  { code: "ro", native: "Română", label: "Romanian" },
];

export function getLanguage(code: string | null | undefined): Language | undefined {
  if (!code) return undefined;
  return LANGUAGES.find((l) => l.code === code);
}
