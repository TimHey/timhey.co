import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SITE, SITE_URL } from "@/lib/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.author,
  jobTitle: SITE.role,
  url: SITE_URL,
  sameAs: SITE.sameAs,
  worksFor: { "@type": "Organization", name: "Zapier" },
  knowsAbout: [
    "Agentic go-to-market",
    "Agent Experience",
    "Generative engine optimization",
    "Agent discovery",
  ],
};

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <h1>Selling to agents.</h1>
      <p className="lede">
        Field notes from inside a real agentic GTM function. What we test, what
        works, what breaks. Not theory. Not a vendor pitch.
      </p>
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
