import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: SITE.description,
  alternates: { canonical: "/about" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.author,
  jobTitle: SITE.role,
  url: SITE_URL,
  sameAs: SITE.sameAs,
  worksFor: { "@type": "Organization", name: "Zapier" },
};

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <h1>About</h1>
      <article>
        <p>The web was built to sell to humans. That era is ending.</p>
        <p>
          I lead agentic GTM at Zapier. My job: when an AI agent needs to
          connect to something, it picks Zapier. SEO, but the searcher is a vibe
          coder who just wants to connect their apps safely and smash the
          approve button. Increasingly that searcher is the agent acting for
          them.
        </p>
        <p>
          Most writing on this is theory or a vendor pitch. Mine is field notes
          from inside a real function. What we test, what works, what breaks.
        </p>
        <p>
          Day to day that is MCP servers, SDK distribution, agent-readable docs,
          llms.txt, and getting Zapier into every AI toolbox on earth. Before
          this, 12+ years in product, growth engines, programmatic SEO, and
          AI-powered products.
        </p>
        <p>
          Building in this space? Reach out on{" "}
          <a href={SITE.sameAs[0]}>LinkedIn</a> or{" "}
          <a href={SITE.sameAs[1]}>X</a>.
        </p>
      </article>
    </>
  );
}
