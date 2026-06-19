---
title: "An SDK an agent can find, install, and run"
date: "2026-07-23"
description: "An SDK is found as a package and judged by its docs. Distribution and docs are one chain, and the agent quits at the first broken link."
tags: ["agent discovery", "SDK", "packages"]
---

An SDK is a hybrid. An agent finds it the way it finds any package, by querying a registry, and then judges it the way it reads any docs, as plain text. Both have to land. The agent resolves "how do I do X with Y" into a lookup and a read, and it quits at the first broken link.

The canonical failure is the registry gap: an agent picks a rival because your package is not on the registry under a name it can predict. A perfect doc behind a missing package still loses. So an SDK is really three jobs stacked.

**Publish and name so an agent finds you.** One package per ecosystem, named framework-native. This is the [packages](/posts/the-registry-is-the-search-index) problem, and it decides whether you are a candidate at all.

**Make the docs readable as text.** Clean HTML or Markdown, `.md` mirrors, an llms.txt, structured data naming the package and the install command. This is the [website content](/posts/what-an-agent-reads) problem. JS-rendered docs and PDF-only references are dead ends.

**Package it to run.** This is the part only an SDK has. The best docs are the ones an agent executes, not reads.

- A quickstart an agent can run end to end: install command, minimal example, expected output.
- A skill or agent-ready instruction set that wraps your common tasks.
- An MCP server, if it fits, so the agent uses the capability directly instead of writing glue code.
- Runnable examples committed to the public repo. Agents pattern-match on real, working code.

**My read:** the SDK is where the whole playbook assembles. Distribution gets you found, docs get you understood, and a runnable quickstart gets you used. Skip any one and the chain breaks at that link, no matter how good the others are.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [The package registry is the agent's search index](/posts/the-registry-is-the-search-index). How the find step works.
