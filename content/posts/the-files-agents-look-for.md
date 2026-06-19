---
title: "The files an agent checks before it reads your page"
date: "2026-07-02"
description: "Agents probe a fixed set of well-known paths before they read a word. Serve them and you hand the agent your rules, your map, and your tools."
tags: ["agent discovery", "agent-readable", "llms.txt"]
---

Before an agent reads your page it probes a fixed set of files. robots.txt, llms.txt, a handful of `/.well-known` paths. Serve them and you hand the agent your rules, your content map, and your capabilities in formats it already understands. Serve none of them, which most sites do, and the agent guesses or leaves.

The gold standard for the checklist is Cloudflare's [isitagentready.com](https://isitagentready.com). It scans the homepage plus the well-known paths and scores you across four dimensions: discoverability, content, bot access control, and capabilities.

**Discoverability.** A `robots.txt` with explicit AI bot rules, not just legacy Googlebot directives. A current `sitemap.xml`. `Link` headers so an agent finds your resources without parsing HTML.

**Content.** An `llms.txt` map, and Markdown an agent can read instead of a rendered page.

**Bot access control.** Content signals that state what your content may be used for, search, inference, training. Honored voluntarily, the same way robots.txt is.

**Capabilities.** The `/.well-known` files that say what an agent can do with you, not just read: an MCP server card, OAuth discovery for protected resources, an API catalog. Serve the ones that match what you actually offer.

Then read your logs. They already record every agent that hit you, by user-agent and path. A 404 next to `/llms.txt` or a well-known path is a request you are failing to answer. That is your to-do list, written by the agents themselves.

One caution. Everything here exists to get agents to ingest your content as instructions, which is exactly the surface prompt injection rides in on. Treat agent-readable output as a security boundary, especially anywhere you mirror user-generated content.

**My read:** this layer is cheap, mostly empty, and measurable from your own logs. You do not need all of it on day one. Ship robots.txt and llms.txt, watch which paths agents ask for, and build the ones they keep 404ing.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [isitagentready.com](https://isitagentready.com). Cloudflare's agent-readiness scanner.
