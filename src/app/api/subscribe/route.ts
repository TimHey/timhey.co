import { NextResponse } from "next/server";

// Newsletter subscribe endpoint. Two things happen: the email joins the real subscriber list in
// Upstash, and the signup is reported to Pickrate as a conversion — carrying how the visitor arrived
// (an ?via= tag or referring host) so Pickrate can attribute it to the agent that referred them.
// Both are best-effort; a store/analytics hiccup never fails the subscribe.

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const PICKRATE_ENDPOINT = process.env.PICKRATE_ENDPOINT;
const PICKRATE_KEY = process.env.PICKRATE_KEY;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function storeSubscriber(email: string): Promise<void> {
  if (!REST_URL || !REST_TOKEN) return;
  try {
    await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SADD", "subscribers", email],
        ["LPUSH", "subscribers:recent", JSON.stringify({ email, ts: new Date().toISOString() })],
        ["LTRIM", "subscribers:recent", 0, 499],
      ]),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}

async function reportConversion(email: string, via?: string, ref?: string): Promise<void> {
  if (!PICKRATE_KEY || !PICKRATE_ENDPOINT) return;
  const now = Date.now();
  const signals: Record<string, string> = {};
  if (via) signals.via = via;
  if (ref) signals.referrerHost = ref;
  // touch (how they arrived) just before the convert, both keyed to the email so they tie together.
  const events = [
    { type: "touch", email, ts: new Date(now - 1000).toISOString(), signals },
    { type: "convert", email, kind: "newsletter_signup", ts: new Date(now).toISOString() },
  ];
  try {
    await fetch(PICKRATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PICKRATE_KEY}` },
      body: JSON.stringify({ events }),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}

export async function POST(req: Request) {
  let body: { email?: unknown; via?: unknown; ref?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const via = body?.via ? String(body.via).slice(0, 60) : undefined;
  const ref = body?.ref ? String(body.ref).slice(0, 120) : undefined;

  await storeSubscriber(email);
  await reportConversion(email, via, ref);
  return NextResponse.json({ ok: true });
}
