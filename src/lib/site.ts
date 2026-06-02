// One place to change the domain and identity. Everything reads from here.
export const SITE_URL = "https://timhey.co";

export const SITE = {
  name: "Tim Hey",
  title: "Tim Hey — field notes on selling to agents",
  description:
    "Field notes from inside a real agentic GTM function. Agent discovery, Agent Experience, and the shift from selling to humans to selling to machines.",
  author: "Tim Hey",
  role: "Sr. Director, Agentic GTM at Zapier",
  url: SITE_URL,
  // Used for the Person JSON-LD. Add real profile URLs as they go live.
  sameAs: [
    "https://www.linkedin.com/in/timhey",
    "https://x.com/timhey",
  ],
};

export function absolute(path: string): string {
  return new URL(path, SITE_URL).toString();
}
