import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { deriveEvidence, deriveSummary, formatBaseUnits, validCount } from "../src/lib/dashboard.ts";

const require = createRequire(import.meta.url);
if (!process.env.FLOWW_PLAYWRIGHT_MODULE) throw new Error("Set FLOWW_PLAYWRIGHT_MODULE to an existing Playwright package path");
const { chromium } = require(process.env.FLOWW_PLAYWRIGHT_MODULE);
const port = 3005;
const root = `http://127.0.0.1:${port}`;
const command = process.env.FLOWW_DASHBOARD_SERVER_MODE === "start" ? "start" : "dev";
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", command, "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, FLOWW_SERVER_URL: "" }, stdio: "ignore" });
const output = join(process.cwd(), "reports", "F040_visual");
const ids = {
  denied: "11111111-1111-4111-8111-111111111111",
  completed: "22222222-2222-4222-8222-222222222222",
  unknown: "33333333-3333-4333-8333-333333333333",
  executing: "44444444-4444-4444-8444-444444444444",
};
const ownerId = "55555555-5555-4555-8555-555555555555";
const stamp = "2026-09-30T01:00:00Z";
function task(taskId, goal, status, tokenDecimals = 6) {
  return { taskId, ownerId, walletAddress: null, goal, status, statusReasonCode: null, mandateId: null, mandateVersion: null, mandateStatus: null, mandateExpiresAt: null, itemId: null, maxAmountBaseUnits: null, tokenAddress: null, tokenDecimals, createdAt: stamp, updatedAt: stamp, completedAt: status === "COMPLETED" ? stamp : null };
}
const tasks = [task(ids.denied, "Office supply request", "AWAITING_APPROVAL"), task(ids.completed, "Monthly refill request", "COMPLETED"), task(ids.unknown, "Delivery status check", "ACTIVE", null), task(ids.executing, "Equipment order review", "EXECUTING")];
const deniedAttempt = { attemptId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", quoteId: "quote-denied", merchantId: "merchant-a", status: "BLOCKED", policyDecision: "DENY", reasonCode: "BUDGET_EXCEEDED", amountBaseUnits: "900719925474099312345678", recipientAddress: null, createdAt: stamp, finishedAt: stamp };
const completedAttempt = { attemptId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", quoteId: "quote-allowed", merchantId: "merchant-b", status: "ORDERED", policyDecision: "ALLOW", reasonCode: null, amountBaseUnits: "900719925474099312345678", recipientAddress: "0x2222222222222222222222222222222222222222", createdAt: stamp, finishedAt: stamp };
const unknownAttempt = { ...completedAttempt, attemptId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", status: "APPROVED", amountBaseUnits: "0" };
const accounts = {
  [ids.completed]: { taskId: ids.completed, attemptId: completedAttempt.attemptId, state: "COMPLETED", ownerAddress: "0x1111111111111111111111111111111111111111", accountAddress: "0x3333333333333333333333333333333333333333", deployTxHash: null, chainId: 11155111, tokenAddress: "0x4444444444444444444444444444444444444444", recipientAddress: completedAttempt.recipientAddress, amountBaseUnits: completedAttempt.amountBaseUnits, approvalTxHash: null, approvalOperationState: "VERIFIED", paymentId: "payment-1", paymentTxHash: `0x${"a".repeat(64)}`, paymentOperationState: "VERIFIED", paymentVerifiedAt: stamp, fulfillmentId: "fulfillment-1", fulfillmentEvidenceHash: "evidence-hash", fulfillmentTxHash: `0x${"b".repeat(64)}`, fulfillmentVerifiedAt: stamp, updatedAt: stamp },
  [ids.unknown]: { taskId: ids.unknown, attemptId: unknownAttempt.attemptId, state: "PAYMENT_UNKNOWN", ownerAddress: "0x1111111111111111111111111111111111111111", accountAddress: null, deployTxHash: null, chainId: 11155111, tokenAddress: "0x4444444444444444444444444444444444444444", recipientAddress: "0x2222222222222222222222222222222222222222", amountBaseUnits: "0", approvalTxHash: null, approvalOperationState: "UNKNOWN", paymentId: null, paymentTxHash: null, paymentOperationState: "UNKNOWN", paymentVerifiedAt: null, fulfillmentId: null, fulfillmentEvidenceHash: null, fulfillmentTxHash: null, fulfillmentVerifiedAt: null, updatedAt: stamp },
};
const attempts = { [ids.denied]: [deniedAttempt], [ids.completed]: [completedAttempt], [ids.unknown]: [unknownAttempt], [ids.executing]: [] };
const events = { [ids.denied]: [{ seq: 1, attemptId: deniedAttempt.attemptId, kind: "POLICY_DECIDED", state: "AWAITING_APPROVAL", reasonCode: "BUDGET_EXCEEDED", actor: "server", createdAt: stamp }], [ids.completed]: [{ seq: 1, attemptId: completedAttempt.attemptId, kind: "PAYMENT_VERIFIED", state: "EXECUTING", reasonCode: null, actor: "server", createdAt: stamp }], [ids.unknown]: [], [ids.executing]: [] };

const count = value => ({ value, error: null });
assert.equal(validCount(-1), null);
assert.equal(deriveSummary({ total: count(4), awaiting: count(1), active: count(1), executing: count(1), completed: count(1) }).other, 0);
assert.equal(deriveSummary({ total: count(4), awaiting: count(1), active: { value: null, error: 503 }, executing: count(1), completed: count(1) }).inProgress, null);
assert.equal(deriveSummary({ total: count(1), awaiting: count(1), active: count(1), executing: count(0), completed: count(0) }).distributionAvailable, false);
assert.equal(formatBaseUnits("900719925474099312345678", 6), "900719925474099312.345678");
assert.equal(formatBaseUnits("0", null), null);
assert.equal(deriveEvidence({ task: tasks[0], attempts: [deniedAttempt] }, null).policy.state, "blocked");
assert.equal(deriveEvidence({ task: tasks[0], attempts: [deniedAttempt] }, null).payment.state, "missing");
assert.equal(deriveEvidence({ task: tasks[1], attempts: [completedAttempt] }, accounts[ids.completed]).payment.state, "recorded");
assert.equal(deriveEvidence({ task: tasks[1], attempts: [completedAttempt] }, accounts[ids.completed]).fulfillment.state, "recorded");
assert.equal(deriveEvidence({ task: tasks[2], attempts: [unknownAttempt] }, accounts[ids.unknown]).payment.state, "unknown");
assert.equal(deriveEvidence({ task: tasks[1], attempts: [completedAttempt] }, undefined).payment.state, "unknown");

let browser;
async function ready() {
  for (let i = 0; i < 200; i++) {
    if (app.exitCode !== null) throw new Error("Admin server exited before ready");
    try { if ((await fetch(`${root}/login`)).ok) return; } catch { /* starting */ }
    await delay(100);
  }
  throw new Error("Admin server did not become ready");
}
async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
  assert.ok(sizes.page <= sizes.viewport, `${label} overflow: ${JSON.stringify(sizes)}`);
}
try {
  await ready();
  const unauthenticated = await fetch(`${root}/api/audit/tasks?page=0&limit=1`);
  assert.equal(unauthenticated.status, 401, "real local BFF must reject anonymous audit");
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: process.env.FLOWW_CHROME_EXECUTABLE ?? chromium.executablePath() });
  const context = await browser.newContext({ baseURL: root, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let mode = "normal";
  let requested = [];
  await page.route("**/api/audit/**", async route => {
    const url = new URL(route.request().url());
    requested.push(url.pathname + url.search);
    const json = data => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
    if (mode === "unauthorized" || mode === "forbidden") return route.fulfill({ status: mode === "unauthorized" ? 401 : 403, contentType: "application/json", body: '{}' });
    if (url.pathname === "/api/audit/tasks") {
      const status = url.searchParams.get("status");
      if (mode === "partial" && status === "ACTIVE") return route.fulfill({ status: 503, contentType: "application/json", body: '{}' });
      const rows = mode === "empty" ? [] : status ? tasks.filter(row => row.status === status) : tasks;
      return json({ tasks: rows.slice(0, Number(url.searchParams.get("limit") ?? 20)), total: rows.length, page: 0, limit: Number(url.searchParams.get("limit") ?? 20) });
    }
    const match = url.pathname.match(/^\/api\/audit\/tasks\/([^/]+)(?:\/(events|account))?$/);
    if (!match) return route.fulfill({ status: 404, body: '{}' });
    if (mode === "selection_401" || mode === "selection_403") return route.fulfill({ status: mode === "selection_401" ? 401 : 403, contentType: "application/json", body: '{}' });
    const [, id, leaf] = match;
    if (mode === "race" && id === ids.denied && !leaf) await delay(400);
    if (leaf === "events") {
      if (mode === "events_page_401" && url.searchParams.has("after")) return route.fulfill({ status: 401, contentType: "application/json", body: '{}' });
      return json({ events: events[id] ?? [], nextCursor: 1, hasMore: mode === "events_page_401" });
    }
    if (leaf === "account") return mode === "account_error" ? route.fulfill({ status: 503, contentType: "application/json", body: '{}' }) : json(accounts[id] ?? null);
    const row = tasks.find(item => item.taskId === id);
    return json({ task: row, attempts: attempts[id] ?? [] });
  });

  await page.goto("/login");
  await page.getByLabel("Language settings").selectOption("ko");
  const serverHtml = await (await context.request.get("/dashboard")).text();
  assert.match(serverHtml, /<html[^>]+lang="ko"/);
  assert.match(serverHtml, /Floww \| 관리자 감사/);
  await page.goto("/dashboard");
  await page.getByRole("heading", { name: "운영 개요" }).waitFor();
  await page.getByText("Office supply request").first().waitFor();
  await page.getByText("예산 초과").first().waitFor();
  assert.equal(await page.locator(".dashboard-metric strong").first().textContent(), "4");
  assert.match((await page.locator(".dashboard-step--blocked").textContent()) ?? "", /정책/);
  assert.equal(await page.locator(".dashboard-step--recorded").count(), 1, "DENY must not complete later steps");
  await noOverflow(page, "dashboard 1440");
  await page.screenshot({ path: join(output, "dashboard_ko_1440_denied.png"), fullPage: true });

  await page.getByRole("button", { name: /Monthly refill request/ }).click();
  await page.getByRole("heading", { name: "Monthly refill request" }).waitFor();
  await page.getByText("900719925474099312.345678").waitFor();
  assert.equal(await page.locator(".dashboard-step--recorded").count(), 5, "payment and fulfillment require distinct verified evidence");
  await page.screenshot({ path: join(output, "dashboard_ko_1440_verified.png"), fullPage: true });
  await page.getByRole("button", { name: /Delivery status check/ }).click();
  await page.getByRole("heading", { name: "Delivery status check" }).waitFor();
  await page.getByText("결제 미확인").first().waitFor();
  assert.equal(await page.locator(".dashboard-step--recorded").count(), 3, "UNKNOWN payment and fulfillment stay unrecorded");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /Office supply request/ }).click();
  await page.getByRole("heading", { name: "Office supply request" }).waitFor();
  await noOverflow(page, "dashboard 390");
  await page.screenshot({ path: join(output, "dashboard_ko_390.png"), fullPage: true });
  assert.ok(requested.filter(path => path.startsWith("/api/audit/tasks?")).every(path => ["1", "5"].includes(new URLSearchParams(path.split("?")[1]).get("limit"))), "dashboard list requests must be bounded");
  assert.ok(requested.some(path => path.includes("status=AWAITING_APPROVAL")), "global count must use status-filtered total");
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("link", { name: /감사 기록/ }).first().click();
  assert.equal(new URL(page.url()).hash, "#activity", "audit trail navigation must reach activity");
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("link", { name: "작업", exact: true }).click();
  await page.getByRole("heading", { name: "작업 감사" }).waitFor();
  await page.getByRole("link", { name: /Floww/ }).first().click();
  await page.getByRole("heading", { name: "운영 개요" }).waitFor();
  await page.setViewportSize({ width: 320, height: 700 });
  await noOverflow(page, "dashboard 320");
  await page.screenshot({ path: join(output, "dashboard_ko_320.png"), fullPage: true });
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("dialog", { name: "언어 설정" }).getByLabel("언어 설정").selectOption("en");
  await page.getByRole("heading", { name: "Operations overview" }).waitFor();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0, "Escape must close settings");
  await page.reload();
  await page.getByRole("heading", { name: "Operations overview" }).waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  await page.getByLabel("Language settings").selectOption("ko");
  await page.reload();
  await page.getByRole("heading", { name: "운영 개요" }).waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "ko");

  mode = "partial";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByText("일부 상태 수를 확인할 수 없습니다.", { exact: false }).waitFor();
  assert.equal((await page.locator(".dashboard-metric strong").nth(2).textContent())?.trim(), "—");
  await page.getByText("일부 수를 확인할 수 없거나 조회 중 데이터가 변해 분포를 표시할 수 없습니다.").waitFor();
  mode = "account_error";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByRole("button", { name: /Monthly refill request/ }).click();
  await page.getByRole("heading", { name: "Monthly refill request" }).waitFor();
  await page.getByText("계정 증거를 불러올 수 없습니다.").waitFor();
  assert.equal(await page.locator(".dashboard-step--unknown").count() >= 2, true, "account error cannot complete payment or fulfillment");
  mode = "selection_401";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByRole("alert").getByRole("link", { name: "로그인" }).waitFor();
  assert.equal(await page.getByRole("heading", { name: "Monthly refill request" }).count(), 0, "expired selection cannot leave stale evidence visible");
  mode = "selection_403";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByRole("alert").getByText("이 계정은 관리자 감사 기록에 접근할 수 없습니다.").waitFor();
  mode = "empty";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByText("기록된 작업이 없습니다.").first().waitFor();
  assert.equal((await page.locator(".dashboard-metric strong").first().textContent())?.trim(), "0");
  mode = "unauthorized";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByRole("alert").getByText("관리자 세션이 필요합니다. 다시 로그인하세요.").waitFor();
  mode = "forbidden";
  await page.getByRole("button", { name: "새로고침" }).click();
  await page.getByRole("alert").getByText("이 계정은 관리자 감사 기록에 접근할 수 없습니다.").waitFor();
  mode = "unauthorized";
  await page.goto("/audit");
  await page.getByRole("alert").getByRole("link", { name: "로그인" }).waitFor();
  await page.goto(`/audit/${ids.denied}`);
  await page.getByRole("alert").getByRole("link", { name: "로그인" }).waitFor();
  mode = "events_page_401";
  await page.reload();
  await page.getByRole("button", { name: "이벤트 더 보기" }).click();
  await page.getByRole("alert").getByRole("link", { name: "로그인" }).waitFor();
  mode = "race";
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Monthly refill request/ }).click();
  await page.getByRole("heading", { name: "Monthly refill request" }).waitFor();
  await delay(500);
  assert.equal(await page.getByRole("heading", { name: "Monthly refill request" }).count(), 1, "older task response must not replace selected task");

  await page.goto(`/audit/${ids.denied}`);
  await page.getByText("예산 초과").first().waitFor();
  await page.getByText("정책 판정").first().waitFor();
  await noOverflow(page, "populated audit 320");
  console.log("Dashboard checks passed: real anonymous 401, bounded counts, partial/empty/403 states, DENY/UNKNOWN/verified steps, BigInt, race, locale SSR/reload, navigation, 1440/390/320 layouts");
  await context.close();
} finally {
  await browser?.close();
  app.kill("SIGTERM");
  await new Promise(resolve => { if (app.exitCode !== null) resolve(); else app.once("exit", resolve); });
}
