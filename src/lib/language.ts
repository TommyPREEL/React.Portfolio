import type { Language } from "../i18n";

export const LANGUAGE_STORAGE_KEY = "portfolio.lang";

/** Saved choice first, then the browser language (French if it starts with "fr"), else English. */
export function pickLanguage(saved: string | null, browserLanguages: readonly string[]): Language {
  if (saved === "en" || saved === "fr") return saved;
  const first = browserLanguages[0]?.toLowerCase() ?? "";
  return first.startsWith("fr") ? "fr" : "en";
}

/** Browser storage can throw (private mode, blocked site data): never let it break the app. */
export function readSavedLanguage(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* preference simply not remembered */
  }
}
