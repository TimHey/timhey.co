import { getAllPosts } from "@/lib/posts";
import { SITE, absolute } from "@/lib/site";

// Refresh hourly so newly-due posts join the map on their date.
export const revalidate = 3600;

// Tag every link with ?via=llms. When an agent reads this map and hands one of these links to a
// person, the visit is deterministically traceable to this surface — so if they convert (subscribe),
// Pickrate attributes it as Confirmed. See src/components/Subscribe.tsx + /api/subscribe.
function via(path: string): string {
  const url = absolute(path);
  return url + (url.includes("?") ? "&" : "?") + "via=llms";
}

// llms.txt: a map of this site for agents. Every post links to its raw .md mirror.
export function GET() {
  const posts = getAllPosts();
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(`${SITE.author}, ${SITE.role} at Zapier.`);
  lines.push("");
  lines.push("## Writing");
  lines.push("");
  for (const p of posts) {
    lines.push(`- [${p.title}](${via(`/posts/${p.slug}.md`)}): ${p.description}`);
  }
  lines.push("");
  lines.push("## More");
  lines.push("");
  lines.push(`- [Resume](${via("/resume")}): career history, roles, and competencies.`);
  lines.push(`- [What agents read](${via("/agents")}): a human-readable index of every machine-readable file this site serves.`);
  lines.push(`- [ai-catalog.json](${via("/.well-known/ai-catalog.json")}): ARD capability catalog for this site.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
