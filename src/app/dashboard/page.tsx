"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { AuditCode } from "@/components/audit-code";
import { LanguageControl, useLanguage } from "@/components/language-provider";
import type { AccountRow, Detail, EventPage, TaskPage } from "@/lib/audit";
import { display } from "@/lib/audit";
import { Counts, deriveEvidence, deriveSummary, EvidenceState, formatBaseUnits, validCount } from "@/lib/dashboard";
import { dashboardText, DashboardKey } from "@/lib/dashboard-locale";
import { codeLabel } from "@/lib/locale";
import "./dashboard.css";

type Result<T> = { data: T | null; error: number | null };
type Overview = { counts: Counts; recent: Result<TaskPage>; checkedAt: string };
type Selection = { taskId: string; detail: Result<Detail>; events: Result<EventPage>; account: Result<AccountRow> };
type SummaryKey = "total" | "awaiting" | "inProgress" | "completed";

async function read<T>(path: string, signal: AbortSignal): Promise<Result<T>> {
  try {
    const response = await fetch(path, { cache: "no-store", signal });
    if (!response.ok) return { data: null, error: response.status };
    return { data: await response.json() as T, error: null };
  } catch { return { data: null, error: 503 }; }
}

async function readCount(status: string | null, signal: AbortSignal) {
  const query = new URLSearchParams({ page: "0", limit: "1" });
  if (status) query.set("status", status);
  const result = await read<TaskPage>(`/api/audit/tasks?${query}`, signal);
  const count = result.error === null ? validCount(result.data?.total) : null;
  return { value: count, error: result.error ?? (count === null ? 503 : null) };
}

function accessStatus(overview: Overview): number | null {
  const errors = [...Object.values(overview.counts).map(value => value.error), overview.recent.error];
  return errors.includes(401) ? 401 : errors.includes(403) ? 403 : null;
}

export default function Dashboard() {
  const router = useRouter();
  const { language, t, status: statusText, date } = useLanguage();
  const d = (key: DashboardKey) => dashboardText(language, key);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [selectionRevision, setSelectionRevision] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const overviewController = useRef<AbortController | null>(null);
  const overviewGeneration = useRef(0);
  const selectionGeneration = useRef(0);
  const settingsTrigger = useRef<HTMLButtonElement | null>(null);
  const settingsDialog = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const dialog = settingsDialog.current;
    const trigger = settingsTrigger.current;
    const select = dialog?.querySelector("select");
    select?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { setSettingsOpen(false); return; }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>("button, select"));
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [settingsOpen]);

  const loadOverview = useCallback(async () => {
    overviewController.current?.abort();
    const controller = new AbortController();
    overviewController.current = controller;
    const generation = ++overviewGeneration.current;
    setOverviewLoading(true);
    setOverview(null);
    const [total, awaiting, active, executing, completed, recent] = await Promise.all([
      readCount(null, controller.signal), readCount("AWAITING_APPROVAL", controller.signal),
      readCount("ACTIVE", controller.signal), readCount("EXECUTING", controller.signal),
      readCount("COMPLETED", controller.signal), read<TaskPage>("/api/audit/tasks?page=0&limit=5", controller.signal),
    ]);
    if (controller.signal.aborted || generation !== overviewGeneration.current) return;
    const safeRecent = recent.error === null && (!recent.data || !Array.isArray(recent.data.tasks) || validCount(recent.data.total) === null)
      ? { data: null, error: 503 } : recent;
    const nextOverview = { counts: { total, awaiting, active, executing, completed }, recent: safeRecent, checkedAt: new Date().toISOString() };
    setOverview(nextOverview);
    setOverviewLoading(false);
    if (accessStatus(nextOverview) !== null) setSelectedId(null);
    else if (safeRecent.data) {
      const rows = safeRecent.data.tasks;
      setSelectedId(current => rows.length ? current ?? rows[0].taskId : null);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOverview(), 0);
    return () => { window.clearTimeout(timer); overviewController.current?.abort(); };
  }, [loadOverview]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    const generation = ++selectionGeneration.current;
    const timer = window.setTimeout(async () => {
      setSelectionLoading(true);
      setSelection(null);
      const base = `/api/audit/tasks/${encodeURIComponent(selectedId)}`;
      const [detail, events, account] = await Promise.all([
        read<Detail>(base, controller.signal),
        read<EventPage>(`${base}/events?limit=50`, controller.signal),
        read<AccountRow>(`${base}/account`, controller.signal),
      ]);
      if (controller.signal.aborted || generation !== selectionGeneration.current) return;
      setSelection({ taskId: selectedId, detail, events, account });
      setSelectionLoading(false);
    }, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [selectedId, selectionRevision]);

  function chooseTask(taskId: string) {
    if (taskId === selectedId) setSelectionRevision(value => value + 1);
    else setSelectedId(taskId);
  }
  function refresh() { void loadOverview(); setSelectionRevision(value => value + 1); }
  async function signOut() { await fetch("/api/session", { method: "DELETE", cache: "no-store" }); router.replace("/login"); }

  const summary = overview ? deriveSummary(overview.counts) : null;
  const access = overview ? accessStatus(overview) : null;
  const selected = selection?.taskId === selectedId ? selection : null;
  const detail = selected?.detail.error === null ? selected.detail.data : null;
  const account = selected?.account.error === null ? selected.account.data : undefined;
  const evidence = detail ? deriveEvidence(detail, account) : null;
  const metricCards: { key: SummaryKey; label: DashboardKey; icon: string; tone: string }[] = [
    { key: "total", label: "totalTasks", icon: "▤", tone: "neutral" },
    { key: "awaiting", label: "awaiting", icon: "◷", tone: "yellow" },
    { key: "inProgress", label: "inProgress", icon: "◌", tone: "blue" },
    { key: "completed", label: "completed", icon: "✓", tone: "green" },
  ];
  const chart: { key: keyof Pick<NonNullable<typeof summary>, "awaiting" | "inProgress" | "completed" | "other">; label: DashboardKey; tone: string }[] = [
    { key: "awaiting", label: "awaiting", tone: "yellow" }, { key: "inProgress", label: "inProgress", tone: "lightblue" },
    { key: "completed", label: "completed", tone: "blue" }, { key: "other", label: "other", tone: "gray" },
  ];

  function step(label: DashboardKey, value: { state: EvidenceState; at: string | null }) {
    const stateLabel = value.state === "recorded" ? d("recorded") : value.state === "blocked" ? d("blocked") : value.state === "missing" ? d("missing") : d("unknown");
    return <li key={label} className={`dashboard-step dashboard-step--${value.state}`}><span className="dashboard-step-icon" aria-hidden="true">{value.state === "recorded" ? "✓" : value.state === "blocked" ? "!" : "○"}</span><div><strong>{d(label)}</strong><span>{stateLabel}</span></div><time>{value.at ? date(value.at) : "—"}</time></li>;
  }

  const selectedAmount = detail && (account?.amountBaseUnits ?? evidence?.chosenAttempt?.amountBaseUnits ?? null);
  const formattedAmount = detail ? formatBaseUnits(selectedAmount, detail.task.tokenDecimals) : null;
  const amountSource = account?.amountBaseUnits ? d("accountAmount") : d("attemptAmount");

  return <div className="dashboard-shell">
    <aside className={`dashboard-sidebar${menuOpen ? " is-open" : ""}`} id="dashboard-navigation">
      <Link className="dashboard-brand" href="/dashboard" onClick={() => setMenuOpen(false)}><BrandMark size={29} decorative/><span>Floww</span></Link>
      <nav aria-label={t("navigation")}>
        <Link className="is-active" href="/dashboard" onClick={() => setMenuOpen(false)}><span aria-hidden="true">▦</span>{d("overview")}</Link>
        <Link href="/audit" onClick={() => setMenuOpen(false)}><span aria-hidden="true">▤</span>{d("tasks")}</Link>
        <a href="#activity" onClick={() => setMenuOpen(false)}><span aria-hidden="true">☷</span>{d("auditTrail")}</a>
        <button type="button" ref={settingsTrigger} onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}><span aria-hidden="true">⚙</span>{d("settings")}</button>
      </nav>
    </aside>
    {menuOpen && <button type="button" className="dashboard-scrim" aria-label={d("closeMenu")} onClick={() => setMenuOpen(false)}/>}
    <div className="dashboard-main">
      <header className="dashboard-topbar"><button type="button" className="dashboard-menu-button" aria-label={menuOpen ? d("closeMenu") : d("menu")} aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(value => !value)}>☰</button><Link className="dashboard-mobile-brand" href="/dashboard"><BrandMark size={24} decorative/>Floww</Link><div className="dashboard-top-actions"><LanguageControl/><button type="button" className="dashboard-signout" onClick={() => void signOut()}>{d("signOut")}</button></div></header>
      <main className="dashboard-content">
        <div className="dashboard-title-row"><div><h1>{d("title")}</h1><p>{d("intro")}</p></div><div className="dashboard-refresh"><span>{d("checkedAt")}: {overview?.checkedAt ? date(overview.checkedAt) : "—"}</span><button type="button" onClick={refresh} aria-label={d("refresh")} disabled={overviewLoading}>↻ <span>{d("refresh")}</span></button></div></div>
        {access !== null ? <section className="dashboard-access" role="alert"><p>{access === 401 ? d("signInAgain") : d("forbidden")}</p>{access === 401 && <Link href="/login">{t("signIn")}</Link>}</section> : <>
          <section className="dashboard-metrics" aria-label={d("allRecorded")}><h2>{d("allRecorded")}</h2><div className="dashboard-metric-grid">{metricCards.map(card => <div className="dashboard-metric" key={card.key}><span className={`dashboard-metric-icon tone-${card.tone}`} aria-hidden="true">{card.icon}</span><div><span>{d(card.label)}</span><strong>{overviewLoading ? "…" : summary?.[card.key] ?? "—"}</strong></div></div>)}</div></section>
          {overview && Object.values(overview.counts).some(value => value.error !== null) && <p className="dashboard-warning" role="status">{d("partialCounts")}</p>}
          <div className="dashboard-columns"><div className="dashboard-left">
            <section className="dashboard-panel" aria-labelledby="dashboard-status-title"><h2 id="dashboard-status-title">{d("taskStatus")}</h2>{overviewLoading ? <p className="dashboard-muted">{d("loading")}</p> : summary?.distributionAvailable ? summary.total === 0 ? <p className="dashboard-muted">{d("noDistribution")}</p> : <><div className="dashboard-bar" role="img" aria-label={`${d("distribution")}: ${chart.map(item => `${d(item.label)} ${summary[item.key]}`).join(", ")}`}>{chart.map(item => <span key={item.key} className={`tone-${item.tone}`} style={{ width: `${((summary[item.key] ?? 0) / summary.total!) * 100}%` }}/>)}</div><ul className="dashboard-legend">{chart.map(item => <li key={item.key}><i className={`tone-${item.tone}`}/><span>{d(item.label)}</span><strong>{summary[item.key]}</strong></li>)}</ul></> : <p className="dashboard-muted">{d("distributionUnavailable")}</p>}<p className="dashboard-footnote">{d("snapshotNote")}</p></section>
            <section className="dashboard-panel" aria-labelledby="dashboard-recent-title"><div className="dashboard-panel-heading"><h2 id="dashboard-recent-title">{d("recentTasks")}</h2><span>{d("pageScope")}</span></div>{overviewLoading ? <p className="dashboard-muted">{d("loading")}</p> : overview?.recent.error !== null ? <p className="dashboard-muted">{d("tasksUnavailable")}</p> : !overview?.recent.data?.tasks.length ? <p className="dashboard-muted">{d("noTasks")}</p> : <div className="dashboard-recent-list"><div className="dashboard-recent-head"><span>{d("purpose")}</span><span>{d("state")}</span><span>{d("updated")}</span><span>{d("viewTask")}</span></div>{overview.recent.data.tasks.map(task => <div className={`dashboard-recent-row${selectedId === task.taskId ? " is-selected" : ""}`} key={task.taskId}><button type="button" onClick={() => chooseTask(task.taskId)} aria-pressed={selectedId === task.taskId}><strong>{task.goal}</strong><small>{task.taskId}</small></button><span className="dashboard-status-pill">{statusText(task.status)}</span><time>{date(task.updatedAt)}</time><Link href={`/audit/${task.taskId}`} aria-label={`${d("viewTask")}: ${task.taskId}`}>↗</Link></div>)}</div>}<Link className="dashboard-more-link" href="/audit">{d("tasks")} ↗</Link></section>
            <div className="dashboard-bottom"><section className="dashboard-panel" aria-labelledby="dashboard-policy-title"><h2 id="dashboard-policy-title">{d("policyChecks")}</h2>{!selectedId ? <p className="dashboard-muted">{d("selectTask")}</p> : selectionLoading || !selected ? <p className="dashboard-muted">{d("loading")}</p> : !detail ? <p className="dashboard-muted">{d("detailUnavailable")}</p> : detail.attempts.length === 0 ? <p className="dashboard-muted">{d("noAttempts")}</p> : <ul className="dashboard-policy-list">{detail.attempts.map(attempt => <li key={attempt.attemptId}><div><strong>{codeLabel(attempt.policyDecision, language)}</strong><span>{display(attempt.merchantId)} · <AuditCode value={attempt.reasonCode}/></span><small>{d("attempt")}: {attempt.attemptId}</small><small>{d("amount")}: {attempt.amountBaseUnits === null ? d("notRecorded") : `${attempt.amountBaseUnits} ${d("baseUnits")}`}</small></div><span className={`dashboard-policy-decision ${attempt.policyDecision === "DENY" ? "is-deny" : attempt.policyDecision === "ALLOW" ? "is-allow" : ""}`} title={attempt.policyDecision}>{codeLabel(attempt.policyDecision, language)}</span></li>)}</ul>}</section>
              <section className="dashboard-panel" id="activity" aria-labelledby="dashboard-activity-title"><div className="dashboard-panel-heading"><h2 id="dashboard-activity-title">{d("activity")}</h2><span>{d("firstEvents")}</span></div>{!selectedId ? <p className="dashboard-muted">{d("selectTask")}</p> : selectionLoading || !selected ? <p className="dashboard-muted">{d("loading")}</p> : selected.events.error !== null || !selected.events.data ? <p className="dashboard-muted">{d("eventsUnavailable")}</p> : selected.events.data.events.length === 0 ? <p className="dashboard-muted">{d("noEvents")}</p> : <ul className="dashboard-activity-list">{selected.events.data.events.slice(0, 5).map(event => <li key={event.seq}><time>{date(event.createdAt)}</time><div><strong><AuditCode value={event.kind}/></strong><span>{d("actor")}: <AuditCode value={event.actor}/> · {d("state")}: {statusText(event.state)} · {d("reason")}: <AuditCode value={event.reasonCode}/></span></div></li>)}</ul>}</section></div>
          </div><aside className="dashboard-panel dashboard-selected" aria-labelledby="dashboard-selected-title"><div className="dashboard-panel-heading"><h2 id="dashboard-selected-title">{d("selectedTask")}</h2>{selectedId && <Link href={`/audit/${selectedId}`}>{d("viewAll")} ↗</Link>}</div>{!selectedId ? <p className="dashboard-muted">{d("selectTask")}</p> : selectionLoading || !selected ? <p className="dashboard-muted">{d("loading")}</p> : !detail ? <p className="dashboard-muted">{d("detailUnavailable")}</p> : <><div className="dashboard-task-heading"><h3>{detail.task.goal}</h3><span className="dashboard-status-pill">{statusText(detail.task.status)}</span></div><dl className="dashboard-task-facts"><div><dt>{d("taskId")}</dt><dd className="mono">{detail.task.taskId}</dd></div><div><dt>{d("ownerId")}</dt><dd className="mono">{detail.task.ownerId}</dd></div><div><dt>{amountSource}</dt><dd>{selectedAmount ? <><strong>{formattedAmount ?? selectedAmount}</strong> {formattedAmount ? d("tokenUnits") : d("baseUnits")}<small className="mono">{selectedAmount} {d("baseUnits")}</small></> : d("notRecorded")}</dd></div><div><dt>{d("accountState")}</dt><dd>{selected.account.error !== null ? d("unavailable") : account ? statusText(account.state) : d("notRecorded")}</dd></div></dl>{selected.account.error !== null && <p className="dashboard-warning">{d("accountUnavailable")}</p>}<h4>{d("evidence")}</h4><ol className="dashboard-timeline">{evidence && (["request", "policy", "approval", "payment", "fulfillment"] as const).map(key => step(key, evidence[key]))}</ol><p className="dashboard-footnote">{d("snapshotNote")}</p></>}</aside></div>
        </>}
      </main>
    </div>
    {settingsOpen && <div className="dashboard-settings-backdrop" onClick={() => setSettingsOpen(false)}><section className="dashboard-settings" ref={settingsDialog} role="dialog" aria-modal="true" aria-labelledby="dashboard-settings-title" onClick={event => event.stopPropagation()}><button type="button" className="dashboard-settings-close" onClick={() => setSettingsOpen(false)} aria-label={d("close")}>×</button><h2 id="dashboard-settings-title">{d("settingsTitle")}</h2><p>{d("settingsIntro")}</p><LanguageControl/></section></div>}
  </div>;
}
