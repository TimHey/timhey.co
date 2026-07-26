// The two emails this site sends: a confirmation, and a post.
//
// Both are plain by design. Single column, system fonts, no images, no tracking pixel, no
// bulletproof-button table scaffolding. A post here is text an agent can read; the email version
// shouldn't be any different, and plain mail renders identically in every client without testing
// twelve of them.

// Explicit .ts extensions: scripts/ run these modules directly under node's type stripping, which
// does no extension resolution. Next's bundler is fine either way.
import { SITE, absolute } from "./site.ts";
import type { Post } from "./posts.ts";

const POSTAL = process.env.NEWSLETTER_POSTAL_ADDRESS ?? "";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL_OPEN = `<div style="font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">`;
const SHELL_CLOSE = `</div>`;
const RULE = `<hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0">`;
const MUTED = `font-size:13px;line-height:1.5;color:#767676`;

export function confirmEmail(confirmUrl: string): { subject: string; text: string; html: string } {
  const subject = "Confirm your subscription";
  const text = [
    "Thanks for subscribing to Field notes on selling to agents.",
    "",
    "One click and you're on the list:",
    confirmUrl,
    "",
    "One post a week. Nothing else, and no one else gets your address.",
    "",
    "If you didn't sign up, ignore this. Without the click above, nothing happens and the request expires in seven days.",
    "",
    `${SITE.author} / ${SITE.url}`,
  ].join("\n");

  const html =
    SHELL_OPEN +
    `<p style="margin:0 0 20px">Thanks for subscribing to <strong>Field notes on selling to agents</strong>.</p>` +
    `<p style="margin:0 0 24px"><a href="${esc(confirmUrl)}" style="color:#0b5cff;font-weight:600">Confirm your subscription</a></p>` +
    `<p style="margin:0 0 20px">One post a week. Nothing else, and no one else gets your address.</p>` +
    RULE +
    `<p style="margin:0;${MUTED}">If you didn't sign up, ignore this. Without that click nothing happens, and the request expires in seven days.</p>` +
    `<p style="margin:16px 0 0;${MUTED}"><a href="${esc(SITE.url)}" style="color:#767676">${esc(SITE.url)}</a></p>` +
    SHELL_CLOSE;

  return { subject, text, html };
}

export function postEmail(
  post: Post,
  unsubscribeUrl: string,
): { subject: string; text: string; html: string } {
  const url = absolute(`/posts/${post.slug}`);
  const subject = post.title;

  const text = [
    post.title,
    "",
    post.description,
    "",
    `Read it: ${url}`,
    `As markdown: ${absolute(`/posts/${post.slug}.md`)}`,
    "",
    "---",
    `You're getting this because you confirmed a subscription at ${SITE.url}.`,
    `Unsubscribe: ${unsubscribeUrl}`,
    POSTAL ? `\n${POSTAL}` : "",
  ]
    .join("\n")
    .trim();

  const html =
    SHELL_OPEN +
    `<h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;font-weight:650">${esc(post.title)}</h1>` +
    `<p style="margin:0 0 24px;color:#444">${esc(post.description)}</p>` +
    `<p style="margin:0 0 8px"><a href="${esc(url)}" style="color:#0b5cff;font-weight:600">Read it on the site</a></p>` +
    // The markdown mirror in the footer of every email is a small joke that is also the argument.
    `<p style="margin:0;${MUTED}">Prefer it as plain markdown? <a href="${esc(absolute(`/posts/${post.slug}.md`))}" style="color:#767676">Here you go.</a></p>` +
    RULE +
    `<p style="margin:0 0 8px;${MUTED}">You're getting this because you confirmed a subscription at <a href="${esc(SITE.url)}" style="color:#767676">${esc(SITE.url)}</a>.</p>` +
    `<p style="margin:0;${MUTED}"><a href="${esc(unsubscribeUrl)}" style="color:#767676;text-decoration:underline">Unsubscribe</a></p>` +
    (POSTAL ? `<p style="margin:16px 0 0;${MUTED}">${esc(POSTAL)}</p>` : "") +
    SHELL_CLOSE;

  return { subject, text, html };
}

/**
 * Headers that make a bulk send legitimate.
 *
 * List-Unsubscribe plus List-Unsubscribe-Post is the one-click form (RFC 8058). Gmail and Yahoo
 * require it from bulk senders, and it's also what puts the native "Unsubscribe" button next to the
 * sender name instead of leaving people to hit "spam" to make it stop.
 */
export function bulkHeaders(unsubscribeUrl: string, oneClickUrl: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUrl}>, <${unsubscribeUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
