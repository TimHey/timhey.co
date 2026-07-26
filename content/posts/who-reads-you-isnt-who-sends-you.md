---
title: "Who reads you isn't who sends you anyone"
date: "2026-09-03"
description: "I finally have both halves of the meter running on this blog: which agents read it, and which ones drive a signup. They are not the same agents. One crawler is three quarters of my readership and has never sent me a person."
tags: ["measurement", "agent discovery", "agent experience"]
---

I have been logging which agents read this blog for a while. Last week I wired up the other half: which agents actually send me a human who does something. Both halves running at once is the first time I have been able to compare them.

They disagree completely.

**The readers.** Of the reads I can attribute to a named agent, ByteDance is about three quarters of them. Not OpenAI. Not Anthropic. A crawler almost nobody writes optimization advice about. Behind it, in order, Googlebot, Bingbot, Anthropic's ClaudeBot, Amazon, Perplexity, and OpenAI's two bots tied at the bottom with one read each.

Read that last part again. The labs whose models everyone is trying to show up in accounted for around a dozen reads between them, in a window where the total was in the hundreds.

**The referrer.** In the same window, exactly one person subscribed to this blog after arriving from an AI assistant. The referrer was ChatGPT. OpenAI's crawlers had read this site a grand total of twice.

So the agent that drove the outcome barely reads me, and the agent that reads me constantly has never driven an outcome.

**Why that is less contradictory than it sounds.** These are two different mechanisms wearing the same word. A crawler fetches pages to build an index, on its own schedule, whether or not anyone asked about you. A referral happens when a model answers someone's question, names you, and that person clicks. The first is inventory. The second is retrieval plus a recommendation plus a human deciding you were worth the click.

Nothing says the same company has to be good at both, or that volume in one predicts anything in the other. OpenAI does not need to crawl me daily to recommend me; it needs to have read me once, or to have gotten me from somewhere else entirely. ByteDance can read every page I own and never surface me to a single person, because I am not in the product where that would happen.

**The surface I built for agents is the one they use.** The other number worth reporting: markdown mirrors were roughly two fifths of all reads. The `/posts/<slug>.md` version of every post, the thing that exists only because agents read text better than they read my layout, is being pulled almost as often as the HTML. Add `llms.txt`, `robots.txt`, the sitemap, and the well-known files and the machine-readable half of this site is doing real work. That was a guess when I built it. Now it is a measurement.

**What this does not support.** Two days is a shape, not a trend, and this is a personal blog, not a category. One crawler having a busy week can produce exactly this chart. User agents can be forged, so treat every name here as a claim rather than an identity. And about a quarter of my reads could not be attributed to any named agent at all, which is its own honest gap. I am reporting the shape because the shape was surprising, not because eight agents and one signup settle anything.

**My read:** stop treating "agent traffic" as one number. It is at least two populations that happen to share a label. The crawler that reads you the most is an indexing decision. The agent that sends you a person is a recommendation, and it is the one attached to an outcome. If you only measure reads, you will spend your time optimizing for whoever crawls hardest, and that turns out to be nobody's growth strategy. If you only measure referrals, you will not see the inventory being built that makes the referral possible later.

Measure both, and expect them to disagree. Mine did, immediately, on a sample of one signup.

---

**Related**

- [Your analytics can't see the agents reading you](/posts/analytics-cant-see-agents). How the read half of this meter works, and why middleware is the only place it can run.
- [An agent reads your page as text. Most of it is gone.](/posts/what-an-agent-reads). Why the markdown mirrors exist at all.
- [Most businesses don't need most of the agent files](/posts/which-agent-files-you-need). Which surfaces are worth serving before you go measure them.
