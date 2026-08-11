---
title: "The third system doesn't run your tag"
date: "2026-09-10"
description: "Every analytics team knows how to stitch one person across web and app. Agents are a third system, and the instinct is to call it a third node in the same graph. It isn't. The instrument that solved the first two is the one thing that doesn't work on the third."
tags: ["measurement", "attribution", "agent discovery"]
---

Every analytics team already knows how to stitch one person across two systems. Anonymous ID on the website, user ID in the app, a device graph in the middle, a join when they log in. It is a solved problem with a shared mental model. Segment, Amplitude, and mParticle all built businesses on it. Nobody argues about the concept anymore, only the implementation.

Then the work moved into a chat window and a terminal.

There is a third system now. An agent reads your docs, weighs you against two competitors, picks one, and installs it. That whole sequence happens on a surface your identity graph has never had a node for.

The obvious move is to add one. Web, app, agent. Same graph, one more edge, ship it.

That version is wrong in a way that matters.

**The instrument doesn't work there.** Web-to-app stitching is built entirely on client-side primitives. A cookie. A device identifier. An SDK that executes in a runtime you control. Every tool that solved the first two nodes solved it by putting code inside the client and waiting for it to phone home.

The agent node is exactly where all of that is missing. Agents don't execute your JavaScript. They fetch the HTML and leave. No cookie is set because nothing ran to set one. No device ID exists because there's no device in any sense your SDK recognizes. The tag is sitting right there in the page and it never fires.

So this isn't a new node in the same graph. It's a new place to stand.

**What that changes in practice.** If you can only observe something from a different vantage point, you have to move, and moving costs you things you didn't have to think about before.

Server-side is the whole game, which means the observation point stops being a script tag you paste once and starts being a position in your request path. Your CDN sees things your application never will, because plenty of agent requests get answered at the edge and never reach your origin. Your app middleware sees the request but often not the response, so it can tell you an agent asked for a page but not that you returned a 404. Your MCP server sees a category of interaction that never touches the web path at all.

None of those positions sees everything. That's not a tooling gap anyone is going to close. It's geometry. I wrote up the full map of vantage points, and what each one structurally cannot see, [over at Pickrate](https://pickrate.io/blog/where-agent-traffic-is-observable).

**The part that breaks the model, not just the tooling.** Stitching assumes the thing you're stitching is a proxy for a person. A browser is a person. A phone is a person. That assumption is what makes identity resolution meaningful in the first place.

An agent is sometimes a proxy for a person and sometimes not. A crawler indexing your docs at 3am isn't standing in for anybody. A coding agent installing your SDK is acting for a developer who may not read a single page you wrote. And the human, if there is one, might show up two days later from a different network and convert without ever touching the surface where the decision actually got made.

Resolve all of that back to a person and you delete the interesting part. Some of this traffic has no person behind it, and the reason it matters is that it still made a choice about you.

**What I'd actually do.** Start with the familiar framing, because it gets you in the door. Every team you talk to already owns the web-to-app model and will extend it without much argument.

Then be honest about the second half. A meaningful share of the traffic that decides whether you get picked will never resolve to a human, never fire your tag, and never appear in your funnel as anything but direct. That's the part their current stack can't see, and it's the reason the third node isn't just node three.

Web to app was the easy one. Both endpoints ran your code.
