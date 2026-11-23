import { openapiSpec } from "@/lib/openapi";

export const revalidate = 3600;

export function GET() {
  return new Response(JSON.stringify(openapiSpec(), null, 2), {
    headers: {
      "content-type": "application/openapi+json; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });
}
