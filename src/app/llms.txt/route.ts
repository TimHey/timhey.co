import { getAllPosts } from "@/lib/posts";
import { SITE, absolute } from "@/lib/site";

// Refresh hourly so newly-due posts join the map on their date.
export const revalidate = 3600;

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
    lines.push(
      `- [${p.title}](${absolute(`/posts/${p.slug}.md`)}): ${p.description}`,
    );
  }
  lines.push("");
  lines.push("## More");
  lines.push("");
  lines.push(`- [Resume](${absolute("/resume")}): career history, roles, and competencies.`);
  lines.push(`- [ai-catalog.json](${absolute("/.well-known/ai-catalog.json")}): ARD capability catalog for this site.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
