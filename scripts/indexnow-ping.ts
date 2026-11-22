/**
 * Ping IndexNow by hand.
 *
 *   node --experimental-strip-types scripts/indexnow-ping.ts <url-or-path> [...]
 *   node --experimental-strip-types scripts/indexnow-ping.ts --sitemap   # every <loc> in the live sitemap
 *
 * Paths ("/posts/foo") resolve against SITE_URL. The daily cron covers new posts; this is for
 * everything else (a big edit, a new page, the first submission after setting up the key).
 */
import { pingIndexNow } from "../src/lib/indexnow.ts";
import { absolute } from "../src/lib/site.ts";

const args = process.argv.slice(2);
const urls: string[] = [];

for (const a of args) {
  if (a === "--sitemap") {
    const res = await fetch(absolute("/sitemap.xml"));
    const xml = await res.text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));
  } else {
    urls.push(a.startsWith("http") ? a : absolute(a));
  }
}

if (urls.length === 0) {
  console.error("usage: indexnow-ping.ts <url-or-path> [...] | --sitemap");
  process.exit(1);
}

const result = await pingIndexNow(urls);
console.log(JSON.stringify(result));
for (const u of [...new Set(urls)]) console.log(`  ${u}`);
process.exit(result.ok ? 0 : 1);
