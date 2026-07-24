---
title: "Some of your agent traffic is a scanner wearing a crawler's name"
date: "2026-08-27"
description: "I read my own agent log properly for the first time. Roughly one in ten recorded hits was a vulnerability scan, and 146 of them could only have been logged because something called itself a known crawler while asking for /.env."
tags: ["measurement", "agent discovery", "agent experience"]
---

Last week I said [your analytics can't see the agents reading you](/posts/analytics-cant-see-agents), and I closed with the honest limit: user-agents lie. Then I sat down and read what my own instrument had actually recorded. The limit is not a footnote. It is roughly one in ten of the hits.

Of 2,598 recorded hits on this site, 247 were vulnerability scans. Requests for `/.env.production`, `/.ssh/id_ed25519`, `/.git/config`, `/.aws/credentials`, and about ninety variations of a PHP shell dropped under `/.well-known/`. My agent counter had been counting them as agents.

**The tell is which paths got logged at all.** The middleware recorded a hit under one of two conditions: the user-agent matched a known crawler, or the path was a surface built for agents (`llms.txt`, the `.md` mirrors, the feed, anything under `/.well-known/`). Now apply that. `/.env.production` is not an agent surface. Neither is `/config.json` or `/api/env`. There is exactly one way those got into the log.

146 hits, spread across 121 distinct paths, were recorded because something sent a user-agent identifying as a known crawler and then asked for a credentials file. That is not an inference about the shape of the traffic. It is the only condition under which those rows exist.

**Why a crawler name is worth stealing.** It used to be a bot name got you blocked. That flipped. Sites now want GPTBot and ClaudeBot and PerplexityBot to get through, because being read is how you get recommended. So the name went on the allowlist, past the WAF, past the rate limiter, exempt from the challenge page. A crawler name stopped being a liability and became a key. Anyone can send it, nobody checks, and the reward for wearing it went up.

**What it does to your numbers.** Three things, in increasing order of damage. It inflates the visit count, which is the least of it. It fills your most-requested-paths list with someone else's wordlist, so the one read that actually matters, what are agents asking for, becomes unreadable. And it lands in whatever bucket the forged name points at, so your per-agent counts are wrong in a direction you cannot see.

The fix is not clever. Classify before you count. Requests for server tech you do not run, dotfiles, credential and config filenames, private keys, framework debug consoles. None of it is a read. On this site that took 276 distinct recorded paths down to 51, and the 51 are all real: posts, markdown mirrors, `llms.txt`, `robots.txt`.

**One rule is worth stating separately.** Everything under `/.well-known/` has to survive the dotfile filter. That directory is where the conventions live, and a request for one you have never heard of is the most interesting line in the log. Mine shows agents asking for `security.txt`, `jwks.json`, `trust.txt`, `nodeinfo`, `ai-plugin.json`. That is a to-do list arriving unprompted. Filter the whole dot-directory and you throw it out with the shells.

**Then publish the number.** I count the scans in aggregate and show the total on [/agents](/agents), next to the agent counts. A measurement post that quietly deletes its inconvenient traffic is not worth reading. The scans are real requests, they are just not readers, and the honest move is to say how many there were rather than to make them disappear.

**The part I got wrong, which is the useful part.** I cannot tell you which crawler's name those 146 hits were wearing. I stored agent counts in one place and path counts in another, with nothing tying a row to a row. It never occurred to me I would want the join, because I never expected the two to disagree. So the forensic question I most want to answer, whose identity is being used against my allowlist, I cannot answer from my own data. If you are building this: log the pair. The user-agent and the path in one record. It costs nothing on the way in and it is unrecoverable afterward.

If you need certainty rather than a shape, the big labs publish verified IP ranges for their crawlers, and a reverse lookup settles it. I have not wired that up here yet. For the question this instrument exists to answer, are agents finding the surfaces I built for them, the name plus the path is enough, once you stop letting the scanners into the count.

**My read:** every public host on the internet gets sprayed with this, so if your agent log is clean, it is more likely you are not looking than that nobody knocked. Go read your own paths list, all of it, not the top ten. The first time I did, a tenth of my agent audience turned out to be someone running a wordlist while wearing a name I had put on an allowlist.

---

**Related**

- [Your analytics can't see the agents reading you](/posts/analytics-cant-see-agents). The instrument this post is auditing.
- [Your GitHub repo already logs agent interest. Read it.](/posts/github-agent-traffic). Same discipline, read the paths, not the count.
