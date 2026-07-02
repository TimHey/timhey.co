import { NextResponse } from "next/server";
import { readStats, storeConfigured } from "@/lib/agent-log";

// Live counters, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!storeConfigured()) {
    return NextResponse.json(
      { configured: false, message: "Agent-traffic store not configured." },
      { headers: { "cache-control": "no-store" } },
    );
  }
  const stats = await readStats();
  return NextResponse.json(
    { configured: true, ...stats },
    { headers: { "cache-control": "no-store" } },
  );
}
