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

export async function sendEmail(msg: Message): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY not set" };
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
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { sent: false, reason: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: (e as Error).message.slice(0, 200) };
  }
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
  concurrency = 8,
): Promise<{ sent: number; failed: number; reasons: string[] }> {
  let sent = 0;
  let failed = 0;
  const reasons: string[] = [];
  for (let i = 0; i < messages.length; i += concurrency) {
    const wave = messages.slice(i, i + concurrency);
    const results = await Promise.all(wave.map(sendEmail));
    for (const r of results) {
      if (r.sent) sent++;
      else {
        failed++;
        if (r.reason && reasons.length < 10) reasons.push(r.reason);
      }
    }
  }
  return { sent, failed, reasons };
}
