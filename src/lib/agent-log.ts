// Durable agent-traffic counters in Upstash Redis, spoken over its REST API so
// there's no SDK dependency and it runs from Edge middleware. Every write is
// best-effort: with no store configured, all functions no-op, so the site
// behaves identically with or without it (same pattern as the analytics tag).

// The Vercel Upstash integration sets one of these name pairs depending on
// version; accept either so the code doesn't care which was provisioned.
const REST_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export function storeConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

type Cmd = (string | number)[];

async function pipeline(cmds: Cmd[]): Promise<unknown[] | null> {
  if (!REST_URL || !REST_TOKEN || cmds.length === 0) return null;
  try {
    const res = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cmds),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result?: unknown }[];
    return out.map((o) => o.result ?? null);
  } catch {
    // Never let a logging failure surface to a visitor.
    return null;
  }
}

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Upstash returns HGETALL as a flat [field, value, field, value] array.
function hashToCounts(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (Array.isArray(v)) {
    for (let i = 0; i + 1 < v.length; i += 2) {
      out[String(v[i])] = Number(v[i + 1]);
    }
  } else if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = Number(val);
    }
  }
  return out;
}

export interface Hit {
  agent: string;
  surface: boolean;
  path: string;
}

const DAY_TTL = 60 * 60 * 24 * 120; // keep per-day hashes ~120 days

export async function record(hit: Hit): Promise<void> {
  if (!storeConfigured()) return;
  const day = utcDay(new Date());
  const entry = JSON.stringify({ ...hit, day });
  await pipeline([
    ["HINCRBY", "agents:totals", hit.agent, 1],
    ["HINCRBY", `agents:day:${day}`, hit.agent, 1],
    ["EXPIRE", `agents:day:${day}`, DAY_TTL],
    ["HINCRBY", "agents:paths", hit.path, 1],
    ["LPUSH", "agents:recent", entry],
    ["LTRIM", "agents:recent", 0, 199],
  ]);
}

export interface DayStat {
  day: string;
  total: number;
  agents: Record<string, number>;
}

export interface Stats {
  totals: Record<string, number>;
  paths: Record<string, number>;
  recent: (Hit & { day: string })[];
  byDay: DayStat[];
}

export async function readStats(days = 14): Promise<Stats | null> {
  if (!storeConfigured()) return null;
  const now = new Date();
  const dayKeys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    dayKeys.push(utcDay(d));
  }

  const res = await pipeline([
    ["HGETALL", "agents:totals"],
    ["HGETALL", "agents:paths"],
    ["LRANGE", "agents:recent", 0, 49],
    ...dayKeys.map((k) => ["HGETALL", `agents:day:${k}`] as Cmd),
  ]);
  if (!res) return null;

  const totals = hashToCounts(res[0]);
  const paths = hashToCounts(res[1]);
  const recent = (Array.isArray(res[2]) ? (res[2] as string[]) : [])
    .map((s) => {
      try {
        return JSON.parse(s) as Hit & { day: string };
      } catch {
        return null;
      }
    })
    .filter((x): x is Hit & { day: string } => x !== null);
  const byDay: DayStat[] = dayKeys.map((day, i) => {
    const agents = hashToCounts(res[3 + i]);
    const total = Object.values(agents).reduce((a, b) => a + b, 0);
    return { day, total, agents };
  });

  return { totals, paths, recent, byDay };
}
