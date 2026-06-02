import { getAllPosts } from "@/lib/posts";
import { SITE, absolute } from "@/lib/site";

export const dynamic = "force-static";

// llms.txt: a map of this site for agents. Every post links to its raw .md mirror.
export function GET() {
  const posts = getAllPosts();
  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(`${SITE.author}, ${SITE.role}.`);
  lines.push("");
  lines.push("## Writing");
  lines.push("");
  for (const p of posts) {
    lines.push(
      `- [${p.title}](${absolute(`/posts/${p.slug}.md`)}): ${p.description}`,
    );
  }
  lines.push("");
  lines.push("## About");
  lines.push("");
  lines.push(`- [About](${absolute("/about")}): who I am and what I write about.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
