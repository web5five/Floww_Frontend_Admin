"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageControl, useLanguage } from "@/components/language-provider";
import { MessageKey } from "@/lib/locale";

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
      if (!response.ok) { setError(response.status === 401 ? "invalidCredentials" : response.status === 403 ? "accountUnavailable" : "signInUnavailable"); return; }
      setPassword("");
      router.replace("/audit");
    } catch { setError("signInUnavailable"); }
    finally { setBusy(false); }
  }

  return <main className="login-shell"><div className="login-art" aria-hidden="true"><span className="brand">floww<span className="brand-dot">.</span></span><div className="art-lines"><i/><i/><i/></div><p>{t("tagline")}</p></div><section className="login-panel"><div className="login-language"><LanguageControl/></div><div className="eyebrow">{t("operationsAudit")}</div><h1>{t("signInTitle")}</h1><p className="muted">{t("restricted")}</p><form onSubmit={signIn}><label>{t("email")}<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>{t("password")}<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="alert" role="alert">{t(error)}</p>}<button className="primary" disabled={busy}>{busy ? t("signingIn") : t("signIn")}</button></form></section></main>;
}
