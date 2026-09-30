import type { AccountRow, AttemptRow, Detail } from "./audit";

export type CountKey = "total" | "awaiting" | "active" | "executing" | "completed";
export type CountValue = { value: number | null; error: number | null };
export type Counts = Record<CountKey, CountValue>;
export type Summary = { total: number | null; awaiting: number | null; inProgress: number | null; completed: number | null; other: number | null; distributionAvailable: boolean };

export function validCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function deriveSummary(counts: Counts): Summary {
  const total = counts.total.value;
  const awaiting = counts.awaiting.value;
  const active = counts.active.value;
  const executing = counts.executing.value;
  const completed = counts.completed.value;
  const progressSum = active !== null && executing !== null ? active + executing : null;
  const inProgress = progressSum !== null && Number.isSafeInteger(progressSum) ? progressSum : null;
  const known = awaiting !== null && inProgress !== null && completed !== null;
  const remainder = total !== null && known ? total - awaiting - inProgress - completed : null;
  const distributionAvailable = remainder !== null && remainder >= 0;
  return { total, awaiting, inProgress, completed, other: distributionAvailable ? remainder : null, distributionAvailable };
}

export function formatBaseUnits(value: string | null | undefined, decimals: number | null | undefined): string | null {
  if (value === null || value === undefined || !/^(0|[1-9][0-9]*)$/.test(value)) return null;
  if (decimals === null || decimals === undefined || !Number.isInteger(decimals) || decimals < 0 || decimals > 255) return null;
  const amount = BigInt(value);
  if (decimals === 0) return amount.toString();
  const factor = BigInt(10) ** BigInt(decimals);
  const whole = amount / factor;
  const fraction = (amount % factor).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export type EvidenceState = "recorded" | "blocked" | "missing" | "unknown";
export type EvidenceStep = { state: EvidenceState; at: string | null };
export type Evidence = { request: EvidenceStep; policy: EvidenceStep; approval: EvidenceStep; payment: EvidenceStep; fulfillment: EvidenceStep; chosenAttempt: AttemptRow | null };

export function deriveEvidence(detail: Detail, account: AccountRow | null | undefined): Evidence {
  const attempts = detail.attempts;
  const chosenAttempt = account
    ? attempts.find(attempt => attempt.attemptId === account.attemptId) ?? null
    : [...attempts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  const policy: EvidenceStep = chosenAttempt?.policyDecision === "ALLOW"
    ? { state: "recorded", at: chosenAttempt.createdAt }
    : chosenAttempt?.policyDecision === "DENY"
      ? { state: "blocked", at: chosenAttempt.createdAt }
      : { state: chosenAttempt || account ? "unknown" : "missing", at: chosenAttempt?.createdAt ?? null };
  const approved = policy.state === "recorded" && chosenAttempt !== null && ["APPROVED", "ORDERED"].includes(chosenAttempt.status);
  const paymentVerified = approved && account?.paymentOperationState === "VERIFIED" && Boolean(account.paymentVerifiedAt && account.paymentTxHash);
  const fulfillmentVerified = paymentVerified && account?.state === "COMPLETED" && detail.task.status === "COMPLETED" && Boolean(account.fulfillmentVerifiedAt && account.fulfillmentTxHash);
  const paymentState: EvidenceState = paymentVerified ? "recorded"
    : account === undefined ? "unknown"
      : account === null ? "missing"
        : account.paymentOperationState === "UNKNOWN" || account.state === "PAYMENT_UNKNOWN" || account.paymentOperationState === "VERIFIED" ? "unknown" : "missing";
  const fulfillmentState: EvidenceState = fulfillmentVerified ? "recorded"
    : account === undefined ? "unknown"
      : account === null ? "missing"
        : ["FULFILLMENT_UNKNOWN", "PAYMENT_UNKNOWN", "COMPLETED"].includes(account.state) ? "unknown" : "missing";
  return {
    request: { state: detail.task.createdAt ? "recorded" : "missing", at: detail.task.createdAt ?? null },
    policy,
    approval: { state: approved ? "recorded" : chosenAttempt ? "missing" : "unknown", at: approved ? chosenAttempt.finishedAt : null },
    payment: { state: paymentState, at: paymentVerified ? account!.paymentVerifiedAt : null },
    fulfillment: { state: fulfillmentState, at: fulfillmentVerified ? account!.fulfillmentVerifiedAt : null },
    chosenAttempt,
  };
}
