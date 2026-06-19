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

Here is the short version of what is out there, who already serves it, and who needs it. The "in the wild" column is the useful part: every one of these is something you can go look at right now.

| Capability file | What an agent does with it | In the wild | Who needs it |
|---|---|---|---|
| OpenAPI spec + API catalog | calls your API without guessing | [Stripe](https://github.com/stripe/openapi), [GitHub](https://github.com/github/rest-api-description) | anything with a public API |
| OAuth discovery | signs in on a user's behalf | [Google](https://accounts.google.com/.well-known/openid-configuration), Microsoft | anything behind a login |
| MCP server card | connects to your MCP server | [isitagentready.com](https://isitagentready.com) (Cloudflare), Zapier | businesses running an MCP server |
| Agent card / skills index | gets discovered and called by other agents | still emerging | businesses operating an agent |
| Commerce protocols (ACP, x402) | buys from you | [ChatGPT + Stripe](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), Coinbase | stores and marketplaces |

The pattern in that table: the further down you go, the fewer businesses it applies to. Almost everyone could use an API spec; almost no one needs an agent card yet.

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
