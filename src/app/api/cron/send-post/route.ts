import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import {
  claimSend,
  confirmedList,
  initSentLog,
  logSend,
  releaseSend,
  storeConfigured,
} from "@/lib/subscribers";
import { sendMany, emailConfigured, type Message } from "@/lib/email";
import { postEmail, bulkHeaders } from "@/lib/newsletter";
import { sign, secretConfigured } from "@/lib/tokens";
import { absolute } from "@/lib/site";

// Daily cron. Posts publish by date with no cron, so this just notices when one has become live and
// mails it to the confirmed list. Runs unattended, which is why most of this file is guardrails
// rather than sending.
//
// Four things stand between a bug and mailing the wrong thing to everyone:
//   1. NEWSLETTER_ENABLED must be "1". Deploying the code doesn't arm it.
//   2. First run adopts every already-published post as "sent" and mails nothing, so switching this
//      on can't blast the back catalogue.
//   3. Only posts dated within FRESH_DAYS are eligible, so an old post edited into view stays put.
//   4. The slug is claimed atomically before the first send, so an overlapping run can't double-send.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FRESH_DAYS = 2;

function daysAgo(iso: string): number {
  const then = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / 86_400_000;
}

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Refuse anything else once it's set. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const checks = {
    enabled: process.env.NEWSLETTER_ENABLED === "1",
    store: storeConfigured(),
    email: emailConfigured(),
    secret: secretConfigured(),
  };
  if (!checks.store) {
    return NextResponse.json({ ok: false, reason: "no store", checks });
  }

  const published = getAllPosts();

  // Bootstrap before any eligibility check, so the very first run is always a no-op send.
  const bootstrapped = await initSentLog(published.map((p) => p.slug));
  if (bootstrapped) {
    return NextResponse.json({
      ok: true,
      bootstrapped: true,
      adopted: published.length,
      note: "first run: existing posts marked as already sent, nothing mailed",
    });
  }

  if (!checks.enabled || !checks.email || !checks.secret) {
    return NextResponse.json({ ok: false, reason: "not armed", checks });
  }

  const fresh = published.filter((p) => daysAgo(p.date) <= FRESH_DAYS);
  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: "no fresh post" });
  }

  const results: unknown[] = [];
  for (const post of fresh) {
    // Claim first. If this returns false the post was already mailed (or is being mailed now).
    if (!(await claimSend(post.slug))) continue;

    const list = await confirmedList();
    if (list.length === 0) {
      results.push({ slug: post.slug, sent: 0, note: "no confirmed subscribers" });
      await logSend(post.slug, 0, 0);
      continue;
    }

    const messages: Message[] = [];
    for (const email of list) {
      const token = await sign("unsubscribe", email);
      const url = absolute(`/api/unsubscribe?t=${encodeURIComponent(token)}`);
      const { subject, text, html } = postEmail(post, url);
      messages.push({ to: email, subject, text, html, headers: bulkHeaders(url, url) });
    }

    const { sent, failed, reasons } = await sendMany(messages);
    await logSend(post.slug, sent, failed);

    // Total failure is a provider problem, not a sent post. Un-claim it so tomorrow retries;
    // a partial success stays claimed, because re-running would double-mail everyone who got it.
    if (sent === 0 && failed > 0) {
      await releaseSend(post.slug);
      console.error(JSON.stringify({ t: "newsletter-failed", slug: post.slug, reasons }));
    }
    results.push({ slug: post.slug, sent, failed, reasons: reasons.slice(0, 3) });
  }

  return NextResponse.json({ ok: true, results });
}
