---
title: "An agent cannot call an API it has to guess"
date: "2026-07-23"
description: "Give an agent a machine-readable contract or it guesses, gets 400s, and falls back to a rival with a clean spec. The spec is your API's README."
tags: ["agent discovery", "API", "OpenAPI"]
---

An agent cannot call an API it has to guess. It needs a contract: which endpoints exist, what they take, how to authenticate, what comes back. Hand it a complete OpenAPI spec at a discoverable path and it constructs valid calls on the first try. Hand it prose docs with curl snippets and it infers `POST /contacts`, guesses the field names, gets a 400, retries once, and falls back to a competitor whose spec told it exactly what to send.

The spec is to your API what the README is to your package: the artifact the agent reads to decide it can use you. Most APIs have human docs and no machine contract, so they are callable by people and invisible to agents.

**Serve a complete OpenAPI spec.** Every endpoint, every parameter, the auth scheme, and the error responses, not just the 200 case. Test it against the running API. A spec that validates but drifts from the implementation fails the call with confidence.

**Advertise it.** Put an API catalog at a well-known path and point a `Link` header at it, so an agent that lands anywhere on your domain can find the spec.

**Write the descriptions for the agent's read.** Clear operation names, plain-language summaries, real request and response examples. A typed-but-undescribed spec tells the agent the shape but not the intent, so it calls the wrong endpoint correctly.

**Make auth discoverable.** Declare it in the spec, and return a 401 that points at your OAuth metadata so the agent can complete the flow instead of giving up.

**Return errors that teach.** Name the field that was wrong and why. The difference between "400 Bad Request" and "400: email is required and must be valid" is the difference between an agent that recovers and one that quits.

Two things people skip. Rate-limit with a real `429` and `Retry-After`, because agents retry harder than humans and will hammer an unmetered endpoint into a cost incident. And version in the open, mark deprecated operations so an agent does not pick a path you are sunsetting.

**My read:** every step here is the same move, remove a reason for the agent to guess. The spec makes you callable. The errors, the auth discovery, and the limits decide whether the agent recovers and finishes, or churns to the rival who made it easier.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook.
