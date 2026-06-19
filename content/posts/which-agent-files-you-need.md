---
title: "Most businesses don't need most of the agent files"
date: "2026-07-09"
description: "The list of files agents look for is long, and most of it is not for you. A capability file is only worth serving if you have the capability behind it. How to tell, and what they look like."
tags: ["agent discovery", "agent-readable", "AX"]
---

There is a growing list of files agents look for, and a growing anxiety about serving all of them. Skip the anxiety. Most of that list is not for your business.

Split the files in two. **Content surfaces** tell an agent what you are and let it read you: robots.txt, llms.txt, markdown mirrors, structured data. Almost every site benefits from these. **Capability files** tell an agent what it can *do* with you: call your API, connect to your tools, authenticate, pay. You serve these only if you offer the capability behind them.

That second group is where people over-invest. A blog has nothing for an agent to call, so it needs none of them. This blog serves zero capability files, and that is correct.

The rule: serve a capability file only if the capability exists and you want an agent to use it without a human.

Here is what each one is, where it lives, and who needs it.

| Capability file | Where it lives | What it is | Who needs it |
|---|---|---|---|
| OpenAPI spec | `/openapi.json`, often linked from `/.well-known/api-catalog` | a JSON or YAML file listing every endpoint, its inputs, and its responses | anything with a public API |
| OAuth discovery | `/.well-known/openid-configuration` | a small JSON doc pointing to your sign-in and token URLs | anything behind a login |
| MCP server card | `/.well-known/mcp/server-card.json` | a JSON file naming your MCP server, where to reach it, and the tools it exposes | a business running an MCP server |
| Agent card | `/.well-known/agent-card.json` | JSON describing an agent's identity and what it can be asked to do | a business operating an agent |
| Commerce protocols | your checkout API, or an HTTP `402` reply | structured checkout and payment messages, not a static file | stores and marketplaces |

The pattern: the further down you go, the fewer businesses it applies to. Almost everyone could publish an API spec; almost no one needs an agent card yet.

## What one actually looks like

They are smaller than they sound. Here is a real MCP server card, the one Cloudflare's agent-readiness scanner serves at `isitagentready.com/.well-known/mcp.json`:

```json
{
  "serverInfo": { "name": "Agent Readiness Scanner", "version": "1.0.0" },
  "description": "Scan any website URL to check its AI agent readiness level.",
  "url": "https://isitagentready.com/mcp",
  "transport": { "type": "streamable-http" },
  "capabilities": { "tools": true }
}
```

That is the whole file: a few lines at a predictable URL that say "here is my server and what it does." The rest are the same idea in different shapes. An OpenAPI spec is a much bigger version of it for an API. OAuth discovery is a short list of URLs pointing at your login. None of them is mysterious once you have seen one.

## Place yourself

- **Content site or blog:** none. Content surfaces only.
- **Developer tool:** an OpenAPI spec and OAuth discovery. Think Stripe or GitHub.
- **Store:** commerce protocols and auth.
- **A hybrid like Zapier:** a content site, a developer platform, and an agent-native product at once, so it has reason to serve almost the whole set.

Most businesses are in zero-to-two territory. The list is long because it has to cover everyone from a personal blog to a platform. Your column is short.

**My read:** capability files follow capability. The teams burning time trying to serve all of them are answering a checklist instead of a question. The question is "what can an agent actually do with us," and for a lot of businesses the honest answer is "read us, and that is fine."

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [The files an agent checks before it reads your page](/posts/the-files-agents-look-for). The companion to this one.
