---
title: "A 200 is not a read"
date: "2027-01-07"
description: "On my test site, ChatGPT fetched a page, got a 200, and then reported the version from hours earlier. Agents answer from cached copies even right after a live fetch. Agent traffic logs, mine included, count requests, not what the agent actually used."
tags: ["measurement", "experiments", "agent discovery"]
---

Every page on my test site carried a random code. During the evening I rotated them. New codes, same pages.

That turns the code into a timestamp. If an agent reports the current code, it read the current page. If it reports an old one, it read an old copy, and it can't fake its way out of that.

Here's what happened when I asked ChatGPT for every code after a rotation. The log shows it fetched all twelve URLs, six markdown and six HTML, inside one second. Every request returned a 200. Every HTML page came back with the current code.

Five of the six markdown pages came back with codes from the first rotation of the evening. Hours old.

It fetched the live page and then reported a stored copy anyway. The fetch and the read are separate events, and only one of them shows up in your logs.

**A fresh chat is not a fresh fetch.** That wasn't the strangest round. Three separate rounds produced zero HTTP requests while both agents described reading the pages. New sessions every time. The server was sending `Cache-Control: public, max-age=60`, which asks for a copy to be thrown out after a minute. It didn't matter. The agents answered from copies stored somewhere upstream of my server.

I don't know where that cache lives, whether it's per account, or how long it holds. I only saw the effect.

**llms-full.txt is a snapshot that gets quoted as current.** In another round, Claude returned three current codes and three that were two rotations old. The three stale ones weren't random. They were exactly the pages bundled into `llms-full.txt`, the single file with the whole site's content concatenated.

Claude never fetched that file in that round. It pulled those three codes from a cached copy of it and only went to the network for the three pages the file didn't cover. One cheap read instead of six. Half the answer was about ninety minutes out of date, and nothing in the answer said so.

A concatenated file is a secondhand copy of your site. It ages. The agent doesn't mention that it's quoting the old one.

**When the copy and the site disagree, the agent sides with the copy.** I wrote about [the trap Claude invented](/posts/transcripts-are-fiction) when a live file contradicted its cache. It decided the site was trying to trick it rather than doubt its own copy.

A related finding from the same evening. One page said a plan was $49 a month. Another said nothing on the site costs anything. Asked neutrally, neither agent mentioned the conflict. But they did notice when two identifiers on the site should have matched and didn't. They're sensitive to the wrong thing. A drifting code gets flagged. A drifting price gets repeated.

**What this means for agent analytics, including mine.** I build [Pickrate](https://pickrate.io), and it counts agent requests. The [/agents](/agents) page on this blog counts agent requests. So do the server side logs I keep telling people they need.

Requests still matter. They're the inventory. They're when a crawler [takes your page into an index](/posts/who-reads-you-isnt-who-sends-you). If nobody requests you, nobody can use you.

What they can't tell you is whether today's version of your page is the one being repeated. A rise in agent requests after you update a page doesn't mean the update reached anyone. The agent may have fetched it and kept quoting last month.

**What this does not support.** One evening, two agents, a small site. Rotating every code every hour is deliberately hostile to caching. Real pages change slowly, and a stale copy of a page that hasn't changed is identical to a fresh one.

So the cost lands on facts that move. Price. Availability. Version numbers. Anything you change and expect agents to pick up.

**My read:** put a date at the top of every markdown file you serve, so a stale copy is visibly stale. The markdown mirrors on this blog now open with a published date and the canonical URL. Keep fast-changing facts like pricing in as few places as possible, and keep every copy of them identical. If you publish `llms-full.txt`, date it too, or accept that it will be quoted long after it's wrong.

And read your agent logs as a record of who fetched you. Not as proof that anyone used what's there today.

---

**Related**

- [Who reads you isn't who sends you anyone](/posts/who-reads-you-isnt-who-sends-you). The gap between reads and referrals. This is a second gap, between requests and reads.
- [Your analytics can't see the agents reading you](/posts/analytics-cant-see-agents). Why you need server logs. This post is about what those logs still can't tell you.
- [Some of your agent traffic is a scanner wearing a crawler's name](/posts/scanners-wearing-crawler-names). Another way the raw count lies.
