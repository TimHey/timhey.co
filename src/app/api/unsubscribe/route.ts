import { NextResponse } from "next/server";
import { unsubscribe } from "@/lib/subscribers";
import { verify } from "@/lib/tokens";
import { absolute } from "@/lib/site";

// Unsubscribe, two ways into the same action.
//
// GET is the link a person clicks in the footer. POST is RFC 8058 one-click, which is what Gmail
// and Yahoo call when someone hits the native Unsubscribe button next to the sender name. Both are
// honoured immediately with no confirmation step and no login. Making this hard is how you get
// marked as spam, which costs far more than the subscriber does.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// No expiry: an unsubscribe link has to work in a year-old email.
async function handle(token: string): Promise<string | null> {
  const email = await verify("unsubscribe", token);
  if (!email) return null;
  await unsubscribe(email);
  return email;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const email = await handle(token);
  return NextResponse.redirect(
    absolute(`/unsubscribed?status=${email ? "ok" : "invalid"}`),
    302,
  );
}

export async function POST(req: Request) {
  // One-click senders put the token in the query string; accept a form body too, since the RFC
  // lets the mail provider post an arbitrary body.
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const email = await handle(token);
  // Always 200. A mail provider retrying a failed unsubscribe is worse than a silent no-op.
  return NextResponse.json({ ok: Boolean(email) });
}
