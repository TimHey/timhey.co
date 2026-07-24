// Who counts as an agent, and what counts as a real request.
//
// The traffic log is only useful if it means something. Two kinds of noise were
// drowning the signal: vulnerability scanners spraying /.env and PHP shells at
// every host on the internet, and agents following broken markdown links that
// leave punctuation glued to the URL. Both are handled here so the middleware
// and the maintenance scripts classify identically.

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

export function identify(ua: string): string | null {
  const l = ua.toLowerCase();
  for (const [sig, name] of AGENT_UAS) if (l.includes(sig)) return name;
  return null;
}

// Agents that lift a URL out of prose often bring the surrounding punctuation
// with it: "/posts/slug.md)" or "/resume):". Same page, so count it as one.
export function normalizePath(path: string): string {
  return path.replace(/[)\]},.:;"'>]+$/, "") || "/";
}

// Server tech this site does not and will never run. A request for it is a
// scanner working through a list, not something reading the site.
const PROBE_EXTENSIONS =
  /\.(php\d?|phtml|asp|aspx|axd|jsp|jspx|cgi|pl|cfm|do|action|sql|bak|old|swp|env)($|[/?])/i;

// Private keys, certs, and SSH material.
const PROBE_KEYS =
  /(\.(key|pem|p12|pfx|jks|crt|ppk)($|[/?])|(^|\/)(id_[a-z0-9]+|private-?key|authorized_keys|known_hosts)($|\.|[/?]))/i;

// Config and credential files people accidentally deploy. The optional
// extension matters: scanners try /credentials, /credentials.json, and
// /credentials.yml in the same pass.
const PROBE_NAMES = new RegExp(
  "(^|/)(" +
    [
      "credentials?",
      "secrets?",
      "service-?account(key)?",
      "serviceaccount",
      "firebase-?(adminsdk|config|init)[^/]*",
      "web\\.config",
      "app-?settings",
      "app-?config",
      "runtime-?config",
      "docker-?compose",
      "values",
      "rclone\\.conf",
      "dump",
      "backup",
      "database",
      "settings",
      "config",
      "env",
      "sendgrid",
    ].join("|") +
    ")(\\.(json|js|ya?ml|env|txt|toml|ini|conf|xml|zip|tar\\.gz))?($|[/?])",
  "i",
);

// Admin panels, debug consoles, and framework internals from stacks this site
// doesn't use — the standard scanner checklist. Also the traversal prefixes
// (/@fs/, /__/) and monitoring endpoints, which are noise rather than readers.
const PROBE_PREFIXES = [
  "/wp-",
  "/wordpress",
  "/wp/",
  "/phpmyadmin",
  "/pma",
  "/actuator",
  "/telescope",
  "/_ignition",
  "/_profiler",
  "/_debugbar",
  "/__debug",
  "/__/",
  "/@fs/",
  "/cgi-bin/",
  "/vendor/",
  "/server-status",
  "/server-info",
  "/nginx_status",
  "/solr/",
  "/druid/",
  "/jenkins",
  "/console/",
  "/webui/",
  "/geoserver",
  "/graphql",
  "/v1/graphql",
  "/v2/graphql",
  "/api/graphql",
  "/health",
  "/healthz",
  "/api/health",
  "/ping",
];

/**
 * True when a path is a vulnerability scan rather than a read.
 *
 * The dotfile rule does most of the work: nothing under a dot-directory is
 * public here, with the deliberate exception of /.well-known/, which is where
 * real agent standards live and where new ones will show up.
 */
export function isProbe(path: string): boolean {
  const p = path.toLowerCase();

  if (PROBE_EXTENSIONS.test(p)) return true;
  if (PROBE_KEYS.test(p)) return true;
  if (PROBE_NAMES.test(p)) return true;
  if (PROBE_PREFIXES.some((pre) => p.startsWith(pre))) return true;

  // Any dot-segment (/.env, /.git/config, /.aws/credentials, /.claude.json)
  // outside of /.well-known/.
  if (!p.startsWith("/.well-known/") && /(^|\/)\./.test(p)) return true;

  // /.well-known/42, /.well-known/w — placeholder names from shell-drop kits.
  // Real well-known identifiers are words, not digits or single characters.
  if (p.startsWith("/.well-known/")) {
    const name = p.slice("/.well-known/".length).split("/")[0].split("?")[0];
    if (name && (/^\d+$/.test(name) || name.replace(/\.\w+$/, "").length < 3)) {
      return true;
    }
  }

  return false;
}

// Surfaces built for agents. A hit here is worth logging even when the UA isn't
// one we recognize — an unknown agent pulling llms.txt is exactly the signal.
export function isAgentSurface(path: string): boolean {
  return (
    path === "/llms.txt" ||
    path === "/feed.xml" ||
    path.endsWith(".md") ||
    path.startsWith("/api/md/") ||
    path.startsWith("/.well-known/")
  );
}

export type Classification =
  | { kind: "probe"; path: string }
  | { kind: "agent"; path: string; agent: string; surface: boolean }
  | { kind: "ignore" };

/** Single decision point: probe, loggable agent hit, or nothing worth recording. */
export function classify(path: string, ua: string): Classification {
  const clean = normalizePath(path);
  if (isProbe(clean)) return { kind: "probe", path: clean };

  const agent = identify(ua);
  const surface = isAgentSurface(clean);
  if (!agent && !surface) return { kind: "ignore" };

  return { kind: "agent", path: clean, agent: agent ?? "unknown", surface };
}
