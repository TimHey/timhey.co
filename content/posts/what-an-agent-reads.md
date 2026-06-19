---
title: "An agent reads your page as text. Most of it is gone."
date: "2026-06-25"
description: "Agents do not render your JavaScript or see your layout. They read the page as a string. Here is how to make sure the answer survives."
tags: ["agent discovery", "AX", "agent-readable"]
---

When an agent lands on your page it reads the page as text. It does not render your JavaScript, it does not see your layout, and it does not care about your brand colors. If your content is painted in by a client-side framework, or buried in prose with no structure, the agent gets a near-empty string and leaves. The capability is there. The agent cannot see it.

This is the first channel in [the playbook](/posts/agent-discoverability-playbook): your own pages, read by a machine.

**Serve the content in the HTML.** Most agents do not execute JavaScript. If the answer only exists after the page hydrates, it does not exist to them. Put the real content in the initial response, and do not gate it behind a cookie wall.

**Map the site with llms.txt.** A plain text file at your root that lists the pages an agent should read. It is a sitemap written for models. Almost nobody ships one, which makes it cheap leverage.

**Mirror pages as Markdown.** Serve a clean `.md` version of each important page at a predictable URL. Markdown strips the nav and the scripts and hands the agent just the content.

**Declare facts in JSON-LD.** Structured data gives an agent typed facts instead of prose it has to interpret. The price, the answer, the steps, named. It is the difference between an agent guessing and an agent knowing.

**Write answer-shaped content.** Lead with the direct answer, then the context. Agents lift the first confident statement. FAQ and comparison pages map cleanly to the questions agents are asked.

This post is the worked example. It is in the [llms.txt](/llms.txt), it has a [markdown mirror](/posts/what-an-agent-reads.md), and the structured data is real.

**My read:** this is access plus machine-readable proof, not SEO with a new name. The work is making the answer survive the trip from your page into an agent's context. Fix access first, then make the content extractable, then check whether the page actually surfaces for the questions buyers ask.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook this is part of.
