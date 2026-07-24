/**
 * One-time maintenance: retire scanner noise from the agent-traffic log.
 *
 * The log ran for weeks before it could tell a reader from a vulnerability
 * scanner, so `agents:paths` accumulated a scanner wordlist and the counts
 * inherited it. This reclassifies the stored history using the same rules the
 * middleware now applies live, and folds punctuation-mangled duplicates
 * (/posts/slug.md): into /posts/slug.md) back together.
 *
 * Dry run:  node --experimental-strip-types scripts/clean-agent-log.ts
 * Apply:    node --experimental-strip-types scripts/clean-agent-log.ts --apply
 *
 * Needs KV_REST_API_URL and KV_REST_API_TOKEN in the environment.
 */
import { isProbe, normalizePath } from "../src/lib/agent-filter.ts";

const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!URL_ || !TOKEN) {
  console.error("Missing KV_REST_API_URL / KV_REST_API_TOKEN.");
  process.exit(1);
}

async function pipeline(cmds: (string | number)[][]): Promise<unknown[]> {
  if (cmds.length === 0) return [];
  const res = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cmds),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const bad = out.find((o) => o.error);
  if (bad) throw new Error(bad.error);
  return out.map((o) => o.result ?? null);
}

function hashToCounts(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(v)) {
    for (let i = 0; i + 1 < v.length; i += 2) out[String(v[i])] = Number(v[i + 1]);
  } else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = Number(val);
    }
  }
  return out;
}

const [pathsRaw, totalsRaw, recentRaw, probeTotalRaw] = await pipeline([
  ["HGETALL", "agents:paths"],
  ["HGETALL", "agents:totals"],
  ["LRANGE", "agents:recent", 0, -1],
  ["GET", "probes:total"],
]);

const paths = hashToCounts(pathsRaw);
const totals = hashToCounts(totalsRaw);
const recent = (Array.isArray(recentRaw) ? (recentRaw as string[]) : []).map(
  (s) => {
    try {
      return JSON.parse(s) as { agent: string; path: string; surface: boolean };
    } catch {
      return null;
    }
  },
);

// --- paths: split into probes, merges, and keepers -------------------------
const probeFields: [string, number][] = [];
const merges: [string, string, number][] = []; // from, to, count
for (const [field, n] of Object.entries(paths)) {
  const clean = normalizePath(field);
  if (isProbe(clean)) probeFields.push([field, n]);
  else if (clean !== field) merges.push([field, clean, n]);
}
const probeHits = probeFields.reduce((s, [, n]) => s + n, 0);

// --- totals: attribute the probe hits back to the agent buckets ------------
// The store keeps agent counts and path counts in separate hashes, so there's
// no exact join. The recent feed is the only place the two appear together —
// use it to estimate the split, and fall back to "unknown" for the remainder,
// which is where surface-shaped probes (/.well-known/*.php) landed.
const probeByAgent: Record<string, number> = {};
let probeSample = 0;
for (const e of recent) {
  if (e && isProbe(normalizePath(e.path))) {
    probeByAgent[e.agent] = (probeByAgent[e.agent] ?? 0) + 1;
    probeSample++;
  }
}
const totalsAdjust: Record<string, number> = {};
if (probeSample > 0) {
  let assigned = 0;
  for (const [agent, n] of Object.entries(probeByAgent)) {
    const share = Math.min(
      totals[agent] ?? 0,
      Math.round((n / probeSample) * probeHits),
    );
    if (share > 0) {
      totalsAdjust[agent] = share;
      assigned += share;
    }
  }
  const rest = probeHits - assigned;
  if (rest > 0) {
    totalsAdjust.unknown = Math.min(
      totals.unknown ?? 0,
      (totalsAdjust.unknown ?? 0) + rest,
    );
  }
} else {
  totalsAdjust.unknown = Math.min(totals.unknown ?? 0, probeHits);
}

// --- recent feed: drop probe entries, normalize the rest -------------------
const cleanRecent = (Array.isArray(recentRaw) ? (recentRaw as string[]) : [])
  .filter((s) => {
    try {
      const e = JSON.parse(s) as { path: string };
      return !isProbe(normalizePath(e.path));
    } catch {
      return false;
    }
  })
  .map((s) => {
    const e = JSON.parse(s) as { path: string };
    return JSON.stringify({ ...e, path: normalizePath(e.path) });
  });

// --- report ----------------------------------------------------------------
console.log(`paths tracked:        ${Object.keys(paths).length}`);
console.log(`  scanner probes:     ${probeFields.length} fields, ${probeHits} hits`);
console.log(`  punctuation merges: ${merges.length}`);
console.log(`recent feed:          ${recent.length} -> ${cleanRecent.length}`);
console.log(`probes:total now:     ${Number(probeTotalRaw ?? 0) || 0} -> ${(Number(probeTotalRaw ?? 0) || 0) + probeHits}`);
console.log("agent totals to decrement:");
for (const [a, n] of Object.entries(totalsAdjust).sort((x, y) => y[1] - x[1])) {
  console.log(`  ${a}: ${totals[a] ?? 0} -> ${(totals[a] ?? 0) - n}  (-${n})`);
}
console.log("\ntop probe paths dropped:");
for (const [p, n] of probeFields.sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${n}\t${p}`);
}
if (merges.length) {
  console.log("\nmerges:");
  for (const [from, to, n] of merges) console.log(`  ${n}\t${from} -> ${to}`);
}

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write.");
  process.exit(0);
}

// --- apply -----------------------------------------------------------------
const cmds: (string | number)[][] = [];
if (probeFields.length) {
  cmds.push(["HDEL", "agents:paths", ...probeFields.map(([f]) => f)]);
}
for (const [from, to, n] of merges) {
  cmds.push(["HDEL", "agents:paths", from]);
  cmds.push(["HINCRBY", "agents:paths", to, n]);
}
for (const [agent, n] of Object.entries(totalsAdjust)) {
  cmds.push(["HINCRBY", "agents:totals", agent, -n]);
}
if (probeHits) cmds.push(["INCRBY", "probes:total", probeHits]);
cmds.push(["DEL", "agents:recent"]);
if (cleanRecent.length) cmds.push(["RPUSH", "agents:recent", ...cleanRecent]);

await pipeline(cmds);
console.log(`\nApplied ${cmds.length} commands.`);
