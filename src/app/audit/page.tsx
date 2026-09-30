"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AuditHeader } from "@/components/audit-header";
import { useLanguage } from "@/components/language-provider";
import { display, TaskPage } from "@/lib/audit";
import { errorText } from "@/lib/locale";

const statuses = ["", "DRAFT", "AWAITING_APPROVAL", "ACTIVE", "EXECUTING", "COMPLETED", "DECLINED", "FAILED", "EXPIRED", "CANCELLED"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AuditList() {
  const { language, t, status: statusText, date } = useLanguage();
  const [data, setData] = useState<TaskPage | null>(null);
  const [status, setStatus] = useState("");
  const [ownerInput, setOwnerInput] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [inputError, setInputError] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setErrorStatus(null);
    try {
      const query = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) query.set("status", status);
      if (ownerId) query.set("ownerId", ownerId);
      const response = await fetch(`/api/audit/tasks?${query}`, { cache: "no-store", signal });
      if (!response.ok) { setData(null); setErrorStatus(response.status); return; }
      setData(await response.json());
    } catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) { setData(null); setErrorStatus(503); } }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [status, ownerId, page]);

  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 0); return () => { window.clearTimeout(timer); controller.abort(); }; }, [load]);
  function filterOwner() {
    const trimmed = ownerInput.trim();
    if (trimmed && !uuid.test(trimmed)) { setInputError(true); return; }
    setInputError(false); setOwnerId(trimmed); setPage(0);
  }

  return <><AuditHeader/><main className="content">
    <div className="section-heading"><div><span className="eyebrow">{t("operationsRecords")}</span><h1>{t("taskAudit")}</h1><p>{t("auditIntro")}</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>{t("refresh")}</button></div>
    <div className="filters"><label>{t("status")}<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>{statuses.map(s => <option key={s} value={s}>{s ? statusText(s) : t("allStatuses")}</option>)}</select></label><label>{t("userId")}<input value={ownerInput} onChange={e => setOwnerInput(e.target.value)} placeholder={t("filterUser")} /></label><button className="secondary" onClick={filterOwner}>{t("apply")}</button></div>
    {inputError && <p className="alert" role="alert">{t("invalidUserId")}</p>}
    {loading ? <p className="notice" role="status">{t("loadingTasks")}</p> : errorStatus !== null ? <p className="alert" role="alert">{errorText(errorStatus, language)}</p> : data && <>
      <div className="result-line"><strong>{data.total}</strong> {t("tasksFound")}</div>
      {data.tasks.length === 0 ? <div className="empty">{t("noTasks")}</div> : <><p className="table-hint">{t("scrollTable")}</p><div className="table-wrap" role="region" tabIndex={0} aria-label={t("taskAudit")}><table><thead><tr><th>{t("task")}</th><th>{t("purpose")}</th><th>{t("status")}</th><th>{t("userWallet")}</th><th>{t("cap")}</th><th>{t("updated")}</th></tr></thead><tbody>{data.tasks.map(task => <tr key={task.taskId}><td><Link className="id-link" href={`/audit/${task.taskId}`}>{task.taskId}</Link></td><td><strong>{task.goal}</strong><small>{display(task.itemId)}</small></td><td><span className="status-pill" title={task.status}>{statusText(task.status)}</span>{task.statusReasonCode && <small>{task.statusReasonCode}</small>}</td><td><span className="mono">{task.ownerId}</span><small className="mono">{display(task.walletAddress)}</small></td><td className="mono">{display(task.maxAmountBaseUnits)}</td><td>{date(task.updatedAt)}</td></tr>)}</tbody></table></div></>}
      <div className="pagination"><button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>{t("previous")}</button><span>{t("page")} {page + 1}</span><button className="secondary" disabled={(page + 1) * data.limit >= data.total} onClick={() => setPage(page + 1)}>{t("next")}</button></div>
    </>}
  </main></>;
}
