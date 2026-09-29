import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION = "floww_admin_session";

export function upstreamUrl(path: string): URL | null {
  const configured = process.env.FLOWW_SERVER_URL;
  if (!configured) return null;
  try {
    const base = new URL(configured);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
    if (!(base.protocol === "https:" || (base.protocol === "http:" && loopback)) || base.username || base.password || base.search || base.hash || base.pathname !== "/") return null;
    if (!(path === "/api/v1/admin/auth/signin" || /^\/api\/v1\/admin\/audit\/tasks(?:\?|\/|$)/.test(path))) return null;
    return new URL(path, base);
  } catch { return null; }
}

export function upstreamHeaders(token?: string): Headers {
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const bypass = process.env.FLOWW_SERVER_VERCEL_BYPASS_SECRET;
  if (bypass) headers.set("x-vercel-protection-bypass", bypass);
  return headers;
}

export async function adminGet(path: string): Promise<NextResponse> {
  const token = (await cookies()).get(SESSION)?.value;
  if (!token) return NextResponse.json({ error: "SESSION_REQUIRED" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const url = upstreamUrl(path);
  if (!url) return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const result = await fetch(url, { method: "GET", headers: upstreamHeaders(token), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
    const body = result.ok ? await result.json() : { error: result.status === 401 ? "SESSION_EXPIRED" : result.status === 403 ? "ACCESS_DENIED" : result.status === 404 ? "NOT_FOUND" : "SERVICE_UNAVAILABLE" };
    const response = NextResponse.json(body, { status: result.ok ? 200 : [401, 403, 404].includes(result.status) ? result.status : 503, headers: { "Cache-Control": "no-store" } });
    if (result.status === 401) response.cookies.delete(SESSION);
    return response;
  } catch {
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
