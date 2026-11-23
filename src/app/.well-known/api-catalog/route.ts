import { absolute } from "@/lib/site";

export const revalidate = 3600;

// RFC 9727 API catalog: points API-discovery tools at the OpenAPI spec.
export function GET() {
  const body = {
    linkset: [
      {
        anchor: absolute("/api/posts"),
        "service-desc": [{ href: absolute("/openapi.json"), type: "application/openapi+json" }],
        "service-doc": [{ href: absolute("/llms.txt"), type: "text/plain" }],
      },
    ],
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });
}
