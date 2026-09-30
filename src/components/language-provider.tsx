"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { Language, languageStorageKey, MessageKey, messages, statusLabel, formatDate } from "@/lib/locale";

type LocaleContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey) => string; status: (value: string | null | undefined) => string; date: (value: string | null | undefined) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);
const languageChanged = "floww-admin-language-changed";

function readLanguage(): Language {
  const saved = window.localStorage.getItem(languageStorageKey);
  return saved === "ko" ? "ko" : "en";
}
function serverLanguage(): Language { return "en"; }
function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(languageChanged, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(languageChanged, callback); };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, readLanguage, serverLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = messages[language].pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", messages[language].pageDescription);
  }, [language]);
  function setLanguage(next: Language) { window.localStorage.setItem(languageStorageKey, next); window.dispatchEvent(new Event(languageChanged)); }
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
