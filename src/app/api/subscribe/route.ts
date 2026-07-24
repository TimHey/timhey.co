import { NextResponse } from "next/server";
import { recordPending, redis, storeConfigured, type Signup } from "@/lib/subscribers";
import { sendEmail, emailConfigured } from "@/lib/email";
import { confirmEmail } from "@/lib/newsletter";
import { sign, secretConfigured } from "@/lib/tokens";
import { absolute } from "@/lib/site";

// Subscribe, step one of two. The address is recorded as pending and a confirmation link is mailed;
// nothing joins the actual list until that link is clicked (see ./confirm). How the visitor arrived
// (a ?via= tag or an AI referrer) rides along from the first-touch cookie the middleware set, so a
// signup can be attributed to the agent that sent them, and it's stored here rather than only being
// forwarded to Pickrate.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const PICKRATE_ENDPOINT = process.env.PICKRATE_ENDPOINT;
const PICKRATE_KEY = process.env.PICKRATE_KEY;

// A public endpoint that writes to a store and sends mail needs a ceiling.
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 10;

function readFirstTouch(req: Request): { via?: string; ref?: string; agent?: string } {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|; )pr_ft=([^;]+)/);
  if (!m) return {};
  try {
    const v = JSON.parse(decodeURIComponent(m[1])) as Record<string, unknown>;
    const s = (x: unknown, n: number) => (typeof x === "string" ? x.slice(0, n) : undefined);
    return { via: s(v.via, 60), ref: s(v.ref, 120), agent: s(v.agent, 60) };
  } catch {
    return {};
  }
}

async function rateLimited(req: Request): Promise<boolean> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  if (!ip || !storeConfigured()) return false;
  const key = `sub:rl:${ip}`;
  const res = await redis([
    ["INCR", key],
    ["EXPIRE", key, RATE_WINDOW],
  ]);
  return Number(res?.[0] ?? 0) > RATE_LIMIT;
}

async function reportTouch(s: Signup): Promise<void> {
  if (!PICKRATE_KEY || !PICKRATE_ENDPOINT) return;
  const signals: Record<string, string> = {};
  if (s.via) signals.via = s.via;
  if (s.ref) signals.referrerHost = s.ref;
  if (s.agent) signals.agent = s.agent;
  if (s.source) signals.source = s.source;
  try {
    await fetch(PICKRATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PICKRATE_KEY}` },
      body: JSON.stringify({
        events: [{ type: "touch", email: s.email, ts: new Date().toISOString(), signals }],
      }),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Honeypot. Report success so a bot has nothing to tune against.
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, pending: true });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  if (await rateLimited(req)) {
    return NextResponse.json({ error: "slow down" }, { status: 429 });
  }

  const ft = readFirstTouch(req);
  const signup: Signup = {
    email,
    source: String(body?.source ?? "unknown").slice(0, 40),
    via: ft.via,
    ref: ft.ref,
    agent: ft.agent,
  };

  const { alreadyConfirmed } = await recordPending(signup);
  if (alreadyConfirmed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await reportTouch(signup);

  // Can't confirm what we can't sign or can't send. Say so rather than leaving someone waiting on
  // an email that will never arrive.
  if (!secretConfigured() || !emailConfigured()) {
    return NextResponse.json({
      ok: true,
      pending: true,
      warning: "confirmation email not configured",
    });
  }

  const token = await sign("confirm", email);
  const { subject, text, html } = confirmEmail(
    absolute(`/api/subscribe/confirm?t=${encodeURIComponent(token)}`),
  );
  const res = await sendEmail({ to: email, subject, text, html });
  if (!res.sent) {
    console.error(JSON.stringify({ t: "confirm-send-failed", reason: res.reason }));
    return NextResponse.json({ error: "could not send confirmation" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, pending: true });
}
