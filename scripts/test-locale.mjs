import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
if (!process.env.FLOWW_PLAYWRIGHT_MODULE) throw new Error("Set FLOWW_PLAYWRIGHT_MODULE to an existing Playwright package path");
const { chromium } = require(process.env.FLOWW_PLAYWRIGHT_MODULE);
const port = 3005;
const root = `http://127.0.0.1:${port}`;
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...process.env, FLOWW_SERVER_URL: "" }, stdio: "ignore" });
const output = join(process.cwd(), "reports", "F038_visual");
const taskId = "11111111-1111-4111-8111-111111111111";
const ownerId = "22222222-2222-4222-8222-222222222222";
const task = { taskId, ownerId, walletAddress: "0x1111111111111111111111111111111111111111", goal: "Check purchase status", status: "ACTIVE", statusReasonCode: null, mandateId: null, mandateVersion: null, mandateStatus: null, mandateExpiresAt: null, itemId: "item-1", maxAmountBaseUnits: "1000000", tokenAddress: null, tokenDecimals: null, createdAt: "2026-09-30T00:00:00Z", updatedAt: "2026-09-30T01:00:00Z", completedAt: null };
let browser;

async function ready() {
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error("Admin server exited before ready");
    try { if ((await fetch(`${root}/login`)).ok) return; } catch { /* starting */ }
    await delay(100);
  }
  throw new Error("Admin server did not become ready");
}
async function noOverflow(page, label) {
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(widths.document <= widths.viewport, `${label} overflow: ${JSON.stringify(widths)}`);
}

try {
  await ready();
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: process.env.FLOWW_CHROME_EXECUTABLE ?? chromium.executablePath() });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${root}/login`);
  await page.getByRole("heading", { name: "Admin sign in" }).waitFor();
  await page.getByLabel("Language settings").selectOption("ko");
  await page.getByRole("heading", { name: "관리자 로그인" }).waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "ko");
  assert.equal(await page.title(), "Floww | 관리자 감사");
  assert.equal(await page.locator('meta[name="description"]').getAttribute("content"), "승인된 운영자를 위한 작업 및 계정 감사 기록");
  await page.reload();
  await page.getByRole("heading", { name: "관리자 로그인" }).waitFor();
  await noOverflow(page, "login 1440");
  await page.screenshot({ path: join(output, "login_ko_1440.png"), fullPage: true });

  await page.getByLabel("이메일").fill("admin@example.test");
  await page.getByLabel("비밀번호").fill("not-a-real-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await page.getByRole("alert").getByText("로그인할 수 없습니다. 다시 시도해 주세요.").waitFor();
  assert.equal((await context.cookies()).filter(cookie => cookie.name === "floww_admin_session").length, 0);
  await page.getByLabel("언어 설정").selectOption("en");
  await page.getByRole("alert").getByText("Sign-in is unavailable. Try again.").waitFor();
  assert.equal(await page.title(), "Floww | Admin audit");

  await page.goto(`${root}/audit`);
  await page.getByRole("alert").getByText("Your admin session has expired. Sign in again.").waitFor();
  await page.getByLabel("Language settings").selectOption("ko");
  await page.getByRole("alert").getByText("관리자 세션이 만료되었습니다. 다시 로그인하세요.").waitFor();

  let lastQuery = "";
  await page.route("**/api/audit/tasks?*", async route => {
    lastQuery = new URL(route.request().url()).searchParams.get("status") ?? "";
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ tasks: [task], total: 1, page: 0, limit: 20 }) });
  });
  await page.route(`**/api/audit/tasks/${taskId}`, route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ task, attempts: [] }) }));
  await page.route(`**/api/audit/tasks/${taskId}/events?*`, route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ events: [], nextCursor: 0, hasMore: false }) }));
  await page.route(`**/api/audit/tasks/${taskId}/account`, route => route.fulfill({ status: 200, contentType: "application/json", body: "null" }));
  await page.reload();
  await page.getByRole("heading", { name: "작업 감사" }).waitFor();
  await page.getByText("Check purchase status").waitFor();
  await page.getByLabel("상태").selectOption("ACTIVE");
  await page.getByText("Check purchase status").waitFor();
  assert.equal(lastQuery, "ACTIVE", "filter must send canonical API status");
  await noOverflow(page, "list 1440");
  await page.screenshot({ path: join(output, "list_ko_1440.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page, "list 390");
  assert.equal(await page.locator("header.topbar").count(), 1, "list must render one header");
  assert.ok(await page.locator(".table-wrap").evaluate(element => element.scrollWidth > element.clientWidth), "mobile table must scroll sideways");
  await page.screenshot({ path: join(output, "list_ko_390.png"), clip: { x: 0, y: 0, width: 390, height: 750 } });
  await page.getByRole("link", { name: taskId }).click();
  await page.getByRole("heading", { name: "감사 상세" }).waitFor();
  await page.getByText("기록된 시도가 없습니다.").waitFor();
  await noOverflow(page, "detail 390");
  await page.screenshot({ path: join(output, "detail_ko_390.png"), fullPage: true });
  await page.setViewportSize({ width: 320, height: 700 });
  await noOverflow(page, "detail 320");
  await page.getByRole("link", { name: /전체 작업/ }).click();
  await page.getByText("Check purchase status").waitFor();
  await noOverflow(page, "list 320");
  await page.getByRole("button", { name: "로그아웃" }).click();
  await page.getByRole("heading", { name: "관리자 로그인" }).waitFor();
  assert.equal(await page.getByLabel("언어 설정").inputValue(), "ko");
  await noOverflow(page, "login 320");
  console.log("Locale browser checks passed: language persistence, translated errors, anonymous session, canonical filter, navigation, 1440/390/320 no overflow");
  await context.close();
} finally {
  await browser?.close();
  app.kill("SIGTERM");
  await new Promise(resolve => { if (app.exitCode !== null) resolve(); else app.once("exit", resolve); });
}
