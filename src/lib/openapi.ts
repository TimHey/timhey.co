import { SITE, SITE_URL, absolute } from "@/lib/site";

// OpenAPI 3.1 description of everything an agent can pull from this site.
// Served at /openapi.json and linked from <head>, the footer, llms.txt, /agents,
// /.well-known/api-catalog and the ARD catalog. Shapes match src/lib/content-api.ts.

const postSummary = {
  type: "object",
  required: ["slug", "title", "date", "description", "tags", "url", "markdownUrl", "apiUrl"],
  properties: {
    slug: { type: "string", examples: ["a-link-is-the-whole-thing"] },
    title: { type: "string" },
    date: { type: "string", format: "date", description: "Publish date (UTC)." },
    description: { type: "string", description: "One or two sentences stating the post's finding." },
    tags: { type: "array", items: { type: "string" } },
    url: { type: "string", format: "uri", description: "Canonical HTML page." },
    markdownUrl: { type: "string", format: "uri", description: "Raw Markdown mirror." },
    apiUrl: { type: "string", format: "uri", description: "This post as JSON." },
  },
};

export function openapiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: `${SITE.name} content API`,
      version: "1.0.0",
      summary: "Read every post on timhey.co as JSON or Markdown. No auth, no key, no rate limit beyond reason.",
      description: [
        `Field notes by ${SITE.author} on how AI agents discover, read and pick products.`,
        "",
        "Fastest path for an agent: `GET /api/posts?include=markdown` returns every published post with its full Markdown body in one call.",
        "For one post, `GET /api/posts/{slug}` (JSON) or `GET /posts/{slug}.md` (raw Markdown).",
        "",
        "All endpoints are read-only, public, CORS-open, and cached for up to an hour. Only published posts are returned.",
      ].join("\n"),
      contact: { name: SITE.author, url: SITE_URL },
      license: { name: "Content © Tim Hey. Quote with a link." },
    },
    servers: [{ url: SITE_URL }],
    externalDocs: { description: "Site map for agents (llms.txt)", url: absolute("/llms.txt") },
    tags: [
      { name: "content", description: "Posts on this blog." },
      { name: "data", description: "Open data this site publishes about its own agent traffic." },
    ],
    paths: {
      "/api/posts": {
        get: {
          operationId: "listPosts",
          tags: ["content"],
          summary: "List published posts, newest first",
          description:
            "Returns metadata for every published post. Add `include=markdown` to get each full body inline, which is the whole blog in one request.",
          parameters: [
            {
              name: "include",
              in: "query",
              description: "Set to `markdown` to inline each post's full Markdown body.",
              schema: { type: "string", enum: ["markdown"] },
            },
            {
              name: "tag",
              in: "query",
              description: "Only posts with this tag, case-insensitive. Example: `measurement`.",
              schema: { type: "string" },
            },
            {
              name: "since",
              in: "query",
              description: "Only posts dated on or after this day.",
              schema: { type: "string", format: "date" },
            },
            {
              name: "limit",
              in: "query",
              description: "Maximum number of posts to return.",
              schema: { type: "integer", minimum: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Posts, newest first.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["site", "count", "posts"],
                    properties: {
                      site: { type: "string", format: "uri" },
                      count: { type: "integer" },
                      posts: {
                        type: "array",
                        items: {
                          oneOf: [
                            { $ref: "#/components/schemas/PostSummary" },
                            { $ref: "#/components/schemas/Post" },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { $ref: "#/components/responses/Error" },
          },
        },
      },
      "/api/posts/{slug}": {
        get: {
          operationId: "getPost",
          tags: ["content"],
          summary: "Get one post with its full Markdown body",
          parameters: [{ $ref: "#/components/parameters/slug" }],
          responses: {
            "200": {
              description: "The post.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } },
            },
            "404": { $ref: "#/components/responses/Error" },
          },
        },
      },
      "/posts/{slug}.md": {
        get: {
          operationId: "getPostMarkdown",
          tags: ["content"],
          summary: "Get one post as raw Markdown",
          description: "Opens with the title, a `Published:` date, the canonical URL and the description, then the body.",
          parameters: [{ $ref: "#/components/parameters/slug" }],
          responses: {
            "200": {
              description: "Raw Markdown.",
              content: { "text/markdown": { schema: { type: "string" } } },
            },
            "404": { description: "No published post with that slug." },
          },
        },
      },
      "/api/agent-traffic": {
        get: {
          operationId: "getAgentTraffic",
          tags: ["data"],
          summary: "Live counters of which AI agents and crawlers fetch this site",
          description:
            "Counted server-side before the cache. Per-agent totals, most-requested paths, a 14-day series, the recent feed, and the probe and tooling traffic filtered out of those numbers. Human-readable view at /agents.",
          responses: {
            "200": {
              description: "Current counters. Never cached.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["configured"],
                    properties: {
                      configured: { type: "boolean" },
                      totals: { $ref: "#/components/schemas/Counts", description: "Hits per agent, all time." },
                      paths: { $ref: "#/components/schemas/Counts", description: "Hits per path, all time." },
                      recent: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            agent: { type: "string" },
                            surface: { type: "boolean", description: "True if the path is an agent surface (llms.txt, .md, feed, well-known)." },
                            path: { type: "string" },
                            day: { type: "string", format: "date" },
                            ts: { type: "string", format: "date-time" },
                          },
                        },
                      },
                      byDay: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            day: { type: "string", format: "date" },
                            total: { type: "integer" },
                            agents: { $ref: "#/components/schemas/Counts" },
                          },
                        },
                      },
                      probes: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          byDay: { $ref: "#/components/schemas/Counts" },
                        },
                      },
                      tooling: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          byTool: { $ref: "#/components/schemas/Counts" },
                          byDay: { $ref: "#/components/schemas/Counts" },
                        },
                      },
                      unknownUas: { $ref: "#/components/schemas/Counts" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      parameters: {
        slug: {
          name: "slug",
          in: "path",
          required: true,
          description: "Post slug, from `listPosts`.",
          schema: { type: "string" },
        },
      },
      schemas: {
        PostSummary: postSummary,
        Post: {
          allOf: [
            { $ref: "#/components/schemas/PostSummary" },
            {
              type: "object",
              required: ["markdown"],
              properties: { markdown: { type: "string", description: "Full post body in Markdown, frontmatter removed." } },
            },
          ],
        },
        Counts: { type: "object", additionalProperties: { type: "integer" } },
        Error: {
          type: "object",
          required: ["error"],
          properties: { error: { type: "string" } },
        },
      },
      responses: {
        Error: {
          description: "Bad request or not found.",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  };
}
