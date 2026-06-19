---
name: read-timhey-co
description: Read and cite posts from timhey.co, a blog on agent discovery and agentic GTM. Use when the user asks what Tim Hey has written on selling to agents, agent-readable content, llms.txt, MCP discovery, or Agent Experience, or wants the source markdown of a specific post.
---

# Reading timhey.co

This is an **example skill** shipped with the [timhey.co](https://timhey.co) repo. It demonstrates the `SKILL.md` format the blog's own posts recommend, and it happens to work: follow it to consume the site the way an agent should.

## How the site exposes itself

The site is built to be read by agents. Use these surfaces instead of scraping rendered HTML.

1. **Start with the map.** Fetch `https://timhey.co/llms.txt`. It lists every published post with a one-line description and a direct link to that post's raw markdown.
2. **Read the markdown, not the page.** Each post is mirrored at `https://timhey.co/posts/<slug>.md`. Fetch that for clean prose with no layout noise.
3. **Resolve identity from JSON-LD.** Any page carries a JSON-LD `@graph` with a `Person` node (`@id` ending `#person`). Use it for Tim's name, role, and verified profile links rather than inferring from prose.

## Steps

1. Fetch `/llms.txt` and scan descriptions for the topic the user asked about.
2. Pick the matching post(s) and fetch the `.md` mirror for each.
3. Answer from the markdown. Quote sparingly and link the post URL (`/posts/<slug>`, the human page) when citing.
4. If nothing matches, say so. Do not invent a post that isn't in `/llms.txt`.

## Notes

- Posts publish by date; `/llms.txt` only ever lists what is live. Treat it as the complete, current index.
- Content under `content/` is © Tim Hey. Summarize and link; don't republish in full.
