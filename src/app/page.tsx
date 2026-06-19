import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SITE, SITE_URL, absolute } from "@/lib/site";
import { graph, jsonLd, BLOG_ID, WEBSITE_ID, PERSON_ID } from "@/lib/schema";

// Refresh hourly so a newly-due post appears in the listing on its date.
export const revalidate = 3600;

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function Home() {
  const posts = getAllPosts();
  const blogNode = {
    "@type": "Blog",
    "@id": BLOG_ID,
    url: SITE_URL,
    name: SITE.title,
    description: SITE.description,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      "@id": `${absolute(`/posts/${p.slug}`)}#article`,
      headline: p.title,
      url: absolute(`/posts/${p.slug}`),
      datePublished: p.date,
      description: p.description,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(graph(blogNode)) }}
      />
      <header className="index-intro">
        <h1>Field notes on selling to agents</h1>
        <p>The web was built to sell to humans. That era is ending.</p>
      </header>
      <ul className="posts">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link className="title" href={`/posts/${p.slug}`}>
              {p.title}
            </Link>
            <p className="desc">{p.description}</p>
            <p className="date">{formatDate(p.date)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
