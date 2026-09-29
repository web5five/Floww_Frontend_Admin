"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuditHeader() {
  const router = useRouter();
  async function signOut() { await fetch("/api/session", { method: "DELETE", cache: "no-store" }); router.replace("/login"); }
  return <header className="topbar"><Link href="/audit" className="brand">floww<span className="brand-dot">.</span><small>ADMIN</small></Link><nav aria-label="Admin navigation"><Link href="/audit">Task audit</Link><button onClick={signOut}>Sign out</button></nav></header>;
}
