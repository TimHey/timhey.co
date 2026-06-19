---
title: "The package registry is the agent's search index"
date: "2026-07-16"
description: "An agent looks for a tool by querying a registry, not Google. No package under a name it can predict, no candidate. The decision is made before your content gets a vote."
tags: ["agent discovery", "packages", "SDK"]
---

When an agent needs a tool, it queries a package registry before it reads a single doc. It guesses the name, searches npm or PyPI, reads the candidates, and installs one. If you are not in the registry under a name it can predict, you are not in the candidate set. The agent solves the problem without you and never learns you existed.

This is the channel teams forget, because it does not feel like marketing. It is also the one where the decision often gets made before any of your content gets a vote.

Watch it happen. Ask an agent to add a CRM tool to a LangChain app and it searches PyPI for the obvious name, something like `acme-langchain`. If that package exists, it installs it and moves on. If it does not, the agent reaches for a competitor whose package does exist, even when your product has more capability. The capability was there. The package was not. Absence read as absence.

**Be in every registry that matters.** One package per ecosystem you support. A missing ecosystem is a capability gap for every agent working in that language.

**Name it the way an agent would guess.** Framework-native and predictable: `acme-langchain`, `acme-mcp`. This is the highest-leverage fix, because naming is what the agent does before it searches. A clever brand name fails silently.

**Write the metadata for the agent's read.** Description, keywords, and a README with the install command up top and a working example. The agent pattern-matches on runnable code, and ranks on recency, so do not look abandoned.

**Earn transitive discovery.** Agents find packages through the dependency graph too. If a popular package an agent already trusts depends on yours, you inherit its reach.

**My read:** getting found in a registry is distribution, not content. You can have flawless docs, a clean llms.txt, perfect structured data, and still lose every agent that starts at the registry. Ship the package, name it the way the agent guesses, and you are at least in the room.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
- [An agent reads your page as text](/posts/what-an-agent-reads). The push side of the same coin.
