"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Language, languageStorageKey, MessageKey, messages, statusLabel, formatDate } from "@/lib/locale";

type LocaleContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey) => string; status: (value: string | null | undefined) => string; date: (value: string | null | undefined) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);
const languageChanged = "floww-admin-language-changed";

function readLanguage(fallback: Language): Language {
  try {
    const saved = window.localStorage.getItem(languageStorageKey);
    if (saved === "ko" || saved === "en") return saved;
  } catch { /* cookie/server language remains available */ }
  return fallback;
}
function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(languageChanged, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(languageChanged, callback); };
}

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage: Language }) {
  const language = useSyncExternalStore(subscribe, () => readLanguage(initialLanguage), () => initialLanguage);
  const pathname = usePathname();
  useEffect(() => {
    if (document.documentElement.dataset.localePending && language !== readLanguage(initialLanguage)) return;
    document.documentElement.lang = language;
    document.title = messages[language].pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", messages[language].pageDescription);
    delete document.documentElement.dataset.localePending;
  }, [initialLanguage, language, pathname]);
  function setLanguage(next: Language) {
    try { window.localStorage.setItem(languageStorageKey, next); } catch { /* cookie still persists */ }
    document.cookie = `${languageStorageKey}=${next}; Path=/; Max-Age=31536000; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`;
    window.dispatchEvent(new Event(languageChanged));
  }
  return <LocaleContext.Provider value={{ language, setLanguage, t: key => messages[language][key], status: value => statusLabel(value, language), date: value => formatDate(value, language) }}>{children}</LocaleContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("LanguageProvider is required");
  return context;
}

export function LanguageControl() {
  const { language, setLanguage, t } = useLanguage();
  return <label className="language-control"><span>{t("language")}</span><select aria-label={t("settings")} value={language} onChange={event => setLanguage(event.target.value as Language)}><option value="ko">{t("korean")}</option><option value="en">{t("english")}</option></select></label>;
}
