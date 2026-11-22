// One place to change the domain and identity. Everything reads from here.
// www is the canonical host: Vercel 308s the apex to it, so canonicals, sitemap <loc>s and feed
// links must say www or every declared canonical is a redirect.
export const SITE_URL = "https://www.timhey.co";
export const SITE_HOST = new URL(SITE_URL).host;

export const SITE = {
  name: "Tim Hey",
  title: "Tim Hey — field notes on selling to agents",
  description:
    "Field notes from inside a real agentic GTM function. Agent discovery, Agent Experience, and the shift from selling to humans to selling to machines.",
  author: "Tim Hey",
  role: "Sr. Director of Product, Agent Discovery",
  url: SITE_URL,
  // The source for this site. The GitHub icon links here; the site is its own
  // reference implementation, so the proof is one click from the header.
  repo: "https://github.com/TimHey/timhey.co",
  // Used for the Person JSON-LD. These identify the same person, so the GitHub
  // entry stays the profile (a repo is not "sameAs" the person).
  sameAs: [
    "https://www.linkedin.com/in/timothyhey",
    "https://x.com/_TimHey",
    "https://github.com/TimHey",
  ],
};

export function absolute(path: string): string {
  return new URL(path, SITE_URL).toString();
}
