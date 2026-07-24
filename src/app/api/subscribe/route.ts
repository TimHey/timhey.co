import { NextResponse } from "next/server";

// Newsletter subscribe endpoint. Two things happen: the email joins the real subscriber list in
// Upstash, and the signup is reported to Pickrate as a conversion — carrying how the visitor arrived
// (an ?via= tag or referring host) so Pickrate can attribute it to the agent that referred them.
// Both are best-effort; a store/analytics hiccup never fails the subscribe.
//
// Attribution is written to Upstash as well as sent to Pickrate. Pickrate is the product being
// dogfooded here, but the raw signal shouldn't only live somewhere else — if it's worth measuring,
// it's worth owning a copy.

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const PICKRATE_ENDPOINT = process.env.PICKRATE_ENDPOINT;
const PICKRATE_KEY = process.env.PICKRATE_KEY;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// A public endpoint that writes to a store needs a ceiling. Generous enough that a person
// correcting a typo never notices it.
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 10; // seconds

async function redis(cmds: (string | number)[][]): Promise<unknown[] | null> {
  if (!REST_URL || !REST_TOKEN || cmds.length === 0) return null;
  try {
    const res = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result?: unknown }[];
    return out.map((o) => o.result ?? null);
  } catch {
    return null;
  }
}

// The authoritative first-touch: read the pr_ft cookie the middleware set server-side (a ?via= tag
// or an AI-referrer host). Preferred over anything the client sends.
function readFirstTouch(req: Request): { via?: string; ref?: string; agent?: string } {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|; )pr_ft=([^;]+)/);
  if (!m) return {};
  try {
    const v = JSON.parse(decodeURIComponent(m[1])) as {
      via?: unknown;
      ref?: unknown;
      agent?: unknown;
    };
    return {
      via: typeof v.via === "string" ? v.via.slice(0, 60) : undefined,
      ref: typeof v.ref === "string" ? v.ref.slice(0, 120) : undefined,
      agent: typeof v.agent === "string" ? v.agent.slice(0, 60) : undefined,
    };
  } catch {
    return {};
  }
}

/** True when this client has already had its allowance in the window. */
async function rateLimited(req: Request): Promise<boolean> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  if (!ip || !REST_URL || !REST_TOKEN) return false; // can't identify or can't count: let it through
  const key = `sub:rl:${ip}`;
  const res = await redis([
    ["INCR", key],
    ["EXPIRE", key, RATE_WINDOW],
  ]);
  const n = Number(res?.[0] ?? 0);
  return n > RATE_LIMIT;
}

interface Signup {
  email: string;
  source: string;
  via?: string;
  ref?: string;
  agent?: string;
}

/** Returns true when the email was already on the list. */
async function storeSubscriber(s: Signup): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const attribution = s.via ?? s.agent ?? s.ref ?? "direct";
  const res = await redis([
    ["SADD", "subscribers", s.email],
    [
      "LPUSH",
      "subscribers:recent",
      JSON.stringify({ ...s, ts: new Date().toISOString() }),
    ],
    ["LTRIM", "subscribers:recent", 0, 499],
    // Roll-ups, so "where do signups come from" is one read instead of a scan.
    ["HINCRBY", "subscribers:by-source", s.source, 1],
    ["HINCRBY", "subscribers:by-attribution", attribution, 1],
    ["HINCRBY", "subscribers:days", day, 1],
  ]);
  return res !== null && Number(res[0]) === 0;
}

async function reportConversion(s: Signup): Promise<void> {
  if (!PICKRATE_KEY || !PICKRATE_ENDPOINT) return;
  const now = Date.now();
  const signals: Record<string, string> = {};
  if (s.via) signals.via = s.via;
  if (s.ref) signals.referrerHost = s.ref;
  if (s.agent) signals.agent = s.agent;
  if (s.source) signals.source = s.source;
  // touch (how they arrived) just before the convert, both keyed to the email so they tie together.
  const events = [
    { type: "touch", email: s.email, ts: new Date(now - 1000).toISOString(), signals },
    { type: "convert", email: s.email, kind: "newsletter_signup", ts: new Date(now).toISOString() },
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
  let body: {
    email?: unknown;
    via?: unknown;
    ref?: unknown;
    source?: unknown;
    website?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Honeypot. Report success so the bot has nothing to tune against.
  if (typeof body?.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  if (await rateLimited(req)) {
    return NextResponse.json({ error: "slow down" }, { status: 429 });
  }

  // The cookie (set server-side by middleware) is authoritative; body values are a fallback.
  const ft = readFirstTouch(req);
  const signup: Signup = {
    email,
    source: String(body?.source ?? "unknown").slice(0, 40),
    via: ft.via ?? (body?.via ? String(body.via).slice(0, 60) : undefined),
    ref: ft.ref ?? (body?.ref ? String(body.ref).slice(0, 120) : undefined),
    agent: ft.agent,
  };

  // Independent writes — no reason for the visitor to wait on them in series.
  const [duplicate] = await Promise.all([
    storeSubscriber(signup),
    reportConversion(signup),
  ]);
  return NextResponse.json({ ok: true, duplicate });
}
