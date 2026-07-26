// Transactional and broadcast email via Resend, over plain fetch so there's no SDK to keep current.
// Guarded on RESEND_API_KEY: with no key set, send() is a no-op that reports why. That means the
// whole flow (subscribe, confirm, cron) can be deployed and exercised before the sending domain is
// verified, without anything crashing or silently pretending to have sent.

const FROM = process.env.NEWSLETTER_FROM ?? "Tim Hey <tim@send.timhey.co>";
const REPLY_TO = process.env.NEWSLETTER_REPLY_TO;
// Overridable so the send path can be pointed at a local stand-in and verified without mailing
// anyone. Unset everywhere except a test run.
const API = process.env.RESEND_API_BASE ?? "https://api.resend.com";

export interface SendResult {
  sent: boolean;
  reason?: string;
}

export interface Message {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Extra headers. Used for List-Unsubscribe on bulk mail. */
  headers?: Record<string, string>;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Resend allows 10 requests/second per team, and that budget is shared with every other domain on
 * the account. A 429 is therefore expected under load rather than exceptional, and it has to be
 * retried: the cron only un-claims a post when *every* send failed, so a rate-limited message that
 * isn't retried here is a subscriber who silently never receives that post.
 *
 * Retries 429 and 5xx. A 4xx that isn't 429 is a bad address or a bad payload — retrying that just
 * burns the daily quota.
 */
const MAX_ATTEMPTS = 4;

export async function sendEmail(msg: Message): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY not set" };

  let last = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API}/emails`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: msg.to,
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
          ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
          ...(msg.headers ? { headers: msg.headers } : {}),
        }),
        cache: "no-store",
      });
      if (res.ok) return { sent: true };

      const body = await res.text().catch(() => "");
      last = `resend ${res.status}: ${body.slice(0, 200)}`;

      const retryable = res.status === 429 || res.status >= 500;
      if (!retryable || attempt === MAX_ATTEMPTS) return { sent: false, reason: last };

      // Honour Retry-After when the provider sets it; otherwise back off exponentially.
      const after = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(after) && after > 0 ? after * 1000 : 2 ** attempt * 250);
    } catch (e) {
      last = (e as Error).message.slice(0, 200);
      if (attempt === MAX_ATTEMPTS) return { sent: false, reason: last };
      await sleep(2 ** attempt * 250);
    }
  }
  return { sent: false, reason: last };
}

/**
 * One request per recipient, in bounded waves.
 *
 * Deliberately not Resend's batch endpoint and deliberately not one `to:` with everyone in it:
 * each subscriber's mail carries their own unsubscribe link, and putting a list of addresses in a
 * single header would leak every subscriber to every subscriber.
 */
export async function sendMany(
  messages: Message[],
  concurrency = 4,
  maxPerSecond = 6,
): Promise<{ sent: number; failed: number; reasons: string[] }> {
  let sent = 0;
  let failed = 0;
  const reasons: string[] = [];
  for (let i = 0; i < messages.length; i += concurrency) {
    const wave = messages.slice(i, i + concurrency);
    const startedAt = Date.now();
    const results = await Promise.all(wave.map(sendEmail));
    for (const r of results) {
      if (r.sent) sent++;
      else {
        failed++;
        if (r.reason && reasons.length < 10) reasons.push(r.reason);
      }
    }
    // Pace the waves. Without this, four requests that each return in 50ms is a sustained 80/s,
    // well over the limit — the concurrency number alone controls nothing.
    const isLast = i + concurrency >= messages.length;
    if (!isLast) {
      const minMs = (wave.length / maxPerSecond) * 1000;
      const elapsed = Date.now() - startedAt;
      if (elapsed < minMs) await sleep(minMs - elapsed);
    }
  }
  return { sent, failed, reasons };
}
