import { publisherManifest } from "@/lib/ard";

// ARD (Agentic Resource Discovery) catalog, served at the well-known path the spec defines.
// Spec: https://agenticresourcediscovery.org/spec/ — the post "a-standard-is-not-adoption" is the
// worked example. The manifest itself is built in @/lib/ard so `npm run check:ard` validates the
// exact object this route serves against the official ai-catalog JSON Schema.
//
// Refresh hourly so newly-due posts join the catalog on their date, same as llms.txt.
export const revalidate = 3600;

export function GET() {
  return new Response(JSON.stringify(publisherManifest(), null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      // A catalog nobody can fetch cross-origin is a catalog nobody reads.
      "access-control-allow-origin": "*",
    },
  });
}
