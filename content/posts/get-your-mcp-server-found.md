---
title: "One registry will not get your MCP server found"
date: "2026-08-06"
description: "Agents find MCP servers two ways: in the registries their client reads, and on the open web mid-task. Most servers do the first and miss the second."
tags: ["agent discovery", "MCP", "AX"]
---

List your MCP server in one registry and you are invisible to every agent that researches a task on the open web. Agents find servers two ways: through the registries their client reads, and through search when they hit a problem mid-task. Most servers stop at the registry and miss half their reach.

Picture the miss. A developer asks their agent to post build failures to Slack. The agent searches, finds a server named `slack-mcp` with a clear tool called `send_message`, and uses it. Your server does the same job, but it is named "Acme Connect," lists forty overlapping tools with one-word descriptions, and lives only in a directory the agent never queried. You had the capability. The agent never saw it.

**List where clients read.** Publish to the official MCP registry and claim your entry, then submit to the major client directories separately. They do not all sync.

**Write metadata for the agent, not the human.** The agent reads your server name and every tool name and description before it decides to call you. Name the server for the job, name tools verb-plus-object like `create_issue`, keep descriptions to one useful sentence, and cut tools that overlap. Twenty sharp tools beat eighty fuzzy ones.

**Make auth discoverable.** Remote servers usually need auth, and an agent that cannot figure out how to authenticate abandons the server. Declare it, and return a 401 that points at your OAuth metadata.

**Be findable on the open web.** A crawlable docs page that names the server and shows the connection command. A server card at the well-known path. An llms.txt and a Markdown mirror. The package on npm or PyPI under a name that matches the search.

**My read:** registry presence is table stakes, not a strategy. The work that wins calls is the metadata an agent reads to choose, and a web footprint for the agents that never open a directory. A server that gets chosen but errors on half its calls churns as fast as one that is never found.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [The official MCP registry](https://modelcontextprotocol.io). Where to publish first.
