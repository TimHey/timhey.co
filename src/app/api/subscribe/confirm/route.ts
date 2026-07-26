import { NextResponse } from "next/server";
import { confirm } from "@/lib/subscribers";
import { verify } from "@/lib/tokens";
import { absolute } from "@/lib/site";

// Step two: the click in the confirmation email. Only this promotes an address onto the mailing
// list. A GET that changes state is normally a smell, but a link in an email is the only thing a
// mail client will follow, and the signed token is what makes it safe to act on.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // links expire after a week

// Report a conversion to Pickrate at confirmation rather than at submit: an unconfirmed address
// isn't a subscriber, so counting it as one would overstate every agent's conversion rate.
async function reportConversion(email: string): Promise<void> {
  // Default the endpoint (see ../route.ts) so a missing PICKRATE_ENDPOINT can't silently drop the
  // conversion — only PICKRATE_KEY is required.
  const endpoint = process.env.PICKRATE_ENDPOINT || "https://pickrate.io/api/collect";
  const key = process.env.PICKRATE_KEY;
  if (!key) return;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        events: [
          {
            type: "convert",
            email,
            kind: "newsletter_signup",
            ts: new Date().toISOString(),
          },
        ],
      }),
      cache: "no-store",
    });
  } catch {
    /* best-effort */
  }
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const email = await verify("confirm", token, MAX_AGE);
  if (!email) {
    return NextResponse.redirect(absolute("/subscribed?status=invalid"), 302);
  }
  const added = await confirm(email);
  if (added) await reportConversion(email);
  return NextResponse.redirect(
    absolute(`/subscribed?status=${added ? "ok" : "already"}`),
    302,
  );
}
