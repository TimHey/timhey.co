import { getAllPosts } from "@/lib/posts";
import { JSON_HEADERS, full, summarize } from "@/lib/content-api";
import { SITE_URL } from "@/lib/site";

// Query params make this per-request; the CDN still caches each URL for an hour.
export const dynamic = "force-dynamic";

// GET /api/posts: every published post, newest first.
//   ?tag=measurement   only posts with that tag (case-insensitive)
//   ?since=2026-09-01  only posts dated on or after that day
//   ?limit=5           cap the list
//   ?include=markdown  inline each post's full Markdown body (whole site in one call)
export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const tag = q.get("tag")?.toLowerCase();
  const since = q.get("since");
  const limitRaw = Number(q.get("limit"));
  const withBody = q.get("include") === "markdown";

  if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    return Response.json(
      { error: "since must be YYYY-MM-DD" },
      { status: 400, headers: JSON_HEADERS },
    );
  }

  let posts = getAllPosts();
  if (tag) posts = posts.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
  if (since) posts = posts.filter((p) => p.date >= since);
  if (Number.isInteger(limitRaw) && limitRaw > 0) posts = posts.slice(0, limitRaw);

  return Response.json(
    {
      site: SITE_URL,
      count: posts.length,
      posts: posts.map(withBody ? full : summarize),
    },
    { headers: JSON_HEADERS },
  );
}
