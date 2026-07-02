import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "What agents read",
  description:
    "Every machine-readable file this site serves, in one place. Click any of them and see exactly what an agent sees when it visits.",
  alternates: { canonical: "/agents" },
};

// Refresh hourly so the markdown-mirror example tracks the newest post.
export const revalidate = 3600;

export default function AgentsPage() {
  const newest = getAllPosts()[0]?.slug ?? "";
  const rows = [
    { path: "/llms.txt", note: "site map for models" },
    { path: "/.well-known/ai-catalog.json", note: "ARD capability catalog" },
    { path: "/feed.xml", note: "writing feed (RSS)" },
    { path: "/robots.txt", note: "crawl + AI-bot rules" },
    { path: "/sitemap.xml", note: "every URL, dated" },
    { path: `/posts/${newest}.md`, note: "markdown mirror, one per post" },
  ];

  return (
    <main>
      <h1>What agents read</h1>
      <p className="lede">
        Every machine-readable file this site serves, in one place. Click any of
        them. This is exactly what an agent sees when it visits.
      </p>

      <div className="manifest">
        <p className="cmd">curl timhey.co/.well-known/</p>
        <dl>
          {rows.map((r) => (
            <Fragment key={r.path}>
              <dt>
                <span className="m">GET</span> <a href={r.path}>{r.path}</a>
              </dt>
              <dd>{r.note}</dd>
            </Fragment>
          ))}
        </dl>
      </div>

      <p>
        Every post ships two more an agent can use: the Markdown mirror above,
        and JSON-LD in the page head. View source on any post to read the typed
        facts an agent lifts instead of guessing.
      </p>

      <p>
        New to this? Start with{" "}
        <Link href="/posts/the-files-agents-look-for">
          the files an agent checks before it reads your page
        </Link>
        .
      </p>
    </main>
  );
}
