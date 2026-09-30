"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "./brand-mark";
import { LanguageControl, useLanguage } from "./language-provider";

export function AuditHeader() {
  const router = useRouter();
  const { t } = useLanguage();
  async function signOut() { await fetch("/api/session", { method: "DELETE", cache: "no-store" }); router.replace("/login"); }
  return <header className="topbar"><Link href="/audit" className="brand" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><BrandMark size={29} decorative /><span>Floww</span><small>{t("admin")}</small></Link><nav aria-label={t("navigation")}><Link href="/audit">{t("taskAudit")}</Link><LanguageControl/><button onClick={signOut}>{t("signOut")}</button></nav></header>;
}
