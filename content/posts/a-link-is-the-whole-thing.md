---
title: "A link is the whole thing"
date: "2026-12-03"
description: "I hid six pages on a test site and asked Claude and ChatGPT to find them. Zero of six, until the homepage linked them. Then six of six. Their fetch tools won't open a URL the model made up, which means llms.txt at a well-known path is invisible unless something links to it."
tags: ["agent discovery", "llms.txt", "experiments"]
---

I built a site to answer one question. Can an agent find a page that nothing links to?

Six pages, each carrying a reader code generated when the server booted and never committed anywhere. The code is the point. An agent can fake a summary of a page from its title. It can't fake a random string it never fetched. A correct code is proof of a real request.

The six pages covered the channels people assume agents use. One listed only in `llms.txt`. One only in the sitemap. One in both. One listed nowhere as a control. One listed nowhere but sitting at a guessable path, `/pricing`. And an HTML twin of the `llms.txt` page, to see if format mattered.

Then I gave Claude and ChatGPT the bare domain, in fresh sessions, and asked for every page and its code.

Zero. Both agents. I ran it again. Zero again, and this time neither one issued a single request.

Then I changed one thing. The homepage got plain anchor tags pointing at the pages. Same paths, same content, same codes.

Six of six. Both agents, first try.

Across four runs that evening, the only variable that ever mattered was whether a link existed.

**The fetcher won't take a URL the model wrote.** Claude told me why, unprompted. Its fetch tool only opens URLs that came from the user's message, a search result, or a page it already fetched. It tried `/llms.txt` and the tool refused it before the request left. The server log agrees. `/llms.txt` was never requested.

A well-known path is, by definition, a URL the model composes from convention. That's the one kind of URL these tools won't open.

The sharper version: on the cold run Claude did fetch `robots.txt`. My `robots.txt` had the absolute `llms.txt` URL in it, on an `Llms:` line, in plain text. It still didn't follow it.

ChatGPT didn't explain anything. It fetched `/` and stopped. One request. Different path to the same outcome.

**What that does to llms.txt.** As an index, it works. Once the homepage linked it, Claude read `llms.txt` before opening a single page, noticed it only covered three of the six, and went to the sitemap for the rest. That's exactly how the spec wants it used.

As a discovery mechanism, it's broken for in-session agents. The convention assumes an agent can ask for a path it knows about. These can't.

The `Llms:` line in `robots.txt` buys nothing either. OpenAI's crawler read `robots.txt` and fetched `/sitemap.xml` 48 seconds later, because `Sitemap:` is a real directive. Nobody touched the `Llms:` line under it. Ignoring an unregistered directive is what a correct parser does, so this isn't a bug anyone is going to fix.

This revises something I wrote in July. In [the files an agent checks before it reads your page](/posts/the-files-agents-look-for) I said agents probe a fixed set of files before they read anything, and that your 404 log is a to-do list written by the agents themselves. For in-session agents, that's wrong. They don't probe, so they don't 404, so the to-do list never gets written. The `robots.txt` half held up. Claude fetched it.

**Two agents, two crawl styles.** With every page linked, the logs looked nothing alike.

```
Claude-User   9 requests, 18 seconds, one at a time
/  ->  /llms.txt  ->  /sitemap.xml  ->  the six pages in order

ChatGPT-User  11 requests, all but the first in the same second
/  ->  [every URL on the homepage, at once]
```

Claude reads the listings, then decides what to open. ChatGPT grabs everything on the page in one burst and sorts it out afterward. Its listing files arrived alongside the pages, not before them, so they steered nothing.

Both got the right answer here. On a site with more than six pages those strategies split fast, and only one of them can be steered by what a listing file says.

Two smaller things. Both agents honored a `Disallow: /x/` in `robots.txt`, mentioned it existed, and left it alone. And the HTML twin was found exactly like its markdown sibling. Format made no difference to discovery.

**What this does not support.** This is in-session agents only. Crawlers are a different population and this says nothing about whether any crawler asks for an unlinked `/llms.txt` on a domain it already knows. Twelve crawler requests over five hours is nothing.

The test domain was a couple of hours old and indexed nowhere. No search results to fall back on is a big part of why the agents were stuck. An established site gives them another way in.

And I never got a clean read on the middle case. When the homepage linked only the listing files, not the pages, both agents answered from what they'd cached in earlier runs instead of fetching again. That's its own problem, and it's the next post.

This blog logs about 217 hits on `/llms.txt` against 2,288 on `robots.txt` and 1,078 on the sitemap. That doesn't prove convention probing either. Here `llms.txt` is linked three ways: in the `<head>`, in the homepage body, and from [/agents](/agents).

**My read:** link it. A plain `<a>` on a page agents already reach, not a `rel="alternate"` tag alone and not a well-known path alone. If a page matters, something a person or an agent already lands on has to point at it.

A listing file is a table of contents. It doesn't help if nobody opens the book.

---

**Related**

- [The files an agent checks before it reads your page](/posts/the-files-agents-look-for). The post this one corrects. The checklist still stands. The "agents probe" part doesn't.
- [Most businesses don't need most of the agent files](/posts/which-agent-files-you-need). Serve fewer files, and link the ones you serve.
- [An agent reads your page as text](/posts/what-an-agent-reads). Format matters for what an agent understands. It didn't matter at all for whether it found the page.
