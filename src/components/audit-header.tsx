"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "./brand-mark";

export function AuditHeader() {
  const router = useRouter();
  async function signOut() { await fetch("/api/session", { method: "DELETE", cache: "no-store" }); router.replace("/login"); }
  return <header className="topbar"><Link href="/audit" className="brand" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}><BrandMark size={29} decorative /><span>Floww</span><small>ADMIN</small></Link><nav aria-label="Admin navigation"><Link href="/audit">Task audit</Link><button onClick={signOut}>Sign out</button></nav></header>;
}
