# AGENTS.md

Guidance for AI coding agents working in this repository. This is a personal blog whose subject is agent-readable content, so the codebase practices what it preaches: keep the agent-readable surfaces correct and the content honest.

## What this project is

A Next.js 15 (App Router) blog deployed on Vercel. Content is markdown files; there is no database or CMS. See `README.md` for the full feature map.

## Setup and commands

```bash
npm install
npm run dev                 # dev server at http://localhost:3000
SHOW_DRAFTS=1 npm run dev    # also renders future-dated (unpublished) posts
npm run build               # production build — run before declaring a change done
npm run lint                # eslint via next lint
```

There are no automated tests. Verify changes by running `npm run build` (it must compile and type-check clean) and by loading the affected route in `npm run dev`.

## Project structure

- `content/posts/<slug>.md` — the posts. Frontmatter (`title`, `date`, `description`, `tags`) plus a markdown body.
- `src/app/` — App Router routes, including the agent surfaces (`llms.txt`, `api/md/[slug]`, `robots.ts`, `sitemap.ts`, `feed.xml`).
- `src/lib/site.ts` — **single source of identity**. Name, role, URL, social links live here. Change them here, nowhere else.
- `src/lib/posts.ts` — reads, parses, and schedules posts.
- `src/lib/schema.ts` — the JSON-LD `@graph`.
- `next.config.ts` — the `/posts/<slug>.md` → `/api/md/<slug>` rewrite.
- `drafts/` — unpublished work. **Gitignored. Never commit it.**

## Conventions

- **Identity is centralized.** Anything about who Tim is or where the site lives comes from `src/lib/site.ts`. Do not hardcode the name, role, domain, or URLs elsewhere.
- **Posts publish by date.** A post is live when its `date` (ISO `yyyy-mm-dd`) is on or before today in UTC. Future dates stay hidden until they arrive. Don't add a separate "published" flag; the date is the mechanism.
- **Keep the surfaces in sync.** If you change how posts are listed, rendered, or named, check that `llms.txt`, the `.md` mirror, the sitemap, and the JSON-LD still reflect reality. These are the product, not an afterthought.
- **TypeScript stays strict and clean.** No `any` to dodge a type error; fix the type.
- **Match the surrounding style.** Comments are sparse and explain *why*, not *what*. Follow the existing tone in each file.

## Adding a post

1. Create `content/posts/<slug>.md` with the frontmatter shown in `README.md`.
2. Set `date` to the day it should go live (a future date schedules it).
3. Run `SHOW_DRAFTS=1 npm run dev` and open `/posts/<slug>` and `/posts/<slug>.md` to confirm both render.
4. Run `npm run build`.

## Don't

- Don't commit anything under `drafts/`.
- Don't add secrets, keys, or `.env` files. There are none in this repo and it should stay that way.
- Don't break the `.md` mirror or `llms.txt`. An agent-readable blog that isn't agent-readable defeats the purpose.
