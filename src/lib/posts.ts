import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  tags: string[];
};

export type Post = PostMeta & {
  markdown: string; // raw body, frontmatter stripped (for the .md mirror)
  html: string; // rendered body
};

function readSlug(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    description: String(data.description ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    markdown: content.trim(),
    html: marked.parse(content, { async: false }) as string,
  };
}

// A post is published once its date is on or before today (UTC). Future-dated
// posts stay hidden until their date, which is how the series stages itself.
// SHOW_DRAFTS=1 reveals the whole queue, for local preview.
const SHOW_ALL = process.env.SHOW_DRAFTS === "1";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPublished(date: string): boolean {
  return SHOW_ALL || (date !== "" && date <= todayISO());
}

function listSlugFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function getPost(slug: string): Post | null {
  const post = readSlug(slug);
  if (!post || !isPublished(post.date)) return null;
  return post;
}

export function getAllPosts(): Post[] {
  return listSlugFiles()
    .map(readSlug)
    .filter((p): p is Post => p !== null && isPublished(p.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
