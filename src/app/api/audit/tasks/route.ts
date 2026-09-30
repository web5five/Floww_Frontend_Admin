import { NextRequest, NextResponse } from "next/server";
import { adminGet } from "@/lib/server";

export const maxDuration = 30;

const statuses = new Set(["DRAFT", "AWAITING_APPROVAL", "ACTIVE", "EXECUTING", "COMPLETED", "DECLINED", "FAILED", "EXPIRED", "CANCELLED"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const decimal = /^(0|[1-9][0-9]*)$/;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if ([...q.keys()].some(k => !["status", "ownerId", "page", "limit"].includes(k) || q.getAll(k).length !== 1)) return invalid();
  const status = q.get("status");
  const ownerId = q.get("ownerId");
  const page = q.get("page") ?? "0";
  const limit = q.get("limit") ?? "20";
  if ((status !== null && !statuses.has(status)) || (ownerId !== null && !uuid.test(ownerId)) || !decimal.test(page) || Number(page) > 100000 || !decimal.test(limit) || Number(limit) < 1 || Number(limit) > 50) return invalid();
  return adminGet(`/api/v1/admin/audit/tasks?${q.toString()}`);
}

function invalid() { return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
