---
title: "Your analytics can't see the agents reading you"
date: "2026-08-20"
description: "GA4 fires on JavaScript. Agents don't run it. So the readers this blog is written for show up as zero, unless you log them before the cache. Here is the instrument, running on this site."
tags: ["agent discovery", "measurement", "agent experience"]
---

I put Google Analytics on this blog last month. It works. It also cannot see the readers this blog is written for.

GA4 fires when a browser runs its JavaScript. Agents and crawlers do not run JavaScript. ClaudeBot, GPTBot, PerplexityBot, Google-Extended: they fetch your pages, read the text, and leave, and not one of them executes the tag. So the audience I actually care about, the agents deciding whether to recommend a tool, shows up as zero in the dashboard. I wrote before that [an agent reads your page as text](/posts/what-an-agent-reads) and most of the render is gone. The same blind spot applies to measurement. The tool that counts your humans is structurally incapable of counting your agents.

A while back I argued that [your GitHub repo already logs agent interest](/posts/github-agent-traffic), and I closed it like this: your repo gives you signal, your own site gives you proof. This is the proof. Here is how I wired it.

**The one place you can see them.** A crawler hitting a statically cached page never touches your server code. The CDN answers from cache, so your origin logs never record the hit, and the client-side tag never runs. Middleware is the exception. It runs on every request, before the cache decides anything. That makes it the only layer that sees both a crawl of a cached page and an agent pulling your raw markdown. If you want to watch agents, you watch from there.

**What it logs.** For every request, match the user-agent against a list of known agents, and flag any hit to a surface built for them: `llms.txt`, the `.md` post mirrors, the feed. About a hundred lines, no dependency, writing counters to a free Redis. That is the entire instrument.

**Read the paths, not just the count.** The number that matters is not how often an agent visited. It is what it asked for. If agents are pulling your `/llms.txt` and your `/posts/*.md` mirrors, the machine-readable surface you built is doing its job. If every agent hit is the HTML homepage and nothing else, those files are not being found. It is the same paths read I used on GitHub, except now the property is one I control and the user-agent is attached instead of inferred.

This post is the worked example. It runs on this site right now. [/agents](/agents) shows which agents have crawled it, which paths they pulled, and the last two weeks of volume. `curl` [/api/agent-traffic](/api/agent-traffic) for the raw JSON. It took an afternoon and a database that costs nothing.

The honest limit: user-agents lie. Anyone can send `ClaudeBot` as their UA, and some traffic forges exactly that. Treat the counts as a floor and a shape, not a census. If you need certainty, verify hits against the crawler IP ranges the big labs publish. But for the only question this has to answer, are agents finding the surfaces I built for them, the user-agent is enough to watch the pattern move.

**My read:** keep the tag for your humans, but do not mistake it for coverage. The agents are a second audience, reading the same pages in a different way, and they are invisible in every human-analytics product by design. It is an afternoon of middleware to make them visible. Until you spend it, you are optimizing for agents with the one meter that cannot count them.

---

**Related**

- [Your GitHub repo already logs agent interest. Read it.](/posts/github-agent-traffic). The inference version. This is the proof version.
- [An agent reads your page as text. Most of it is gone.](/posts/what-an-agent-reads). Why JavaScript hides you from both readers.
