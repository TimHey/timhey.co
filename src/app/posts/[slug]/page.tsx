import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPost } from "@/lib/posts";
import { SITE, absolute } from "@/lib/site";

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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: absolute(`/posts/${slug}`),
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: SITE.author,
      url: SITE.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absolute(`/posts/${slug}`),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Writing", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: absolute(`/posts/${slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
