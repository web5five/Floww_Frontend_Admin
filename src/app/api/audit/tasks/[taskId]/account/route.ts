import { NextResponse } from "next/server";
import { adminGet } from "@/lib/server";
import { validId } from "@/lib/validation";

export const maxDuration = 30;

export async function GET(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  if (!validId(taskId)) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  return adminGet(`/api/v1/admin/audit/tasks/${taskId}/account`);
}
