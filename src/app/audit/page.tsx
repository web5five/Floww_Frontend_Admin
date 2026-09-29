"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuditHeader } from "@/components/audit-header";
import { date, display, errorText, TaskPage } from "@/lib/audit";

const statuses = ["", "DRAFT", "AWAITING_APPROVAL", "ACTIVE", "EXECUTING", "COMPLETED", "DECLINED", "FAILED", "EXPIRED", "CANCELLED"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AuditList() {
  const [data, setData] = useState<TaskPage | null>(null);
  const [status, setStatus] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) query.set("status", status);
      if (ownerId) query.set("ownerId", ownerId);
      const response = await fetch(`/api/audit/tasks?${query}`, { cache: "no-store", signal });
      if (!response.ok) { setData(null); setError(errorText(response.status)); return; }
      setData(await response.json());
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) { setData(null); setError(errorText(503)); } }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [status, ownerId, page]);

  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 0); return () => { window.clearTimeout(timer); controller.abort(); }; }, [load]);
  function filterOwner() {
    const trimmed = ownerInput.trim();
    if (trimmed && !uuid.test(trimmed)) { setInputError("Enter a valid user ID."); return; }
    setInputError(""); setOwnerId(trimmed); setPage(0);
  }

  return <><AuditHeader/><main className="content"><div className="section-heading"><div><span className="eyebrow">OPERATIONS / RECORDS</span><h1>Task audit</h1><p>Read the persisted task, decision, and account trail.</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>Refresh</button></div><div className="filters"><label>Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>{statuses.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}</select></label><label>User ID<input value={ownerInput} onChange={e => setOwnerInput(e.target.value)} placeholder="Filter by user ID" /></label><button className="secondary" onClick={filterOwner}>Apply</button></div>{inputError && <p className="alert" role="alert">{inputError}</p>}{loading ? <p className="notice" role="status">Loading task records…</p> : error ? <p className="alert" role="alert">{error}</p> : data && <><div className="result-line"><strong>{data.total}</strong> task{data.total === 1 ? "" : "s"} found</div>{data.tasks.length === 0 ? <div className="empty">No task records match these filters.</div> : <div className="table-wrap"><table><thead><tr><th>Task</th><th>Purpose</th><th>Status</th><th>User / wallet</th><th>Cap · base units</th><th>Updated</th></tr></thead><tbody>{data.tasks.map(task => <tr key={task.taskId}><td><Link className="id-link" href={`/audit/${task.taskId}`}>{task.taskId}</Link></td><td><strong>{task.goal}</strong><small>{display(task.itemId)}</small></td><td><span className="status-pill">{task.status}</span>{task.statusReasonCode && <small>{task.statusReasonCode}</small>}</td><td><span className="mono">{task.ownerId}</span><small className="mono">{display(task.walletAddress)}</small></td><td className="mono">{display(task.maxAmountBaseUnits)}</td><td>{date(task.updatedAt)}</td></tr>)}</tbody></table></div>}<div className="pagination"><button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1}</span><button className="secondary" disabled={(page + 1) * data.limit >= data.total} onClick={() => setPage(page + 1)}>Next</button></div></>}</main></>;
}
