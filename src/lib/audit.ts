export type TaskRow = {
  taskId: string; ownerId: string; walletAddress: string | null; goal: string; status: string;
  statusReasonCode: string | null; mandateId: string | null; mandateVersion: number | null;
  mandateStatus: string | null; mandateExpiresAt: string | null; itemId: string | null; maxAmountBaseUnits: string | null;
  tokenAddress: string | null; tokenDecimals: number | null; createdAt: string; updatedAt: string;
  completedAt: string | null;
};
export type TaskPage = { tasks: TaskRow[]; total: number; page: number; limit: number };
export type AttemptRow = { attemptId: string; quoteId: string; merchantId: string | null; status: string;
  policyDecision: string; reasonCode: string | null; amountBaseUnits: string | null;
  recipientAddress: string | null; createdAt: string; finishedAt: string | null };
export type Detail = { task: TaskRow; attempts: AttemptRow[] };
export type EventRow = { seq: number; attemptId: string | null; kind: string; state: string | null;
  reasonCode: string | null; actor: string; createdAt: string };
export type EventPage = { events: EventRow[]; nextCursor: number; hasMore: boolean };
export type AccountRow = { taskId: string; attemptId: string; state: string; ownerAddress: string;
  accountAddress: string | null; deployTxHash: string | null; chainId: number; tokenAddress: string;
  recipientAddress: string; amountBaseUnits: string; approvalTxHash: string | null;
  approvalOperationState: string | null; paymentId: string | null; paymentTxHash: string | null;
  paymentOperationState: string | null;
  paymentVerifiedAt: string | null; fulfillmentId: string | null; fulfillmentEvidenceHash: string | null;
  fulfillmentTxHash: string | null; fulfillmentVerifiedAt: string | null; updatedAt: string };

export const display = (value: string | number | null | undefined) => value === null || value === undefined || value === "" ? "—" : String(value);
export const date = (value: string | null | undefined) => value ? new Date(value).toLocaleString() : "—";
export function errorText(status: number) {
  if (status === 401) return "Your admin session has expired. Sign in again.";
  if (status === 403) return "This account does not have admin audit access.";
  if (status === 404) return "This task was not found.";
  return "Audit records are unavailable right now. Try again.";
}
