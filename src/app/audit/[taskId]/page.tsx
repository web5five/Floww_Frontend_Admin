"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuditHeader } from "@/components/audit-header";
import { AuditCode } from "@/components/audit-code";
import { useLanguage } from "@/components/language-provider";
import { errorText } from "@/lib/locale";
import { AccountRow, Detail, display, EventPage } from "@/lib/audit";
import { validId } from "@/lib/validation";

function Tx({ hash, chainId }: { hash: string | null; chainId: number }) {
  if (!hash) return <>—</>;
  return /^0x[0-9a-f]{64}$/i.test(hash) && chainId === 11155111
    ? <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="id-link mono">{hash} ↗</a>
    : <span className="mono">{hash}</span>;
}

export default function TaskDetail({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const { t, language, status: statusText, date } = useLanguage();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [account, setAccount] = useState<AccountRow | null>(null);
  const [events, setEvents] = useState<EventPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [moreBusy, setMoreBusy] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!validId(taskId)) { setErrorStatus(400); setLoading(false); return; }
    setLoading(true); setErrorStatus(null); setDetail(null); setAccount(null); setEvents(null);
    try {
      const base = `/api/audit/tasks/${taskId}`;
      const responses = await Promise.all([fetch(base, { cache: "no-store", signal }), fetch(`${base}/events?limit=50`, { cache: "no-store", signal }), fetch(`${base}/account`, { cache: "no-store", signal })]);
      const failed = responses.find(r => !r.ok);
      if (failed) { setErrorStatus(failed.status); setDetail(null); return; }
      const [task, history, accountRecord] = await Promise.all(responses.map(r => r.json()));
      setDetail(task); setEvents(history); setAccount(accountRecord);
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setErrorStatus(503); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [taskId]);

  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 0); return () => { window.clearTimeout(timer); controller.abort(); }; }, [load]);
  async function moreEvents() {
    if (!events || moreBusy) return;
    setMoreBusy(true);
    try {
      const response = await fetch(`/api/audit/tasks/${taskId}/events?after=${events.nextCursor}&limit=50`, { cache: "no-store" });
      if (!response.ok) { setErrorStatus(response.status); return; }
      const next: EventPage = await response.json();
      setEvents({ events: [...events.events, ...next.events], nextCursor: next.nextCursor, hasMore: next.hasMore });
    } catch { setErrorStatus(503); }
    finally { setMoreBusy(false); }
  }

  return <><AuditHeader/><main className="content"><Link href="/audit" className="back-link">← {t("allTasks")}</Link><div className="section-heading"><div><span className="eyebrow">{t("taskRecord")}</span><h1>{t("auditDetail")}</h1><p className="mono">{taskId}</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>{t("refresh")}</button></div>{loading ? <p className="notice" role="status">{t("loadingRecord")}</p> : errorStatus !== null && !detail ? <p className="alert" role="alert">{errorStatus === 400 ? t("invalidTaskId") : errorText(errorStatus, language)}{errorStatus === 401 && <> <Link href="/login">{t("signIn")}</Link></>}</p> : detail && <><section className="panel"><div className="panel-head"><h2>{detail.task.goal}</h2><span className="status-pill" title={detail.task.status}>{statusText(detail.task.status)}</span></div><dl className="facts"><div><dt>{t("reason")}</dt><dd><AuditCode value={detail.task.statusReasonCode}/></dd></div><div><dt>{t("item")}</dt><dd>{display(detail.task.itemId)}</dd></div><div><dt>{t("mandate")}</dt><dd className="mono">{display(detail.task.mandateId)}</dd></div><div><dt>{t("mandateVersionState")}</dt><dd>{display(detail.task.mandateVersion)} · {statusText(detail.task.mandateStatus)}</dd></div><div><dt>{t("mandateExpires")}</dt><dd>{date(detail.task.mandateExpiresAt)}</dd></div><div><dt>{t("maximum")}</dt><dd className="mono">{display(detail.task.maxAmountBaseUnits)}</dd></div><div><dt>{t("token")}</dt><dd className="mono">{display(detail.task.tokenAddress)}{detail.task.tokenDecimals !== null && ` · ${detail.task.tokenDecimals} ${t("decimals")}`}</dd></div><div><dt>{t("userId")}</dt><dd className="mono">{detail.task.ownerId}</dd></div><div><dt>{t("wallet")}</dt><dd className="mono">{display(detail.task.walletAddress)}</dd></div><div><dt>{t("created")}</dt><dd>{date(detail.task.createdAt)}</dd></div><div><dt>{t("updated")}</dt><dd>{date(detail.task.updatedAt)}</dd></div><div><dt>{t("completed")}</dt><dd>{date(detail.task.completedAt)}</dd></div></dl></section><section className="panel"><div className="panel-head"><h2>{t("attempts")}</h2><span className="count">{detail.attempts.length}</span></div>{detail.attempts.length === 0 ? <p className="muted">{t("noAttempts")}</p> : <><p className="table-hint">{t("scrollTable")}</p><div className="table-wrap" role="region" tabIndex={0} aria-label={t("attempts")}><table><thead><tr><th>{t("attemptId")}</th><th>{t("merchantQuote")}</th><th>{t("policy")}</th><th>{t("amount")}</th><th>{t("recipient")}</th><th>{t("created")}</th></tr></thead><tbody>{detail.attempts.map(attempt => <tr key={attempt.attemptId}><td className="mono">{attempt.attemptId}</td><td>{display(attempt.merchantId)}<small className="mono">{attempt.quoteId}</small></td><td><span className="status-pill"><AuditCode value={attempt.policyDecision}/></span><small>{statusText(attempt.status)} · <AuditCode value={attempt.reasonCode}/></small></td><td className="mono">{display(attempt.amountBaseUnits)}</td><td className="mono">{display(attempt.recipientAddress)}</td><td>{date(attempt.createdAt)}</td></tr>)}</tbody></table></div></>}</section><section className="panel"><div className="panel-head"><h2>{t("taskAccount")}</h2><span className="count">{account?.state ? statusText(account.state) : t("noAccountShort")}</span></div>{!account ? <p className="muted">{t("noAccount")}</p> : <dl className="facts"><div><dt>{t("attemptId")}</dt><dd className="mono">{account.attemptId}</dd></div><div><dt>{t("account")}</dt><dd className="mono">{display(account.accountAddress)}</dd></div><div><dt>{t("ownerAddress")}</dt><dd className="mono">{account.ownerAddress}</dd></div><div><dt>{t("recipient")}</dt><dd className="mono">{account.recipientAddress}</dd></div><div><dt>{t("amount")}</dt><dd className="mono">{account.amountBaseUnits}</dd></div><div><dt>{t("token")}</dt><dd className="mono">{account.tokenAddress}</dd></div><div><dt>{t("deploymentTx")}</dt><dd><Tx hash={account.deployTxHash} chainId={account.chainId}/></dd></div><div><dt>{t("approvalTx")}</dt><dd><Tx hash={account.approvalTxHash} chainId={account.chainId}/></dd></div><div><dt>{t("approvalOperation")}</dt><dd>{statusText(account.approvalOperationState)}</dd></div><div><dt>{t("paymentId")}</dt><dd className="mono">{display(account.paymentId)}</dd></div><div><dt>{t("paymentOperation")}</dt><dd>{statusText(account.paymentOperationState)}</dd></div><div><dt>{t("paymentTx")}</dt><dd><Tx hash={account.paymentTxHash} chainId={account.chainId}/></dd></div><div><dt>{t("paymentVerified")}</dt><dd>{date(account.paymentVerifiedAt)}</dd></div><div><dt>{t("fulfillmentId")}</dt><dd className="mono">{display(account.fulfillmentId)}</dd></div><div><dt>{t("fulfillmentHash")}</dt><dd className="mono">{display(account.fulfillmentEvidenceHash)}</dd></div><div><dt>{t("fulfillmentTx")}</dt><dd><Tx hash={account.fulfillmentTxHash} chainId={account.chainId}/></dd></div><div><dt>{t("fulfillmentVerified")}</dt><dd>{date(account.fulfillmentVerifiedAt)}</dd></div></dl>}</section><section className="panel"><div className="panel-head"><h2>{t("events")}</h2><span className="count">{events?.events.length ?? 0}</span></div>{events?.events.length ? <div className="event-list">{events.events.map(event => <div className="event" key={event.seq}><span className="event-index">{event.seq}</span><div><strong><AuditCode value={event.kind}/></strong><p>{statusText(event.state)} · <AuditCode value={event.reasonCode}/> · <AuditCode value={event.actor}/></p><small>{event.attemptId && <span className="mono">{event.attemptId} · </span>}{date(event.createdAt)}</small></div></div>)}</div> : <p className="muted">{t("noEvents")}</p>}{events?.hasMore && <button className="secondary" onClick={() => void moreEvents()} disabled={moreBusy}>{moreBusy ? t("loading") : t("loadMore")}</button>}</section>{errorStatus !== null && <p className="alert" role="alert">{errorText(errorStatus, language)}{errorStatus === 401 && <> <Link href="/login">{t("signIn")}</Link></>}</p>}</>}</main></>;
}
