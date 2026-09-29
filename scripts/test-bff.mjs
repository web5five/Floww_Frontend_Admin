import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";

const token = "fixture.header.signature";
const bypass = "local-fixture-proof";
let upstreamCalls = 0;
let unexpectedRedirectCalls = 0;
let signInMode = "ok";
let auditMode = "ok";

const diverted = createServer((_request, response) => { unexpectedRedirectCalls++; response.writeHead(200).end("unexpected"); });
await new Promise(resolve => diverted.listen(0, "127.0.0.1", resolve));
const divertedPort = diverted.address().port;

const upstream = createServer(async (request, response) => {
  upstreamCalls++;
  assert.equal(request.headers["x-vercel-protection-bypass"], bypass);
  if (request.url === "/api/v1/admin/auth/signin") {
    assert.equal(request.method, "POST");
    assert.equal(request.headers.authorization, undefined);
    if (signInMode === "redirect") { response.writeHead(307, { Location: `http://127.0.0.1:${divertedPort}/capture` }).end(); return; }
    for await (const chunk of request) { void chunk; /* consume without logging credentials */ }
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ accessToken: token, tokenType: "Bearer", expiresIn: 1800,
      user: { userId: "11111111-1111-4111-8111-111111111111", role: signInMode === "user" ? "USER" : "ADMIN" } }));
    return;
  }
  assert.equal(request.headers.authorization, `Bearer ${token}`);
  if (auditMode === "redirect") { response.writeHead(307, { Location: `http://127.0.0.1:${divertedPort}/capture` }).end(); return; }
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ tasks: [], total: 0, page: 0, limit: 20 }));
});
await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve));
const upstreamPort = upstream.address().port;

const appPort = 32000 + Math.floor(Math.random() * 10000);
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(appPort)], {
  env: { ...process.env, FLOWW_SERVER_URL: `http://127.0.0.1:${upstreamPort}`,
    FLOWW_SERVER_VERCEL_BYPASS_SECRET: bypass }, stdio: "ignore"
});

const root = `http://127.0.0.1:${appPort}`;
async function ready() {
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error("Admin server exited before ready");
    try { const response = await fetch(`${root}/login`); if (response.ok) return; } catch { /* starting */ }
    await delay(100);
  }
  throw new Error("Admin server did not become ready");
}

try {
  await ready();
  let result = await fetch(`${root}/api/audit/tasks`);
  assert.equal(result.status, 401);
  assert.equal(upstreamCalls, 0);

  const body = JSON.stringify({ email: "admin@example.test", password: "fixture-password" });
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: "https://untrusted.example", "Content-Type": "application/json" }, body });
  assert.equal(result.status, 403);
  assert.equal(upstreamCalls, 0);
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: root, "Content-Type": "text/plain" }, body });
  assert.equal(result.status, 400);
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: root, "Content-Type": "application/json" }, body: body + " ".repeat(4200) });
  assert.equal(result.status, 400);
  assert.equal(upstreamCalls, 0);

  signInMode = "user";
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: root, "Content-Type": "application/json" }, body });
  assert.equal(result.status, 403);
  assert.equal(result.headers.get("set-cookie"), null);

  signInMode = "redirect";
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: root, "Content-Type": "application/json" }, body });
  assert.equal(result.status, 503);
  assert.equal(unexpectedRedirectCalls, 0);

  signInMode = "ok";
  result = await fetch(`${root}/api/session`, { method: "POST", headers: { Origin: root, "Content-Type": "application/json" }, body });
  assert.equal(result.status, 200);
  assert.equal(await result.text(), '{"ok":true}');
  assert.match(result.headers.get("set-cookie") ?? "", /HttpOnly/i);
  assert.match(result.headers.get("set-cookie") ?? "", /SameSite=Strict/i);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(result.headers.get("x-vercel-protection-bypass"), null);
  const cookie = (result.headers.get("set-cookie") ?? "").split(";")[0];
  assert.ok(cookie);

  result = await fetch(`${root}/api/audit/tasks`, { headers: { Cookie: cookie } });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).total, 0);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(result.headers.get("x-vercel-protection-bypass"), null);

  auditMode = "redirect";
  result = await fetch(`${root}/api/audit/tasks`, { headers: { Cookie: cookie } });
  assert.equal(result.status, 503);
  assert.equal(unexpectedRedirectCalls, 0);
  result = await fetch(`${root}/api/audit/tasks?limit=51`, { headers: { Cookie: cookie } });
  assert.equal(result.status, 400);
  result = await fetch(`${root}/api/audit/tasks/not-a-uuid`, { headers: { Cookie: cookie } });
  assert.equal(result.status, 400);
  result = await fetch(`${root}/api/audit/tasks`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(result.status, 405);
  console.log("BFF runtime checks passed: auth, bounds, role, redirect refusal, cookie, bypass isolation, GET only");
} finally {
  app.kill("SIGTERM");
  await Promise.all([new Promise(resolve => upstream.close(resolve)), new Promise(resolve => diverted.close(resolve))]);
}
