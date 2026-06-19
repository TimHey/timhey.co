import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPost } from "@/lib/posts";
import { SITE, absolute } from "@/lib/site";
import { graph, jsonLd, BLOG_ID, PERSON_ID } from "@/lib/schema";

// Rebuild hourly so a post goes live on its date without a manual deploy.
// Future-dated slugs are not pre-rendered; they generate on demand once due.
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/posts/${slug}`,
      // Point agents at the raw markdown mirror.
      types: { "text/markdown": absolute(`/posts/${slug}.md`) },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: absolute(`/posts/${slug}`),
      publishedTime: post.date,
      authors: [SITE.author],
    },
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = absolute(`/posts/${slug}`);
  const articleNode = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url,
    inLanguage: "en-US",
    keywords: post.tags.join(", "),
    articleSection: post.tags[0],
    isPartOf: { "@id": BLOG_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbNode = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Writing", item: SITE.url },
      { "@type": "ListItem", position: 2, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(graph(articleNode, breadcrumbNode)) }}
      />
      <article>
        <h1>{post.title}</h1>
        <time className="meta" dateTime={post.date}>
          {formatDate(post.date)} ·{" "}
          <a href={`/posts/${slug}.md`}>read as markdown</a>
        </time>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </>
  );
}
