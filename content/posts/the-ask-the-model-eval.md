---
title: "The eval that tells you if agents actually pick you"
date: "2026-08-06"
description: "You can ship every artifact and still lose. The only way to know if agents choose you is to ask them, repeatedly, and score it."
tags: ["agent discovery", "evals", "agentic GTM"]
---

You can ship every artifact in the playbook, package published, docs mirrored, spec valid, scanner green, and still lose. An agent picks a rival anyway, because of its training data, the rival's naming, or one thin description. The artifacts are necessary. They do not tell you whether you win the choice.

The only thing that tells you that is to ask the models, repeatedly, and score it. That is the eval, and it measures the one layer files and logs cannot: does the agent pick you, and once it does, does it finish.

**Write a fixed task set.** Ten to thirty tasks phrased the way a user would phrase them. The goal, not the tool. "In a LangChain app, add a tool that creates a CRM contact," not "install acme-langchain." The second one pre-selects you and measures nothing.

**Run a matrix.** The same task across the models your buyers use and the contexts they work in. A package can win in a raw script and be invisible in LangChain. You want to see which.

**Run multiple trials.** Model output is stochastic, so a single run is noise. Five runs minimum, and report a selection rate, chosen in four of five, not a yes or no. Do not over-read small deltas.

**Grade with a rubric.** For each trial: picked you, picked a rival and which one, picked nothing. Capture the rival names. "We lose to the incumbent package sixty percent of the time in LangChain" is a roadmap. "Our selection rate is low" is not.

Then watch for leakage. If you name your product in the task, you faked the score.

This sits at the top of a five-layer funnel. Presence, is the artifact there. Reach, are agents requesting it. Selection, does the agent pick you. Success, does it finish. Outcome, what followed. Presence and Reach you get from files and logs today. Selection is the one that matters and the one nobody measures.

**My read:** discoverability is a measured number, not a launch checkbox. Selection is where you can be present in every channel and still lose, so it is the number to put on the dashboard. Everything else in this playbook exists to move it.

---

**Related**

- [Getting found by an agent is a distribution problem](/posts/agent-discoverability-playbook). The full playbook this series completes.
