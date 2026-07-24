/**
 * Mail confirmation links to everyone who signed up before sending was switched on.
 *
 * Between shipping the subscribe form and verifying the sending domain, addresses collect in
 * `subscribers` with no confirmation email ever sent. Run this once after step 5 of EMAIL-SETUP.md
 * and those people get their link instead of being silently dropped.
 *
 * Dry run:  node --experimental-strip-types scripts/invite-pending.ts
 * Send:     node --experimental-strip-types scripts/invite-pending.ts --send
 *
 * Needs KV_REST_API_URL, KV_REST_API_TOKEN, RESEND_API_KEY, NEWSLETTER_SECRET.
 */
import { sendEmail } from "../src/lib/email.ts";
import { confirmEmail } from "../src/lib/newsletter.ts";
import { sign, secretConfigured } from "../src/lib/tokens.ts";
import { absolute } from "../src/lib/site.ts";

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const SEND = process.argv.includes("--send");

if (!URL_ || !TOKEN) {
  console.error("Missing KV_REST_API_URL / KV_REST_API_TOKEN.");
  process.exit(1);
}
if (!secretConfigured()) {
  console.error("Missing NEWSLETTER_SECRET (32+ hex chars).");
  process.exit(1);
}
if (SEND && !process.env.RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY.");
  process.exit(1);
}

async function redis(cmds: (string | number)[][]): Promise<unknown[]> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return ((await res.json()) as { result?: unknown }[]).map((o) => o.result ?? null);
}

const [allRaw, confirmedRaw, unsubRaw] = await redis([
  ["SMEMBERS", "subscribers"],
  ["SMEMBERS", "subscribers:confirmed"],
  ["SMEMBERS", "subscribers:unsubscribed"],
]);

const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
const confirmed = new Set(arr(confirmedRaw));
const unsubscribed = new Set(arr(unsubRaw));
// Never re-invite someone who already opted out. That would be the worst possible first email.
const pending = arr(allRaw).filter((e) => !confirmed.has(e) && !unsubscribed.has(e));

console.log(`total signups:  ${arr(allRaw).length}`);
console.log(`confirmed:      ${confirmed.size}`);
console.log(`unsubscribed:   ${unsubscribed.size}`);
console.log(`to invite:      ${pending.length}`);
for (const e of pending) console.log(`  ${e}`);

if (!SEND) {
  console.log("\nDry run. Re-run with --send to mail them.");
  process.exit(0);
}

let sent = 0;
let failed = 0;
for (const email of pending) {
  const token = await sign("confirm", email);
  const { subject, text, html } = confirmEmail(
    absolute(`/api/subscribe/confirm?t=${encodeURIComponent(token)}`),
  );
  const res = await sendEmail({ to: email, subject, text, html });
  if (res.sent) sent++;
  else {
    failed++;
    console.error(`  failed ${email}: ${res.reason}`);
  }
}
console.log(`\nsent ${sent}, failed ${failed}`);
