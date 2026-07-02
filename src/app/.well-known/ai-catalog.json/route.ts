import { SITE, SITE_URL, absolute } from "@/lib/site";

// ARD (Agentic Resource Discovery) catalog, served at the well-known path the
// spec defines: /.well-known/ai-catalog.json. This site has no MCP server or
// agent, so the honest catalog lists the machine-readable resources an agent
// can actually use here, and keys trust to domain identity plus the public
// source repo. The post "a-standard-is-not-adoption" is the worked example.
// Spec: https://agenticresourcediscovery.org/spec/
export const revalidate = 3600;

export function GET() {
  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: SITE.author,
      identifier: "timhey.co",
      documentationUrl: absolute("/llms.txt"),
      trustManifest: {
        identity: SITE_URL,
        identityType: "domain",
        // This site is its own reference implementation. The catalog, the
        // routes that serve it, and every post are open source. Verify it.
        attestations: [
          {
            type: "public-source",
            uri: SITE.repo,
          },
        ],
      },
    },
    entries: [
      {
        identifier: "urn:air:timhey.co:content:llms-txt",
        displayName: "Site map for agents (llms.txt)",
        type: "text/plain",
        url: absolute("/llms.txt"),
        description:
          "A map of this site written for models: every post linked to its raw Markdown mirror.",
        tags: ["llms.txt", "agent discovery", "site map"],
        representativeQueries: [
          "what has Tim Hey written about agent discovery",
          "list the posts on timhey.co",
        ],
        updatedAt: "2026-07-02T00:00:00Z",
      },
      {
        identifier: "urn:air:timhey.co:content:feed",
        displayName: "Writing feed (RSS)",
        type: "application/rss+xml",
        url: absolute("/feed.xml"),
        description:
          "Full-text field notes on agent discovery and Agent Experience, newest first.",
        tags: ["rss", "field notes", "agent experience"],
        representativeQueries: [
          "subscribe to Tim Hey's writing",
          "what is the latest post on timhey.co",
        ],
        updatedAt: "2026-07-02T00:00:00Z",
      },
    ],
  };

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
