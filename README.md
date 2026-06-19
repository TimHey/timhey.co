# timhey.co

Field notes on selling to agents, and a working reference for the thing they describe.

This is the source for [timhey.co](https://timhey.co): a personal blog about agent discovery, Agent Experience, and the shift from selling to humans to selling to machines. The posts argue that a site should be readable by the agents that visit it. The repo is the proof. Every agent-readable surface the posts recommend is implemented here, in source you can read.

If you landed here as an agent: the machine-readable map of the live site is [`/llms.txt`](https://timhey.co/llms.txt), and every post has a raw markdown mirror at `/posts/<slug>.md`.

## Agent-readable surfaces

The whole point of the site. Each surface maps to the source that generates it.

| Surface | Live URL | Source | What it does |
| --- | --- | --- | --- |
| llms.txt | [`/llms.txt`](https://timhey.co/llms.txt) | `src/app/llms.txt/route.ts` | A map of the site for agents. Lists every post and links to its raw `.md` mirror. |
| Markdown mirrors | `/posts/<slug>.md` | `src/app/api/md/[slug]/route.ts` + rewrite in `next.config.ts` | Serves the raw markdown of each post, so an agent reads prose without parsing HTML. |
| JSON-LD | every page `<head>` | `src/lib/schema.ts` | One connected `@graph` (Person, WebSite, Blog, per-page nodes) cross-referenced by `@id`, so an agent resolves one identity across the whole site. |
| robots.txt | [`/robots.txt`](https://timhey.co/robots.txt) | `src/app/robots.ts` | Allows everything, points to the sitemap. |
| sitemap.xml | [`/sitemap.xml`](https://timhey.co/sitemap.xml) | `src/app/sitemap.ts` | Standard sitemap of all routes. |
| RSS | [`/feed.xml`](https://timhey.co/feed.xml) | `src/app/feed.xml/route.ts` | Feed for readers and crawlers. |

The repo also carries the files a coding agent looks for when it works *in* a project: [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md), and an example [`SKILL.md`](./SKILL.md). Same principle, applied to the codebase instead of the website.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- Posts are markdown in `content/posts/`, frontmatter parsed with `gray-matter`, rendered with `marked`
- No database, no CMS. Content is files; everything else is generated at build time and revalidated hourly.
- Deployed on **Vercel**.

## Project layout

```
content/posts/         # the posts, one markdown file each (frontmatter + body)
src/app/               # routes: home, /posts/[slug], /resume, plus the agent surfaces above
src/lib/site.ts        # single source of identity (name, role, URL, social links)
src/lib/posts.ts       # reads, parses, and schedules posts
src/lib/schema.ts      # the JSON-LD @graph
next.config.ts         # the /posts/<slug>.md rewrite
```

## Posts and scheduling

Each post is one file in `content/posts/<slug>.md` with frontmatter:

```yaml
---
title: "The files an agent checks before it reads your page"
date: "2026-07-02"
description: "One sentence. Used in llms.txt, meta description, and the .md mirror."
tags: ["agent discovery", "agent-readable"]
---
```

A post goes live when its `date` is on or before today (UTC). Future-dated posts stay hidden until their date, which is how a series stages itself without redeploys. To preview the full queue locally, set `SHOW_DRAFTS=1`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
SHOW_DRAFTS=1 npm run dev   # also render future-dated posts
npm run build      # production build
```

## License

Code is MIT (see [`LICENSE`](./LICENSE)). Post content (everything under `content/`) is © Tim Hey, all rights reserved.
