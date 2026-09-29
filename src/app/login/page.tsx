"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" });
      if (!response.ok) { setError(response.status === 401 ? "Invalid admin credentials." : response.status === 403 ? "Admin access is unavailable for this account." : "Sign-in is unavailable. Try again."); return; }
      setPassword("");
      router.replace("/audit");
    } catch { setError("Sign-in is unavailable. Try again."); }
    finally { setBusy(false); }
  }

  return <main className="login-shell"><div className="login-art" aria-hidden="true"><span className="brand">floww<span className="brand-dot">.</span></span><div className="art-lines"><i/><i/><i/></div><p>See every decision<br/>in the flow.</p></div><section className="login-panel"><div className="eyebrow">OPERATIONS / AUDIT</div><h1>Admin sign in</h1><p className="muted">Access is limited to authorized operators.</p><form onSubmit={signIn}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="alert" role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></section></main>;
}
