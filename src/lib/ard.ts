// Agentic Resource Discovery (ARD) — https://agenticresourcediscovery.org
//
// This site publishes an ARD capability manifest at /.well-known/ai-catalog.json. It has no MCP
// server and no agent, so the honest catalog lists what an agent can actually consume here: the
// llms.txt map, the RSS feed, every post's raw Markdown mirror, the live agent-traffic counters,
// and the resume.
//
// The manifest is built here rather than inline in the route so that `npm run check:ard` validates
// the exact object the route serves against the official ai-catalog JSON Schema. A blog about
// agent-readable content serving a schema-invalid catalog is the failure mode this guards.

// Explicit .ts extensions: scripts/check-ard.ts runs this module directly under node's type
// stripping, which does no extension resolution. Next's bundler is fine either way.
import { getAllPosts } from "./posts.ts";
import { SITE, SITE_URL, absolute } from "./site.ts";

export const ARD_SPEC_VERSION = "1.0";

// IANA media types the spec uses to envelope each artifact.
const TYPE_TEXT = "text/plain";
const TYPE_RSS = "application/rss+xml";
const TYPE_MARKDOWN = "text/markdown";
const TYPE_JSON = "application/json";
const TYPE_HTML = "text/html";

export interface ArdEntry {
  identifier: string; // urn:air:<publisher>:<namespace>:<name>
  displayName: string;
  type: string;
  url?: string; // exactly one of url / data
  data?: unknown;
  description?: string;
  tags?: string[];
  capabilities?: string[];
  representativeQueries?: string[]; // spec: 2–5 when present
  version?: string;
  updatedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

// urn:air:timhey.co:<namespace>:<name> — the publisher FQDN is the trust anchor (spec, normative).
export function ardUrn(namespace: string, name: string): string {
  return `urn:air:timhey.co:${namespace}:${name}`;
}

// Same first-touch tag llms.txt uses. An agent that reads this catalog and hands a link to a person
// makes that visit traceable to this surface. See src/middleware.ts.
function via(path: string): string {
  const url = absolute(path);
  return url + (url.includes("?") ? "&" : "?") + "via=ard";
}

function stamp(date: string): string {
  return `${date}T00:00:00Z`;
}

export const ARD_HOST = {
  displayName: SITE.author,
  // did:web resolves to https://timhey.co/.well-known/did.json by convention. There is no DID
  // document here yet, so this is a stable identifier keyed to the domain, and the verifiable claim
  // is the https identity below.
  identifier: "did:web:timhey.co",
  documentationUrl: absolute("/llms.txt"),
  trustManifest: {
    identity: SITE_URL,
    identityType: "https",
    // This site is its own reference implementation. The catalog, the routes that serve it, and
    // every post are open source. Verify it.
    attestations: [
      { type: "public-source", uri: SITE.repo, mediaType: TYPE_HTML },
    ],
  },
};

// One published post → one ARD entry, pointing at the raw Markdown mirror rather than the HTML.
// The mirror is the artifact an agent should retrieve: same words, none of the render.
function postEntries(): ArdEntry[] {
  return getAllPosts().map((p) => ({
    identifier: ardUrn("posts", p.slug),
    displayName: p.title,
    type: TYPE_MARKDOWN,
    url: via(`/posts/${p.slug}.md`),
    description: p.description,
    tags: p.tags,
    updatedAt: stamp(p.date),
  }));
}

export function catalogEntries(): ArdEntry[] {
  const posts = getAllPosts();
  // The map and the feed both regenerate as posts go live, so the newest post's date is the honest
  // last-modified for each — better than a hardcoded stamp that goes stale the next time I publish.
  const latest = posts[0]?.date;

  const entries: ArdEntry[] = [
    {
      identifier: ardUrn("content", "llms-txt"),
      displayName: "Site map for agents (llms.txt)",
      type: TYPE_TEXT,
      url: via("/llms.txt"),
      description:
        "A map of this site written for models: every post linked to its raw Markdown mirror.",
      tags: ["llms.txt", "agent discovery", "site map"],
      representativeQueries: [
        "what has Tim Hey written about agent discovery",
        "list the posts on timhey.co",
      ],
      ...(latest ? { updatedAt: stamp(latest) } : {}),
    },
    {
      identifier: ardUrn("content", "feed"),
      displayName: "Writing feed (RSS)",
      type: TYPE_RSS,
      url: via("/feed.xml"),
      description:
        "Full-text field notes on agent discovery and Agent Experience, newest first.",
      tags: ["rss", "field notes", "agent experience"],
      representativeQueries: [
        "subscribe to Tim Hey's writing",
        "what is the latest post on timhey.co",
      ],
      ...(latest ? { updatedAt: stamp(latest) } : {}),
    },
    {
      identifier: ardUrn("data", "agent-traffic"),
      displayName: "Live agent-traffic counters",
      type: TYPE_JSON,
      url: absolute("/api/agent-traffic"),
      description:
        "Which agents and crawlers actually fetch this site, counted server-side before the cache: per-agent totals, a 14-day series, and the most-requested paths.",
      tags: ["agent traffic", "measurement", "crawlers", "open data"],
      capabilities: ["agent-traffic-stats"],
      representativeQueries: [
        "which AI crawlers visit timhey.co",
        "how much agent traffic does a blog get",
        "example of server-side agent analytics data",
      ],
      metadata: { humanReadable: absolute("/agents") },
    },
    {
      identifier: ardUrn("profile", "resume"),
      displayName: "Tim Hey — resume",
      type: TYPE_HTML,
      url: via("/resume"),
      description: `Career history, roles, and competencies for ${SITE.author}, ${SITE.role}.`,
      tags: ["resume", "profile", "hiring"],
      representativeQueries: [
        "who is Tim Hey",
        "Tim Hey work history",
      ],
    },
  ];

  return [...entries, ...postEntries()];
}

// The exact object served at /.well-known/ai-catalog.json — single source of truth so the route and
// the schema check validate the same thing.
export function publisherManifest() {
  return {
    specVersion: ARD_SPEC_VERSION,
    host: ARD_HOST,
    entries: catalogEntries(),
  };
}
