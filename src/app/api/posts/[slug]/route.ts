import { getAllSlugs, getPost } from "@/lib/posts";
import { JSON_HEADERS, full } from "@/lib/content-api";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Same schedule as the .md mirror: future posts appear on their date.
export const dynamicParams = true;
export const revalidate = 3600;

// GET /api/posts/{slug}: one post with its full Markdown body.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return Response.json(
      { error: "not found", slug },
      { status: 404, headers: JSON_HEADERS },
    );
  }
  return Response.json(full(post), { headers: JSON_HEADERS });
}
