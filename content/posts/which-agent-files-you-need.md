---
title: "Most businesses don't need most of the agent files"
date: "2026-07-09"
description: "The list of files agents look for is long, and most of it is not for you. A capability file is only worth serving if you have the capability behind it. How to tell."
tags: ["agent discovery", "agent-readable", "AX"]
---

There is a growing list of files agents look for, and a growing anxiety about serving all of them. Skip the anxiety. Most of that list is not for your business.

Split the files in two. **Content surfaces** tell an agent what you are and let it read you: robots.txt, llms.txt, markdown mirrors, structured data. Almost every site benefits from these. **Capability files** tell an agent what it can *do* with you: call your API, connect to your tools, authenticate, pay. You serve these only if you offer the capability behind them.

That second group is where people over-invest. A blog has nothing for an agent to call, so it needs none of them. This blog serves zero capability files, and that is correct.

The rule: serve a capability file only if the capability exists and you want an agent to use it without a human.

Here is the short version of what is out there, each with someone already doing it.

- **OpenAPI spec and API catalog.** A machine-readable contract for your API. [Stripe](https://github.com/stripe/openapi) publishes a full one. Serve it if you have an API you want agents to call.
- **OAuth discovery.** Lets an agent find your login flow and authenticate. Google serves it; every identity provider does. Serve it if anything you expose needs sign-in.
- **MCP server card.** Declares an MCP server so a client can connect. Cloudflare's isitagentready.com serves one. Serve it if you run an MCP server, which most businesses do not.
- **Agent card and skills index.** For when you operate an agent other agents should call, or publish skills they can load. Emerging, and niche.
- **Commerce protocols.** Let an agent buy. The [Agentic Commerce Protocol](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol) (OpenAI and Stripe) powers ChatGPT checkout; Coinbase's x402 settles agent payments. Serve them if you sell something an agent should buy.

Now place yourself.

- **Content site or blog:** none. Content surfaces only.
- **Developer tool:** OpenAPI, a catalog, OAuth. Think Stripe.
- **Store:** commerce protocols and auth.
- **A hybrid like Zapier:** a content site, a developer platform, and an agent-native product at once, so it has reason to serve almost the whole set.

Most businesses are in zero-to-two territory. The list is long because it has to cover everyone from a personal blog to a platform. Your column is short.

**My read:** capability files follow capability. The teams burning time trying to serve all of them are answering a checklist instead of a question. The question is "what can an agent actually do with us," and for a lot of businesses the honest answer is "read us, and that is fine."

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [The files an agent checks before it reads your page](/posts/the-files-agents-look-for). The companion to this one.
