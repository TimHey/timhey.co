# CLAUDE.md

Instructions for Claude Code working in this repository.

The full project guidance lives in [`AGENTS.md`](./AGENTS.md) — read it first. It covers setup, commands, structure, and conventions. This file adds Claude-specific notes and the short version.

## TL;DR

- Next.js 15 (App Router) blog. Content is markdown in `content/posts/`. No database, no tests.
- Verify any change with `npm run build` (must compile and type-check clean) plus a manual check of the affected route in `npm run dev`.
- Identity (name, role, URL, links) is centralized in `src/lib/site.ts`. Change it there, nowhere else.
- This blog is *about* agent-readable content, so keeping `llms.txt`, the `/posts/<slug>.md` mirrors, and the JSON-LD correct is the core requirement, not polish.

## Working here

- **`drafts/` is gitignored and private.** Never stage or commit it. Don't quote unpublished drafts in commit messages or PRs.
- **Posts publish by date.** Future-dated posts are hidden until their `date` (UTC). Use `SHOW_DRAFTS=1 npm run dev` to preview the queue.
- **Prefer the dedicated tools** (Read, Edit, Grep) over shelling out to `cat`/`sed`.
- **Commit and push only when asked.** This repo is public; deploys go to a live site.

## Editing post prose

Post content is Tim's writing. When asked to draft or edit prose for a post, match the existing voice in `content/posts/` — short sentences, takeaway first, no filler. Don't restructure a published post without being asked.
