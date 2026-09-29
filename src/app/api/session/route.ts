import { NextRequest, NextResponse } from "next/server";
import { SESSION, upstreamHeaders, upstreamUrl } from "@/lib/server";

const noStore = { "Cache-Control": "no-store" };

function sameOrigin(request: NextRequest): boolean {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    const host = request.headers.get("host");
    const scheme = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
      ?? request.nextUrl.protocol.slice(0, -1);
    return !!host && origin.host === host && origin.protocol === `${scheme}:`;
  } catch { return false; }
}

async function boundedJson(request: NextRequest): Promise<unknown> {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) throw new Error("Invalid content type");
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) { await reader.cancel(); throw new Error("Body too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!length) throw new Error("Missing body");
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403, headers: noStore });
  let credentials: unknown;
  try { credentials = await boundedJson(request); } catch { return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: noStore }); }
  if (!credentials || typeof credentials !== "object" || Array.isArray(credentials)) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: noStore });
  const body = credentials as Record<string, unknown>;
  if (Object.keys(body).sort().join(",") !== "email,password" || typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 256 || !body.email || !body.password)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: noStore });
  const url = upstreamUrl("/api/v1/admin/auth/signin");
  if (!url) return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: noStore });
  try {
    const headers = upstreamHeaders();
    headers.set("Content-Type", "application/json");
    const upstream = await fetch(url, { method: "POST", headers, body: JSON.stringify({ email: body.email, password: body.password }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) return NextResponse.json({ error: upstream.status === 401 ? "INVALID_CREDENTIALS" : upstream.status === 403 ? "ACCESS_DENIED" : "SERVICE_UNAVAILABLE" }, { status: upstream.status === 401 ? 401 : upstream.status === 403 ? 403 : 503, headers: noStore });
    const session: unknown = await upstream.json();
    if (!session || typeof session !== "object") throw new Error("Invalid session response");
    const issued = session as Record<string, unknown>;
    const user = issued.user as Record<string, unknown> | undefined;
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403, headers: noStore });
    if (issued.tokenType !== "Bearer" || typeof issued.accessToken !== "string" || issued.accessToken.length > 4096 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(issued.accessToken) || typeof issued.expiresIn !== "number" || !Number.isSafeInteger(issued.expiresIn) || issued.expiresIn < 1 || issued.expiresIn > 3600 || typeof user.userId !== "string") throw new Error("Invalid admin session response");
    const response = NextResponse.json({ ok: true }, { headers: noStore });
    response.cookies.set(SESSION, issued.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: Math.min(issued.expiresIn, 3600) });
    return response;
  } catch { return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: noStore }); }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ACCESS_DENIED" }, { status: 403, headers: noStore });
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.delete(SESSION);
  return response;
}
