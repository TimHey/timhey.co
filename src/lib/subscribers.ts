// Subscriber state in Upstash Redis, over the REST API (same pattern as agent-log.ts — no SDK).
//
// Two lists on purpose. `subscribers` holds everyone who submitted the form; `subscribers:confirmed`
// holds only those who clicked the link in the confirmation email. Only the confirmed list is ever
// mailed. That split is what keeps a typo'd address or a bot signup from turning into a bounce
// against the sending domain.

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export function storeConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

type Cmd = (string | number)[];

export async function redis(cmds: Cmd[]): Promise<unknown[] | null> {
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

export interface Signup {
  email: string;
  source: string;
  via?: string;
  ref?: string;
  agent?: string;
}

/** Record the signup as pending. Returns false when already confirmed (nothing to do). */
export async function recordPending(s: Signup): Promise<{ alreadyConfirmed: boolean }> {
  const res = await redis([
    ["SISMEMBER", "subscribers:confirmed", s.email],
    ["SADD", "subscribers", s.email],
    [
      "HSET",
      `subscriber:${s.email}`,
      "source",
      s.source,
      "via",
      s.via ?? "",
      "ref",
      s.ref ?? "",
      "agent",
      s.agent ?? "",
      "pending_at",
      new Date().toISOString(),
    ],
  ]);
  return { alreadyConfirmed: Number(res?.[0] ?? 0) === 1 };
}

/** Promote to the mailing list. Returns false if they were already on it. */
export async function confirm(email: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const res = await redis([
    ["SADD", "subscribers:confirmed", email],
    ["SREM", "subscribers:unsubscribed", email],
    ["HSET", `subscriber:${email}`, "confirmed_at", new Date().toISOString()],
    ["HINCRBY", "subscribers:days", day, 1],
  ]);
  if (res === null) return false;
  const added = Number(res[0]) === 1;
  if (added) {
    // Roll up attribution only on a real new confirmation, so re-clicks don't double count.
    const meta = await redis([["HGETALL", `subscriber:${email}`]]);
    const h = flat(meta?.[0]);
    await redis([
      ["HINCRBY", "subscribers:by-source", h.source || "unknown", 1],
      ["HINCRBY", "subscribers:by-attribution", h.via || h.agent || h.ref || "direct", 1],
    ]);
  }
  return added;
}

export async function unsubscribe(email: string): Promise<void> {
  await redis([
    ["SREM", "subscribers:confirmed", email],
    ["SADD", "subscribers:unsubscribed", email],
    ["HSET", `subscriber:${email}`, "unsubscribed_at", new Date().toISOString()],
  ]);
}

/** Everyone who should receive the next post. */
export async function confirmedList(): Promise<string[]> {
  const res = await redis([["SMEMBERS", "subscribers:confirmed"]]);
  const v = res?.[0];
  return Array.isArray(v) ? v.map(String) : [];
}

function flat(v: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(v)) {
    for (let i = 0; i + 1 < v.length; i += 2) out[String(v[i])] = String(v[i + 1] ?? "");
  } else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = String(val ?? "");
  }
  return out;
}

// --- send bookkeeping ------------------------------------------------------

/**
 * Which posts have already been mailed.
 *
 * Bootstrap matters more than it looks: the first time this runs there are already a dozen
 * published posts and an empty set, which would mail the entire back catalogue at once. So the
 * first run marks everything currently published as sent and mails nothing. Combined with the
 * freshness window in the cron, a post has to be genuinely new to go out.
 */
export async function initSentLog(publishedSlugs: string[]): Promise<boolean> {
  const res = await redis([["EXISTS", "newsletter:sent"]]);
  if (Number(res?.[0] ?? 0) === 1) return false;
  if (publishedSlugs.length > 0) {
    await redis([["SADD", "newsletter:sent", ...publishedSlugs]]);
  } else {
    await redis([["SADD", "newsletter:sent", "__init__"]]);
  }
  return true;
}

/** Atomically claim a post for sending. False means someone already claimed it. */
export async function claimSend(slug: string): Promise<boolean> {
  const res = await redis([["SADD", "newsletter:sent", slug]]);
  return Number(res?.[0] ?? 0) === 1;
}

export async function releaseSend(slug: string): Promise<void> {
  await redis([["SREM", "newsletter:sent", slug]]);
}

export async function logSend(slug: string, sent: number, failed: number): Promise<void> {
  await redis([
    [
      "LPUSH",
      "newsletter:log",
      JSON.stringify({ slug, sent, failed, ts: new Date().toISOString() }),
    ],
    ["LTRIM", "newsletter:log", 0, 99],
  ]);
}
