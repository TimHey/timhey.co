// Signed, self-contained links for confirm and unsubscribe.
//
// The alternative is storing a random token per subscriber and looking it up. This carries the
// email inside the link with an HMAC over it, so a link is verifiable with no read, can't be
// guessed, and can't be edited to target someone else's address. Unsubscribe especially has to
// work forever and on the first try, from a mail client, with no session.

const SECRET = process.env.NEWSLETTER_SECRET ?? "";

export function secretConfigured(): boolean {
  return SECRET.length >= 16;
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}

/** Constant-time compare, so a signature can't be recovered by timing the check. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * `purpose` scopes the signature: a confirm link can never be replayed as an
 * unsubscribe link, or the reverse.
 */
export async function sign(purpose: string, email: string): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify({ p: purpose, e: email, t: Date.now() })));
  return `${body}.${await hmac(`${purpose}:${body}`)}`;
}

export async function verify(
  purpose: string,
  token: string,
  maxAgeMs?: number,
): Promise<string | null> {
  if (!secretConfigured()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!safeEqual(sig, await hmac(`${purpose}:${body}`))) return null;
  try {
    const { p, e, t } = JSON.parse(new TextDecoder().decode(unb64url(body))) as {
      p?: string;
      e?: string;
      t?: number;
    };
    if (p !== purpose || typeof e !== "string" || typeof t !== "number") return null;
    if (maxAgeMs !== undefined && Date.now() - t > maxAgeMs) return null;
    return e;
  } catch {
    return null;
  }
}
