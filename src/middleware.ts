import { NextResponse, type NextRequest } from "next/server";

// This site's subject is agent-readable content, so it measures its own agent
// readers. Middleware runs before the CDN cache, which is the only place that
// sees crawlers and agents: they don't run JavaScript, so GA4 never sees them.

// Known agent + crawler user-agents. Substring match on a lowercased UA.
// Grouped by owner so the logs read cleanly. Extend as new agents show up.
const AGENT_UAS: [string, string][] = [
  ["gptbot", "OpenAI GPTBot"],
  ["oai-searchbot", "OpenAI SearchBot"],
  ["chatgpt-user", "OpenAI ChatGPT-User"],
  ["claudebot", "Anthropic ClaudeBot"],
  ["claude-user", "Anthropic Claude-User"],
  ["claude-web", "Anthropic Claude-Web"],
  ["anthropic-ai", "Anthropic"],
  ["perplexitybot", "Perplexity"],
  ["perplexity-user", "Perplexity-User"],
  ["google-extended", "Google-Extended"],
  ["googlebot", "Googlebot"],
  ["bingbot", "Bingbot"],
  ["applebot-extended", "Applebot-Extended"],
  ["applebot", "Applebot"],
  ["ccbot", "Common Crawl"],
  ["bytespider", "ByteDance"],
  ["amazonbot", "Amazon"],
  ["meta-externalagent", "Meta"],
  ["facebookexternalhit", "Meta"],
  ["cohere-ai", "Cohere"],
  ["diffbot", "Diffbot"],
  ["youbot", "You.com"],
  ["duckassistbot", "DuckDuckGo"],
];

// Surfaces built for agents. A hit here is worth logging even when the UA isn't
// one we recognize — an unknown agent pulling llms.txt is exactly the signal.
function isAgentSurface(path: string): boolean {
  return (
    path === "/llms.txt" ||
    path === "/feed.xml" ||
    path.endsWith(".md") ||
    path.startsWith("/api/md/") ||
    path.startsWith("/.well-known/")
  );
}

function identify(ua: string): string | null {
  const l = ua.toLowerCase();
  for (const [sig, name] of AGENT_UAS) if (l.includes(sig)) return name;
  return null;
}

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const path = req.nextUrl.pathname;
  const agent = identify(ua);
  const surface = isAgentSurface(path);

  if (agent || surface) {
    // One structured line, greppable in Vercel logs. A store or drain can
    // aggregate these later; nothing here blocks or slows the request.
    console.log(
      JSON.stringify({
        t: "agent-hit",
        agent: agent ?? "unknown",
        surface,
        path,
        ua: ua.slice(0, 200),
      }),
    );
  }

  return NextResponse.next();
}

export const config = {
  // Everything except static assets. Middleware runs before the cache, so this
  // still catches agents hitting statically-cached pages.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
