---
title: "Getting found by an agent is a distribution problem"
date: "2026-06-18"
description: "Agents do not browse, they query. Here is the six-channel playbook for being the tool an agent picks, and how to measure whether it works."
tags: ["agent discovery", "agentic GTM", "AX"]
---

When a person looks for a tool they search, skim, and click. When an agent looks for a tool it queries a registry, reads a file, and calls an API. Same job, completely different path. If you only built for the human path, the agent never finds you.

This is job two from [two disciplines](/posts/two-disciplines), selling to agents, and it has an actual playbook. I wrote it down. Over the next few weeks I am publishing it here, one channel at a time. This post is the map.

**Two ways an agent finds you.** Push: you serve something on your domain and the agent reads it, your content, your files, your API spec. Pull: the agent queries a registry and acts on what comes back, your package, your MCP server. Most teams do some push and zero pull. Pull is where the decision often gets made, before your marketing ever loads.

**Six channels, in the order I will cover them.**

- **Website content.** What an agent reads when it lands on your domain, and why most of it is invisible to one.
- **The files agents look for.** robots.txt, llms.txt, and the `/.well-known` paths an agent probes before it reads a single page.
- **Packages.** The registry is the agent's search index. No package under a name it can predict, no candidate.
- **The SDK.** The package and the docs together, the thing an agent installs and runs.
- **The API.** The OpenAPI spec that lets an agent call you without guessing the endpoint.
- **The MCP server.** The registries and client directories an agent actually reads before it picks a tool.

**The part most people skip: measure it.** Five layers, leading to lagging. Presence, is the artifact even there. Reach, are agents requesting it. Selection, does the agent pick you. Success, does it finish the task. Outcome, what followed. Presence and Reach you can pull from your files and logs today. Selection is the one that matters and the one nobody measures. You can be present in every channel and still lose, because the agent picked the rival it could find faster.

**My read:** getting found by agents is distribution, not content. The work is shipping the right artifact to the right channel under the name an agent predicts, then measuring whether it gets picked. It is unglamorous, and it is mostly empty, which is exactly why it is worth doing now.

One more thing. This blog is the worked example. It has an [llms.txt](/llms.txt), every post has a [markdown mirror](/posts/agent-discoverability-playbook.md) an agent can read, and the structured data is real. I am not going to write a playbook about being agent-readable on a site that is not.

Next up: website content, what an agent sees when it reads your page as text. I will link each part here as it ships.

---

**Related**

- [Agentic GTM is two jobs wearing one name](/posts/two-disciplines). Why selling to agents is the job worth doing.
- Matt Biilmann, [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax/). The discipline this playbook serves.
