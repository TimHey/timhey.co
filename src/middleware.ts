import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { record, recordProbe, recordTooling } from "@/lib/agent-log";
import { classify } from "@/lib/agent-filter";
import { createCollector } from "@pickrate/collector";

// Dogfooding @pickrate/collector: stream this site's agent hits to Pickrate alongside the local
// Upstash log. No-ops without PICKRATE_KEY, so dev/preview are unaffected until the env is set.
const pickrate = createCollector({
  key: process.env.PICKRATE_KEY ?? "",
  endpoint: process.env.PICKRATE_ENDPOINT,
});

// This site's subject is agent-readable content, so it measures its own agent
// readers. Middleware runs before the CDN cache, which is the only place that
// sees crawlers and agents: they don't run JavaScript, so GA4 never sees them.

// Known AI-assistant referrer hosts -> agent name, for first-touch capture below.
const AI_REFERRERS: [string, string][] = [
  ["chatgpt.com", "ChatGPT"],
  ["chat.openai.com", "ChatGPT"],
  ["openai.com", "ChatGPT"],
  ["claude.ai", "Claude"],
  ["perplexity.ai", "Perplexity"],
  ["gemini.google.com", "Gemini"],
  ["copilot.microsoft.com", "Copilot"],
];
function aiReferrer(host: string): string | null {
  const h = host.toLowerCase().replace(/^www\./, "");
  for (const [d, name] of AI_REFERRERS) if (h === d || h.endsWith(`.${d}`)) return name;
  return null;
}

// First-touch capture (first-touch-wins): remember how a visitor arrived — a ?via= tag (a link an
// agent handed out, e.g. tagged in llms.txt) or a known AI-assistant referrer — in a first-party
// cookie. /api/subscribe reads it so a signup is attributed to the agent. Set server-side here so it
// works on ANY entry (an HTML page, a .md mirror, a well-known file), not only where client JS runs.
const FT_COOKIE = "pr_ft";
function captureFirstTouch(req: NextRequest, res: NextResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") return;
  if (req.cookies.get(FT_COOKIE)) return; // first touch wins — never overwrite
  const via = req.nextUrl.searchParams.get("via");
  let refHost = "";
  try {
    refHost = new URL(req.headers.get("referer") ?? "").host;
  } catch {
    /* no / invalid referrer */
  }
  const agent = refHost ? aiReferrer(refHost) : null;
  let ft: Record<string, string> | null = null;
  if (via) ft = { via: via.slice(0, 60) };
  else if (agent) ft = { ref: refHost, agent };
  if (!ft) return;
  res.cookies.set(FT_COOKIE, JSON.stringify(ft), {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // the API route reads it server-side; the client may read it too
  });
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const ua = req.headers.get("user-agent") ?? "";
  const path = req.nextUrl.pathname;
  const hit = classify(path, ua);

  if (hit.kind === "probe") {
    // Scanners, not readers. Counted in aggregate so the volume is still
    // visible, but kept out of the agent numbers where it would be a lie.
    event.waitUntil(recordProbe());
  } else if (hit.kind === "tooling") {
    // curl, wget, a python script — including mine. Same treatment as probes:
    // counted, not credited. Calling my own testing an agent read would make
    // this page exactly the kind of number these posts complain about.
    event.waitUntil(recordTooling(hit.tool));
  } else if (hit.kind === "agent") {
    // One structured line, greppable in Vercel logs even without a store.
    console.log(
      JSON.stringify({
        t: "agent-hit",
        agent: hit.agent,
        surface: hit.surface,
        path: hit.path,
        ua: ua.slice(0, 200),
      }),
    );
    // Durable counters, if a store is configured. waitUntil keeps the write off
    // the response path — the visitor (agent) never waits on it. The UA rides
    // along so an unnamed agent can be identified later; record() drops it for
    // everything it can already name.
    event.waitUntil(
      record({ agent: hit.agent, surface: hit.surface, path: hit.path, ua }),
    );
  }

  // Report to Pickrate too. report() classifies internally (GET/HEAD agent hits only) and no-ops on
  // human/asset traffic, so this is cheap on every request and off the response path via waitUntil.
  // Probes and tooling are withheld — they'd pollute the Pickrate data the same way.
  if (hit.kind !== "probe" && hit.kind !== "tooling") {
    event.waitUntil(pickrate.report({ method: req.method, path, userAgent: ua }));
  }

  const res = NextResponse.next();
  captureFirstTouch(req, res);
  return res;
}

export const config = {
  // Everything except static assets. Middleware runs before the cache, so this
  // still catches agents hitting statically-cached pages.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
