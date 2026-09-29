"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuditHeader } from "@/components/audit-header";
import { AccountRow, date, Detail, display, errorText, EventPage } from "@/lib/audit";
import { validId } from "@/lib/validation";

function Tx({ hash, chainId }: { hash: string | null; chainId: number }) {
  if (!hash) return <>—</>;
  return /^0x[0-9a-f]{64}$/i.test(hash) && chainId === 11155111
    ? <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="id-link mono">{hash} ↗</a>
    : <span className="mono">{hash}</span>;
}

export default function TaskDetail({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [account, setAccount] = useState<AccountRow | null>(null);
  const [events, setEvents] = useState<EventPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moreBusy, setMoreBusy] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!validId(taskId)) { setError("Invalid task ID."); setLoading(false); return; }
    setLoading(true); setError(""); setDetail(null); setAccount(null); setEvents(null);
    try {
      const base = `/api/audit/tasks/${taskId}`;
      const responses = await Promise.all([fetch(base, { cache: "no-store", signal }), fetch(`${base}/events?limit=50`, { cache: "no-store", signal }), fetch(`${base}/account`, { cache: "no-store", signal })]);
      const failed = responses.find(r => !r.ok);
      if (failed) { setError(errorText(failed.status)); setDetail(null); return; }
      const [task, history, accountRecord] = await Promise.all(responses.map(r => r.json()));
      setDetail(task); setEvents(history); setAccount(accountRecord);
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(errorText(503)); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [taskId]);

  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 0); return () => { window.clearTimeout(timer); controller.abort(); }; }, [load]);
  async function moreEvents() {
    if (!events || moreBusy) return;
    setMoreBusy(true);
    try {
      const response = await fetch(`/api/audit/tasks/${taskId}/events?after=${events.nextCursor}&limit=50`, { cache: "no-store" });
      if (!response.ok) { setError(errorText(response.status)); return; }
      const next: EventPage = await response.json();
      setEvents({ events: [...events.events, ...next.events], nextCursor: next.nextCursor, hasMore: next.hasMore });
    } catch { setError(errorText(503)); }
    finally { setMoreBusy(false); }
  }

  return <><AuditHeader/><main className="content"><Link href="/audit" className="back-link">← All tasks</Link><div className="section-heading"><div><span className="eyebrow">TASK RECORD</span><h1>Audit detail</h1><p className="mono">{taskId}</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></div>{loading ? <p className="notice" role="status">Loading audit record…</p> : error && !detail ? <p className="alert" role="alert">{error}</p> : detail && <><section className="panel"><div className="panel-head"><h2>{detail.task.goal}</h2><span className="status-pill">{detail.task.status}</span></div><dl className="facts"><div><dt>Reason</dt><dd>{display(detail.task.statusReasonCode)}</dd></div><div><dt>Item</dt><dd>{display(detail.task.itemId)}</dd></div><div><dt>Mandate</dt><dd className="mono">{display(detail.task.mandateId)}</dd></div><div><dt>Mandate version / state</dt><dd>{display(detail.task.mandateVersion)} · {display(detail.task.mandateStatus)}</dd></div><div><dt>Mandate expires</dt><dd>{date(detail.task.mandateExpiresAt)}</dd></div><div><dt>Maximum · base units</dt><dd className="mono">{display(detail.task.maxAmountBaseUnits)}</dd></div><div><dt>Token</dt><dd className="mono">{display(detail.task.tokenAddress)}{detail.task.tokenDecimals !== null && ` · ${detail.task.tokenDecimals} decimals`}</dd></div><div><dt>User ID</dt><dd className="mono">{detail.task.ownerId}</dd></div><div><dt>Wallet</dt><dd className="mono">{display(detail.task.walletAddress)}</dd></div><div><dt>Created</dt><dd>{date(detail.task.createdAt)}</dd></div><div><dt>Updated</dt><dd>{date(detail.task.updatedAt)}</dd></div><div><dt>Completed</dt><dd>{date(detail.task.completedAt)}</dd></div></dl></section><section className="panel"><div className="panel-head"><h2>Attempts</h2><span className="count">{detail.attempts.length}</span></div>{detail.attempts.length === 0 ? <p className="muted">No attempts recorded.</p> : <div className="table-wrap"><table><thead><tr><th>Attempt ID</th><th>Merchant / quote</th><th>Policy</th><th>Amount · base units</th><th>Recipient</th><th>Created</th></tr></thead><tbody>{detail.attempts.map(attempt => <tr key={attempt.attemptId}><td className="mono">{attempt.attemptId}</td><td>{display(attempt.merchantId)}<small className="mono">{attempt.quoteId}</small></td><td><span className="status-pill">{attempt.policyDecision}</span><small>{attempt.status} · {display(attempt.reasonCode)}</small></td><td className="mono">{display(attempt.amountBaseUnits)}</td><td className="mono">{display(attempt.recipientAddress)}</td><td>{date(attempt.createdAt)}</td></tr>)}</tbody></table></div>}</section><section className="panel"><div className="panel-head"><h2>Task account</h2><span className="count">{account?.state ?? "No account"}</span></div>{!account ? <p className="muted">No task account recorded for this task.</p> : <dl className="facts"><div><dt>Attempt ID</dt><dd className="mono">{account.attemptId}</dd></div><div><dt>Account</dt><dd className="mono">{display(account.accountAddress)}</dd></div><div><dt>Owner address</dt><dd className="mono">{account.ownerAddress}</dd></div><div><dt>Recipient</dt><dd className="mono">{account.recipientAddress}</dd></div><div><dt>Amount · base units</dt><dd className="mono">{account.amountBaseUnits}</dd></div><div><dt>Token</dt><dd className="mono">{account.tokenAddress}</dd></div><div><dt>Deployment transaction</dt><dd><Tx hash={account.deployTxHash} chainId={account.chainId}/></dd></div><div><dt>Approval transaction</dt><dd><Tx hash={account.approvalTxHash} chainId={account.chainId}/></dd></div><div><dt>Approval operation</dt><dd>{display(account.approvalOperationState)}</dd></div><div><dt>Payment ID</dt><dd className="mono">{display(account.paymentId)}</dd></div><div><dt>Payment operation</dt><dd>{display(account.paymentOperationState)}</dd></div><div><dt>Payment transaction</dt><dd><Tx hash={account.paymentTxHash} chainId={account.chainId}/></dd></div><div><dt>Payment verified</dt><dd>{date(account.paymentVerifiedAt)}</dd></div><div><dt>Fulfillment ID</dt><dd className="mono">{display(account.fulfillmentId)}</dd></div><div><dt>Fulfillment evidence hash</dt><dd className="mono">{display(account.fulfillmentEvidenceHash)}</dd></div><div><dt>Fulfillment transaction</dt><dd><Tx hash={account.fulfillmentTxHash} chainId={account.chainId}/></dd></div><div><dt>Fulfillment verified</dt><dd>{date(account.fulfillmentVerifiedAt)}</dd></div></dl>}</section><section className="panel"><div className="panel-head"><h2>Events</h2><span className="count">{events?.events.length ?? 0}</span></div>{events?.events.length ? <div className="event-list">{events.events.map(event => <div className="event" key={event.seq}><span className="event-index">{event.seq}</span><div><strong>{event.kind}</strong><p>{display(event.state)} · {display(event.reasonCode)} · {event.actor}</p><small>{event.attemptId && <span className="mono">{event.attemptId} · </span>}{date(event.createdAt)}</small></div></div>)}</div> : <p className="muted">No events recorded.</p>}{events?.hasMore && <button className="secondary" onClick={() => void moreEvents()} disabled={moreBusy}>{moreBusy ? "Loading…" : "Load more events"}</button>}</section>{error && <p className="alert" role="alert">{error}</p>}</>}</main></>;
}
