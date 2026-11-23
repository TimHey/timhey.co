import type { Post } from "@/lib/posts";
import { absolute } from "@/lib/site";

// Shapes served by the JSON content API (/api/posts). Kept in one place so the
// routes and the OpenAPI spec in src/lib/openapi.ts describe the same object.

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  url: string;
  markdownUrl: string;
  apiUrl: string;
};

export type PostFull = PostSummary & { markdown: string };

export function summarize(p: Post): PostSummary {
  return {
    slug: p.slug,
    title: p.title,
    date: p.date,
    description: p.description,
    tags: p.tags,
    url: absolute(`/posts/${p.slug}`),
    markdownUrl: absolute(`/posts/${p.slug}.md`),
    apiUrl: absolute(`/api/posts/${p.slug}`),
  };
}

export function full(p: Post): PostFull {
  return { ...summarize(p), markdown: p.markdown };
}

export const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=3600",
  "access-control-allow-origin": "*",
};
