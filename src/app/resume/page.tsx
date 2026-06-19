import type { Metadata } from "next";
import { SITE, SITE_URL } from "@/lib/site";
import { graph, jsonLd, WEBSITE_ID, PERSON_ID } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Tim Hey — product leader, 15+ years in high-growth SaaS, two IPOs (Procore, GitLab), now leading Agentic GTM at Zapier.",
  alternates: { canonical: "/resume" },
};

const CONTACT_EMAIL = "timothy.m.hey@gmail.com";

const competencies = [
  "Product Strategy",
  "SaaS Growth",
  "AI Product Experiences",
  "Product-Led Growth",
  "Marketplace Effects",
  "A/B Testing",
  "Team Building",
  "Customer-Centric Design",
  "SEO Strategy",
  "Product Operations",
];

type Job = {
  org: string;
  role: string;
  dates: string;
  summary?: string;
  groups: { label?: string; bullets: string[] }[];
};

const experience: Job[] = [
  {
    org: "Zapier",
    role: "Sr. Director of Product, Agent Discovery",
    dates: "2026 – Present · Remote",
    summary:
      "Leading Agent Discovery: making Zapier the default recommendation when an AI agent needs to connect one app to another.",
    groups: [
      {
        bullets: [
          "Reshaping integration pages, the SDK story, and developer-ecosystem presence so ChatGPT, Claude, Gemini, and Perplexity surface Zapier by default.",
          "Building the agent-readability layer across zapier.com: structured data, llms.txt, and machine-readable docs.",
          "Standing up measurement for a brand-new channel, from agent crawls through to downstream activation.",
        ],
      },
    ],
  },
  {
    org: "MaintainX",
    role: "Director of Product Management – AI & Intelligent Platform Strategy",
    dates: "Jun 2024 – Present · Remote",
    summary:
      "Leading MaintainX's company-wide AI strategy and building the foundation for its next stage of intelligent automation.",
    groups: [
      {
        bullets: [
          "Building and scaling the AI product team responsible for CoPilot, proactive maintenance agents, and intelligent data infrastructure.",
          "Shipping a suite of proactive maintenance agents that surface predictive insights, automate work order generation, and improve asset reliability.",
          "Evolving CoPilot into a unified global platform powering context-aware assistance and multi-agent orchestration across all user workflows.",
          "Rolling out enterprise-grade data access and search, establishing a foundation for knowledge retrieval, observability, and cross-system orchestration.",
          "Delivering measurable operational impact: reducing downtime, increasing asset visibility, and helping frontline maintenance teams run more efficiently.",
        ],
      },
    ],
  },
  {
    org: "Procore Technologies",
    role: "Head of Product Management – Procore Construction Network & AI Initiatives",
    dates: "Jan 2021 – Jun 2025 · Remote",
    summary:
      "Spearheaded Procore's expansion into network-driven growth and AI-powered product innovation, building both the Procore Construction Network (PCN) and the AI & Agent strategy for the Preconstruction business.",
    groups: [
      {
        label: "Procore Construction Network (PCN)",
        bullets: [
          "Delivered 30% YoY growth by deeply integrating PCN with Procore's Preconstruction solutions.",
          "Led the end-to-end roadmap, scaling from 0 to 340K+ profiles and from 26 to 755 searchable categories, expanding internationally, and launching self-serve onboarding.",
          "Designed activation and adoption strategies that converted free accounts to paying customers through high-quality profiles and optimized workflows.",
          "Built a cross-functional team culture focused on velocity, measurable outcomes, and customer impact.",
        ],
      },
      {
        label: "Key highlights",
        bullets: [
          "98%+ of paying customers now discoverable for bid invites.",
          "First bid awarded through PCN within 12 months of launch.",
          "Drove PCN's international expansion to Canada in 2024.",
          "Showcased PCN innovation at Procore's flagship Groundbreak event.",
        ],
      },
      {
        label: "AI & Agent strategy for Preconstruction",
        bullets: [
          "Architected the full vision, strategy, and operating model for Procore's AI and Agent initiatives within the Preconstruction product suite.",
          "Formed and led a large cross-functional team spanning product, engineering, design, and go-to-market.",
          "Built the foundational roadmap and product briefs, translating ambitious AI objectives into executable workstreams.",
        ],
      },
    ],
  },
  {
    org: "GitLab Inc.",
    role: "Principal Product Manager",
    dates: "Aug 2019 – Jan 2021 · Remote",
    summary:
      "Owned net revenue retention growth by driving expansion across GitLab's SaaS and Enterprise customer base.",
    groups: [
      {
        bullets: [
          "Engineered user-journey optimizations that grew product adoption 3x per customer across core and add-on modules.",
          "Built an agile experimentation framework, enabling 8 PMs to rapidly deploy A/B tests and data-driven growth experiments.",
          "Improved global navigation and contextual in-app experiences, accelerating time-to-value and expansion into higher-tier plans.",
          "Focused rigorously on Net Retention Rate, add-on expansion, seat growth, and tier upgrades.",
        ],
      },
    ],
  },
  {
    org: "Clearsurance",
    role: "Vice President of Product Management",
    dates: "Nov 2016 – Aug 2019 · Remote",
    summary:
      "Founded and scaled the Clearsurance platform into the leading user-generated content destination in the insurance space.",
    groups: [
      {
        bullets: [
          "Scaled site traffic from zero to 50,000+ monthly sessions, expanded content pages from 20 to over 140,000, and grew to 130,000+ authentic reviews across 550+ insurance providers.",
          "Defined and executed an SEO and content strategy, increasing domain authority and transitioning to higher-value keywords.",
          "Instrumental in raising a $4M Series A, supported by clear traction and customer-growth metrics.",
          "Established clear OKRs across product, growth marketing, content, and analytics teams.",
        ],
      },
    ],
  },
];

const additional = [
  {
    org: "Symphony Talent Group",
    role: "Director of Digital Marketing",
    dates: "2015 – 2017",
    bullets: [
      "Elevated site traffic by 200%, raised inbound leads, and increased e-commerce revenue by 31%.",
    ],
  },
  {
    org: "Customerville",
    role: "Director, Sales & Marketing",
    dates: "2014 – 2015",
    bullets: [
      "Catapulted top-line revenue by 14% in North America.",
      "Retained a strategic book of business through renewal cycles and lifted bookings by 5%.",
    ],
  },
  {
    org: "BFG Communications",
    role: "Director of Digital",
    dates: "2013 – 2014",
    bullets: [
      "Created a new sales channel enabling à la carte digital service purchases for non-agency clients.",
      "Drove a 30% increase in digital revenue.",
    ],
  },
  {
    org: "Hargray Communications Group",
    role: "Sr. Manager, Sales & Support Operations",
    dates: "2011 – 2013",
    bullets: [
      "Oversaw three sales teams, surpassing new revenue goals by 8% and reducing churn by 1.2%.",
      "Managed the customer interface during acquisition of 7,500+ subscribers, lifting monthly recurring revenue per converted customer by 8%.",
    ],
  },
];

const profilePageJsonLd = graph({
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/resume#profilepage`,
  url: `${SITE_URL}/resume`,
  name: "Tim Hey — Resume",
  inLanguage: "en-US",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": PERSON_ID },
});

export default function Resume() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(profilePageJsonLd) }}
      />
      <h1>Tim Hey</h1>
      <p className="lede">
        Product leader with 15+ years in high-growth SaaS. Two IPOs (Procore,
        GitLab). Now leading Agentic GTM at Zapier.
      </p>
      <p className="resume-contact">
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> ·{" "}
        <a href={SITE.sameAs[0]}>LinkedIn</a> ·{" "}
        <a href={SITE.sameAs[2]}>GitHub</a> · SC, USA
      </p>

      <section className="resume">
        <h2>Executive profile</h2>
        <p>
          Product leader with 15+ years in high-growth SaaS, including 10+ years
          leading cross-functional teams to deliver transformative business
          outcomes. Proven track record scaling platforms from inception to
          industry leadership, contributing to two successful IPOs (Procore,
          GitLab).
        </p>
        <p>
          Expertise in building high-velocity product organizations,
          customer-led growth, AI-powered experiences, and network-driven
          marketplaces. Recognized for products that unlock revenue expansion,
          deepen retention, and scale operationally.
        </p>

        <h2>Core competencies</h2>
        <ul className="tags">
          {competencies.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <h2>Experience</h2>
        {experience.map((job) => (
          <div className="job" key={job.org}>
            <div className="job-head">
              <h3>{job.org}</h3>
              <span className="job-dates">{job.dates}</span>
            </div>
            <p className="job-role">{job.role}</p>
            {job.summary && <p className="job-summary">{job.summary}</p>}
            {job.groups.map((g, i) => (
              <div key={i}>
                {g.label && <p className="job-grouplabel">{g.label}</p>}
                <ul>
                  {g.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <h2>Additional experience</h2>
        {additional.map((job) => (
          <div className="job compact" key={job.org}>
            <div className="job-head">
              <h3>
                {job.org} · {job.role}
              </h3>
              <span className="job-dates">{job.dates}</span>
            </div>
            <ul>
              {job.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Education</h2>
        <p>Business Management — Keene State College.</p>

        <h2>References</h2>
        <p>Available upon request.</p>
      </section>
    </>
  );
}
