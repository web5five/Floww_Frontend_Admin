import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { Language, messages } from "@/lib/locale";

async function initialLanguage(): Promise<Language> {
  return (await cookies()).get("floww_admin_language")?.value === "ko" ? "ko" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await initialLanguage();
  return { title: messages[language].pageTitle, description: messages[language].pageDescription, robots: { index: false, follow: false } };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = await initialLanguage();
  const prepaint = "try{var v=localStorage.getItem('floww_admin_language');if((v==='ko'||v==='en')&&v!==document.documentElement.lang){document.documentElement.dataset.localePending='true';document.documentElement.lang=v;document.title=v==='ko'?'Floww | 관리자 감사':'Floww | Admin audit'}}catch(e){}";
  return <html lang={language} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: prepaint }}/></head><body><LanguageProvider initialLanguage={language}>{children}</LanguageProvider></body></html>;
}
