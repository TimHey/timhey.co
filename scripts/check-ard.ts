/**
 * Conformance gate for the ARD catalog.
 *
 * Validates the exact object served at /.well-known/ai-catalog.json against the official
 * ai-catalog JSON Schema (vendored at src/lib/ard.schema.json from github.com/ards-project/ard-spec).
 * This site argues in public that publishing a catalog is not the same as publishing a *valid* one,
 * so the catalog gets checked rather than eyeballed.
 *
 *   npm run check:ard              # validate the manifest this repo builds
 *   npm run check:ard -- --live    # also validate what the deployed site actually serves
 *
 * SHOW_DRAFTS=1 includes the unpublished queue, matching `npm run dev`.
 */
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { publisherManifest } from "../src/lib/ard.ts";
import { SITE_URL } from "../src/lib/site.ts";
import schema from "../src/lib/ard.schema.json" with { type: "json" };

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function check(label: string, doc: unknown): boolean {
  const ok = validate(doc);
  const entries = (doc as { entries?: unknown[] })?.entries?.length ?? 0;
  if (ok) {
    console.log(`✓ ${label} — conformant, ${entries} entries`);
    return true;
  }
  console.error(`✗ ${label} — schema violations:`);
  console.error(JSON.stringify(validate.errors, null, 2));
  return false;
}

let pass = check("local manifest", publisherManifest());

if (process.argv.includes("--live")) {
  const url = new URL("/.well-known/ai-catalog.json", SITE_URL).toString();
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      console.error(`✗ ${url} — HTTP ${res.status}`);
      pass = false;
    } else {
      pass = check(url, await res.json()) && pass;
    }
  } catch (e) {
    console.error(`✗ ${url} — ${(e as Error).message}`);
    pass = false;
  }
}

process.exit(pass ? 0 : 1);
