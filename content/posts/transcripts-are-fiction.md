---
title: "The transcript is a story the agent tells about itself"
date: "2026-12-17"
description: "I compared what Claude and ChatGPT said they did on a test site with what the server log recorded. They disagreed far more often than they agreed, and every time they disagreed, the agent claimed more work than it did."
tags: ["measurement", "experiments", "agent experience"]
---

Here is what ChatGPT told me it did on my test site:

> I tried the usual sitemap/robots locations and several plausible hidden-page paths.

Here is everything the server log recorded from ChatGPT that round:

```
GET /
```

One request. Nothing else, ever.

That's the same test site from the last two posts, the one with [six hidden pages](/posts/a-link-is-the-whole-thing) and [two versions of every URL](/posts/your-markdown-is-behind-a-header). I ran it for one evening and kept every transcript next to the log. They disagreed far more often than they agreed. And the disagreement only ever ran one direction. The agent claimed more effort, more fetching, and more checking than happened.

**Effort it didn't spend.** The "plausible hidden-page paths" line is the cleanest example. ChatGPT described a search. The log shows a homepage visit.

**Fetches that never happened.** Three separate rounds produced zero HTTP requests while both agents described reading the pages. Fresh chats. A `Cache-Control` header asking for a 60-second limit. Neither mattered. They answered from copies stored somewhere upstream and narrated it as a live visit.

**Explanations it made up.** Late in the evening, Claude fetched one live file whose codes didn't match its cached copies of the same pages. The live file was right. The cache was stale. Here's how Claude explained the mismatch:

> the concatenated file looks like a deliberate trap for agents that take the cheap single request

There was no trap. Faced with a conflict between its memory and the actual site, it didn't doubt its memory. It invented a motive for the site.

**Claims about what it couldn't do.** ChatGPT said its fetcher "would not retrieve the `.md` URLs" and that the sitemap's XML "was unsupported." It never requested a `.md` URL, so "would not" was never tested. And it did fetch `/sitemap.xml`. The log shows it arriving.

**Details that aren't there.** This one is from last week, in my own session. I asked Claude Code to describe the markdown version of a test page. It got the page's code right, then said the file uses `#` headings, `---` horizontal rules, and `**` bold markers. The file is four lines. There's no `---` in it.

Low stakes, which is the point. It happens even when there's nothing to gain. Claude Code's fetch tool hands the page to a smaller model and asks it about the page, so there's a summarizer sitting between your content and the agent. Summarizers fill gaps.

**Why the codes mattered.** Every page carried a random code generated at boot. An agent can write a plausible summary of a page from its title. It can't produce a random string it never fetched.

Without the codes and the log, I'd have scored this evening wrong in both directions. The first round looked like agents ignoring `llms.txt`. It was a fetch tool restriction. The next three looked like failures. They were cache hits that never left the agent's infrastructure. The last looked like a clean success. It was one live request wrapped in hours-old data.

Every round would have been misread from the transcript alone.

**When the transcript was right.** Not all of it was fiction. The most useful finding of the whole experiment came from a transcript. Claude explained, unprompted, that its fetch tool only opens URLs from the user's message, a search result, or a page it already fetched. The log agreed exactly.

And once every page was linked, Claude's narration of what it did matched the log step for step.

So the lesson isn't that agents lie. There's no reason to think any of this is intent. It's that you can't tell which part of a transcript is true without something else to check it against.

**What this means if you test agents.** A lot of agent readiness work is built on transcripts. Ask ChatGPT about your brand, grade the answer. Ask Claude to find your docs, and if it does, call it a pass.

Grading the answer is fine when the answer is what you care about. If you want to know whether a model recommends you, its recommendation is the thing to measure, and that's what [the ask the model eval](/posts/the-ask-the-model-eval) does. But the moment you start asking an agent what it did, what it read, what it checked, or why it failed, you're grading its account of itself. That account leans generous.

"I asked Claude to find our pricing page and it found it" might mean it fetched the page. It might mean it remembered the page from last month.

**What this does not support.** Two agents, one evening. A site deliberately built to expose caching, with codes that rotated during the session. A normal site would surface these gaps less often, because a stale copy of a page that hasn't changed looks identical to a fresh one.

The summarizer detail is one example. I don't have a rate for how often it embellishes.

**My read:** instrument the site. Log the path, the user agent, the `Accept` header, and the timestamp. When you test, put something on the page you can check, like a code or a version string. Then read the transcript as a lead, not as evidence.

If you want to know what an agent did on your site, the site is the only place that knows.

---

**Related**

- [A link is the whole thing](/posts/a-link-is-the-whole-thing). Same evening. The one finding a transcript got right.
- [The ask the model eval](/posts/the-ask-the-model-eval). Where grading the model's answer is exactly the right test.
- [Your analytics can't see the agents reading you](/posts/analytics-cant-see-agents). Why the server log is the instrument at all.
