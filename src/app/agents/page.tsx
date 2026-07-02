import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { getAllPosts } from "@/lib/posts";
import { readStats, type RecentHit } from "@/lib/agent-log";

export const metadata: Metadata = {
  title: "What agents read",
  description:
    "Every machine-readable file this site serves, plus a live count of which agents and crawlers actually visit it.",
  alternates: { canonical: "/agents" },
};

// Refresh every few minutes so the live crawler counts stay current (and the
// markdown-mirror example tracks the newest post).
export const revalidate = 300;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(day: string): string {
  const [, m, d] = day.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}

function feedTime(e: RecentHit): string {
  // "2026-07-02T14:32:10Z" -> "07-02 14:32"; fall back to the day for old rows.
  return e.ts ? e.ts.slice(5, 16).replace("T", " ") : e.day.slice(5);
}

export default async function AgentsPage() {
  const newest = getAllPosts()[0]?.slug ?? "";
  const rows = [
    { path: "/llms.txt", note: "site map for models" },
    { path: "/.well-known/ai-catalog.json", note: "ARD capability catalog" },
    { path: "/feed.xml", note: "writing feed (RSS)" },
    { path: "/robots.txt", note: "crawl + AI-bot rules" },
    { path: "/sitemap.xml", note: "every URL, dated" },
    { path: `/posts/${newest}.md`, note: "markdown mirror, one per post" },
  ];

  const stats = await readStats();
  const totals = stats
    ? Object.entries(stats.totals).sort((a, b) => b[1] - a[1])
    : [];
  const totalHits = totals.reduce((sum, [, n]) => sum + n, 0);
  const maxAgent = totals[0]?.[1] ?? 0;
  const paths = stats
    ? Object.entries(stats.paths).sort((a, b) => b[1] - a[1]).slice(0, 8)
    : [];
  const maxPath = paths[0]?.[1] ?? 0;
  const byDay = stats ? [...stats.byDay].reverse() : []; // oldest -> newest
  const maxDay = Math.max(1, ...byDay.map((d) => d.total));
  const recent = stats?.recent.slice(0, 12) ?? [];

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

      <section className="crawlers">
        <h2>Who&rsquo;s crawling this, live</h2>
        <p className="lede">
          This site logs its own agent readers. Crawlers and agents don&rsquo;t
          run JavaScript, so analytics never sees them &mdash; these counts come
          from the middleware, before the cache. It&rsquo;s the argument these
          posts make, measuring itself.
        </p>

        {totalHits === 0 ? (
          <p className="crawlers-empty">
            No agent visits recorded yet. They show up here the moment one
            arrives.
          </p>
        ) : (
          <>
            <p className="stat">
              <b>{totalHits.toLocaleString()}</b> agent visits from{" "}
              <b>{totals.length}</b> distinct{" "}
              {totals.length === 1 ? "agent" : "agents"}.
            </p>

            <h3>By agent</h3>
            <ul className="bars">
              {totals.map(([agent, n]) => (
                <li key={agent}>
                  <span className="who">{agent}</span>
                  <span className="track">
                    <span
                      className="fill"
                      style={{ width: `${maxAgent ? (n / maxAgent) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="n">{n.toLocaleString()}</span>
                </li>
              ))}
            </ul>

            {paths.length > 0 && (
              <>
                <h3>Most requested paths</h3>
                <ul className="bars mono">
                  {paths.map(([path, n]) => (
                    <li key={path}>
                      <span className="who" title={path}>{path}</span>
                      <span className="track">
                        <span
                          className="fill"
                          style={{ width: `${maxPath ? (n / maxPath) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="n">{n.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3>Volume</h3>
            <div className="spark" aria-hidden="true">
              {byDay.map((d) => (
                <span key={d.day} className="col" title={`${shortDate(d.day)}: ${d.total}`}>
                  <span style={{ height: `${(d.total / maxDay) * 100}%` }} />
                </span>
              ))}
            </div>
            <div className="spark-labels">
              <span>{byDay.length ? shortDate(byDay[0].day) : ""}</span>
              <span>last 14 days</span>
              <span>{byDay.length ? shortDate(byDay[byDay.length - 1].day) : ""}</span>
            </div>

            {recent.length > 0 && (
              <>
                <h3>Recent hits</h3>
                <ul className="feed">
                  {recent.map((e, i) => (
                    <li key={`${e.ts ?? e.day}-${i}`}>
                      <span className="fa">{e.agent}</span>
                      <span className="fp">{e.path}</span>
                      <span className="ft">{feedTime(e)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="crawlers-raw">
              Raw JSON: <a href="/api/agent-traffic">/api/agent-traffic</a>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
