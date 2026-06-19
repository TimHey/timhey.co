---
title: "Your GitHub repo already logs agent interest. Read it."
date: "2026-06-13"
description: "GitHub won't label which visitors were agents. But clones, referrers, and paths give you the signal. A four-read how-to off the traffic API."
tags: ["agent discovery", "github", "measurement"]
---

Agents read your GitHub repo before they recommend your tool. GitHub will not tell you which visitors were agents. But its traffic API gives you enough signal to infer it, and most people never look.

The Insights tab shows views and clones for the last 14 days. The API behind it gives you four reads. Here is how to pull them and how to read each one for agent signal.

```
gh api repos/OWNER/REPO/traffic/views
gh api repos/OWNER/REPO/traffic/clones
gh api repos/OWNER/REPO/traffic/popular/referrers
gh api repos/OWNER/REPO/traffic/popular/paths
```

You need push access to the repo, and the window is a rolling 14 days. So snapshot it on a schedule or you lose the history.

**1. Clones against views.** This is the tell. Humans browse. Machines clone. On a public SDK repo I help maintain, two weeks drew roughly 70 unique viewers but about 150 unique cloners. When clones outrun views like that, something automated is pulling the repo. My read: the gap is your automation-and-agent floor, not your audience.

**2. Referrers.** Mostly GitHub itself, Google, and Brave. Then `chatgpt.com` showed up. One referral from an AI tool is tiny. It is also proof the path from agent to repo exists at all. You cannot improve a path you cannot see.

**3. Paths.** The interesting list. Not the homepage README, the machine-readable files: an `AGENTS.md`, a `SKILL.md`, the examples directory. When the files written for agents start outranking the page written for humans, agents are reading, not just landing.

**4. Cadence.** Views and clones come with daily counts. A flat line with sudden spikes usually means a crawl or a CI job, not organic discovery. Plot it and the machine traffic separates from the human traffic by shape.

Here is the honest limit. GitHub does not expose the user-agent per view. So you cannot prove "Claude fetched this" from the traffic API. You infer it from the four reads together. If you want user-agent truth, you need a property you control and its server logs. Your repo gives you signal. Your own site gives you proof.

Assessment: this is the cheapest agent-readiness instrument you have. It is already running, on every repo you own, for free. Pull it weekly, write down the clone-to-view gap and the top paths, and you will see agent interest move before any dashboard tells you.
