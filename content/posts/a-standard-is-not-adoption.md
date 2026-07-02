---
title: "The industry standardized agent discovery. A spec is not adoption."
date: "2026-07-02"
description: "Eleven companies, Google and Microsoft included, agreed on how agents find your tools. On launch day almost none of them had shipped a catalog. Here is what actually changed."
tags: ["agent discovery", "standards", "MCP", "trust"]
---

On June 17 eleven companies published [Agentic Resource Discovery](https://developers.googleblog.com/announcing-the-agentic-resource-discovery-specification/), a shared spec for how agents find your tools. Google and Microsoft signed the same standard, which almost never happens. Cisco, Databricks, GitHub, Hugging Face, Nvidia, Salesforce, ServiceNow, Snowflake, and GoDaddy signed too. The mechanic is simple. You publish an `ai-catalog.json` at a well-known path, and registries crawl it.

This is the layer I keep writing about, now with a name and a logo wall. [The files an agent checks](/posts/the-files-agents-look-for) get one more entry. The registry that indexes them gets a standard to crawl.

**What it actually is.** A catalog of your callable resources, listed in one file at a predictable path: MCP servers, agents, API tools, even nested catalogs. It sits in front of MCP, it does not replace it. MCP is how an agent calls a tool. ARD is how it finds the tool to call.

**The genuinely new part is trust.** Domain ownership becomes cryptographic identity. An agent, or a registry, can verify the publisher is who they claim before it connects. That is the piece llms.txt and sitemaps never had. It is also the piece that matters once agents start spending money on your behalf.

**What it does not solve.** It answers where a capability lives and whether it is safe to connect. It does not answer which one the agent should pick. Selection is still the hard game, and [selection weights corroboration you do not own](/posts/the-trust-gap). A verified catalog gets you into the candidate set. It does not win the pick.

Now the part the announcement leaves out. Check it yourself. Run `curl https://any-signatory.com/.well-known/ai-catalog.json`. On launch day, across the eleven companies that authored the spec, the catalogs were essentially not there yet. A standard shipped. Adoption did not.

This post is the worked example. This site has no MCP server to list, so its [ai-catalog.json](/.well-known/ai-catalog.json) does the honest minimum: it points an agent at the machine-readable resources that exist here and keys trust to the domain and the public source. `curl` it. That is the whole ask, and it took an afternoon.

**My read:** publish the catalog anyway. It is an afternoon of work, the trust layer is real, and being early in a registry beats being correct and invisible later. But do not confuse a spec with distribution. The standard tells an agent how to read your capabilities. It does not make an agent choose you, and it does not put you in the registries agents already query. Ship the file, verify your domain, then go back to the harder question of whether you get selected at all.

---

**Related**

- [The files an agent checks before it reads your page](/posts/the-files-agents-look-for). `ai-catalog.json` is the newest entry.
- [The trust gap nobody is closing](/posts/the-trust-gap). Discovery is not selection.
