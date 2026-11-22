---
title: "ChatGPT never sees your markdown"
date: "2026-12-10"
description: "The popular way to serve markdown to agents keys off one request header. Coding agents send it. ChatGPT and Claude.ai don't. I tested both, and both chat agents got the HTML every time."
tags: ["agent discovery", "agent-readable", "experiments"]
---

On the same test site from [last week's post](/posts/a-link-is-the-whole-thing), every page had two versions at one URL. The real content, in markdown. And an HTML stub that said "Hello world. This is page X." and nothing else.

Which one you got depended on a single request header.

Claude got the markdown on every fetch. ChatGPT got hello world on every fetch. Same links, same site, same evening.

**ChatGPT asks for HTML.** Here are the two `Accept` headers from the log:

```
Claude-User    Accept: */*
ChatGPT-User   Accept: text/html,application/xhtml+xml,...
```

ChatGPT's fetcher identifies itself the way a browser does. It asks for HTML, so it lands in the HTML branch, and whatever you put there is what it reads. It fetched all six pages in one second, got the stub six times, and never once requested a `.md` URL on its own. Not a byte of markdown reached it.

Claude sent `*/*`, which my test server treated as "not asking for HTML," and got the real thing three times out of three.

**You won't catch this yourself.** `curl` sends `*/*`. So does most of what you'd use to check your own site. You run the test, you get the markdown, you ship it. The setup looks right from everywhere except the place you built it for.

**The playbook everyone is shipping.** Serving markdown off the `Accept` header is a real pattern now, and it's spreading. Cloudflare launched Markdown for Agents in February: a client sends `Accept: text/markdown`, Cloudflare converts your HTML to markdown at the edge, and browsers keep getting HTML. Vercel has a guide and a Next.js template that do the same thing with a rewrite. There's a handful of npm packages for it.

All of them key off `Accept: text/markdown`. Cloudflare's own announcement names the agents that send that header: Claude Code and OpenCode.

My test server had used a looser rule. Anything not asking for HTML got markdown. That's why Claude got it. Under the Cloudflare and Vercel rule, only a request that explicitly asks for markdown gets it, and Claude's `*/*` doesn't ask.

So I tested that rule directly. A page on another site I run, same idea: one code in the HTML, a different code in the markdown, markdown served only on `Accept: text/markdown`. Unlisted, noindex.

- ChatGPT returned the HTML code.
- Claude.ai returned the HTML code.
- Claude Code's fetch tool returned the markdown code.

The setup works exactly as designed. It serves your markdown to coding agents, and to neither of the two chat agents people actually ask about products.

One more wrinkle. A second Claude Code session also came back with the HTML code, and its answer read like raw page source. My guess is it used `curl` from the shell instead of its fetch tool. If that's right, it's the same agent with two tools and two versions of your page. I didn't confirm which tool it called.

**This isn't a knock on the setup.** For coding agents it does what it says. And a real site's HTML branch isn't a hello world stub, it's the full page, so ChatGPT still gets your content. It just never gets the markdown you built for it. The stub exaggerated the cost so it would show up in the log.

**The format isn't the problem. The door is.** In an earlier round I served the exact same markdown bytes down both branches and changed only the content type. ChatGPT got it labeled `text/plain`. Claude got it labeled `text/markdown`. Both parsed it fine and both found the code. The label didn't matter. Which branch you landed in did.

**What this does not support.** Two chat agents, one run each on the Cloudflare-style rule. The original split came from one evening in September. Fetchers change their headers without telling anyone, so any of this could flip next month. And I tested the rule on my own server, not Cloudflare's converter. Same logic, different code.

It's also not an argument against negotiation. If your audience is coding agents, it's working.

**My read:** put a plain link to the markdown next to the page. A URL ChatGPT can follow, because [it follows links](/posts/a-link-is-the-whole-thing), not conventions and not headers. This blog does it on every post: a "read as markdown" link to `/posts/<slug>.md`, no negotiation required.

Negotiate too if you want. Just treat it as an extra, never the only way in. And when you test, test with the real agents. Or at minimum, run `curl` with ChatGPT's `Accept` header and look at what comes back.

---

**Related**

- [A link is the whole thing](/posts/a-link-is-the-whole-thing). Same lesson through a different door. Agents follow links.
- [An agent reads your page as text](/posts/what-an-agent-reads). Why the markdown version is worth serving in the first place.
- [The files an agent checks before it reads your page](/posts/the-files-agents-look-for). The checklist. Make sure each file is reachable by a link.
