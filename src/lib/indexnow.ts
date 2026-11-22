// IndexNow: tell Bing (and every engine sharing the protocol) a URL changed, instead of waiting
// for a recrawl. Microsoft's answer engines read Bing's index, so this is how a new post gets there.
// The key is public by design: it's served at /<key>.txt to prove we own the host.
import { SITE_HOST, absolute } from "./site.ts";

export const INDEXNOW_KEY = "3c78a38803cd6bd51aa5f4d4e88a5e55";
const ENDPOINT = "https://api.indexnow.org/indexnow";

export interface PingResult {
  ok: boolean;
  status: number;
  count: number;
  error?: string;
}

/** POST a batch of URLs. Never throws: a failed ping is logged, not fatal. */
export async function pingIndexNow(urls: string[]): Promise<PingResult> {
  const urlList = [...new Set(urls)];
  if (urlList.length === 0) return { ok: true, status: 0, count: 0 };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: INDEXNOW_KEY,
        keyLocation: absolute(`/${INDEXNOW_KEY}.txt`),
        urlList,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    // 200 = accepted, 202 = accepted, key validation pending.
    const ok = res.status === 200 || res.status === 202;
    return {
      ok,
      status: res.status,
      count: urlList.length,
      error: ok ? undefined : (await res.text()).slice(0, 200),
    };
  } catch (e) {
    return { ok: false, status: 0, count: urlList.length, error: (e as Error).message };
  }
}

/** The URLs that change when a post goes live: the post, its .md mirror, and the surfaces listing it. */
export function postUrls(slug: string): string[] {
  return [absolute(`/posts/${slug}`), absolute(`/posts/${slug}.md`)];
}

export function surfaceUrls(): string[] {
  return ["/", "/feed.xml", "/sitemap.xml", "/llms.txt"].map((p) => absolute(p));
}
