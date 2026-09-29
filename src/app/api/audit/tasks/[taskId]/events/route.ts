import { NextRequest, NextResponse } from "next/server";
import { adminGet } from "@/lib/server";
import { validId } from "@/lib/validation";

export async function GET(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const q = request.nextUrl.searchParams;
  const decimal = /^(0|[1-9][0-9]*)$/;
  const after = q.get("after") ?? "0";
  const limit = q.get("limit") ?? "50";
  if (!validId(taskId) || [...q.keys()].some(k => !["after", "limit"].includes(k) || q.getAll(k).length !== 1) || !decimal.test(after) || !Number.isSafeInteger(Number(after)) || !decimal.test(limit) || Number(limit) < 1 || Number(limit) > 50)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  return adminGet(`/api/v1/admin/audit/tasks/${taskId}/events?${q.toString()}`);
}
