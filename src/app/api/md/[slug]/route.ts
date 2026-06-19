import { getAllSlugs, getPost } from "@/lib/posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Generate future-dated mirrors on demand once due, and refresh hourly so the
// markdown mirror goes live on the same date as its post.
export const dynamicParams = true;
export const revalidate = 3600;

// Raw markdown mirror, reached via the /posts/<slug>.md rewrite.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return new Response("Not found\n", { status: 404 });
  }
  const body = `# ${post.title}\n\n> ${post.description}\n\n${post.markdown}\n`;
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
