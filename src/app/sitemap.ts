import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absolute } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/about"), changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({
      url: absolute(`/posts/${p.slug}`),
      lastModified: p.date ? new Date(p.date + "T00:00:00Z") : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
