// One connected entity graph for the whole site.
// Every page emits a @graph that includes the shared WebSite and Person nodes
// (so each page is self-describing) plus its own page-specific node(s).
// Cross-references use @id anchors, so an agent resolves one identity everywhere.
import { SITE, SITE_URL } from "./site";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BLOG_ID = `${SITE_URL}/#blog`;

// The canonical person. Defined once, referenced by @id from every page.
export const personNode = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.author,
  url: SITE_URL,
  jobTitle: "Sr. Director of Product, Agent Discovery",
  description:
    "Product leader with 15+ years in high-growth SaaS, contributing to two IPOs (Procore, GitLab), now leading Agentic GTM at Zapier.",
  email: "mailto:timothy.m.hey@gmail.com",
  worksFor: { "@type": "Organization", name: "Zapier", url: "https://zapier.com" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Keene State College" },
  knowsAbout: [
    "Agentic go-to-market",
    "Agent experience",
    "Generative engine optimization",
    "Agent discovery",
    "Product strategy",
    "SaaS growth",
    "Product-led growth",
    "Programmatic SEO",
  ],
  sameAs: SITE.sameAs,
};

export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE.name,
  description: SITE.description,
  inLanguage: "en-US",
  publisher: { "@id": PERSON_ID },
};

// Wrap page-specific nodes with the shared WebSite + Person nodes in one @graph.
export function graph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode, personNode, ...nodes],
  };
}

// Render helper: a ready-to-inject JSON-LD string.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data);
}
