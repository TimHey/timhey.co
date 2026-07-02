import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absolute } from "@/lib/site";

// Refresh hourly so newly-due posts join the sitemap on their date.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: absolute("/"), changeFrequency: "weekly", priority: 1 },
    { url: absolute("/agents"), changeFrequency: "monthly", priority: 0.7 },
    { url: absolute("/resume"), changeFrequency: "monthly", priority: 0.6 },
    ...posts.map((p) => ({
      url: absolute(`/posts/${p.slug}`),
      lastModified: p.date ? new Date(p.date + "T00:00:00Z") : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
