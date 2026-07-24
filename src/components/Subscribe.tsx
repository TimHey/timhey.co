"use client";

import { useState } from "react";

// Newsletter subscribe — a real conversion. How the visitor arrived (a ?via= tag or an AI referrer)
// is captured server-side by middleware into a first-party cookie; this form just posts the email,
// and /api/subscribe reads that cookie to attribute the signup. See src/middleware.ts.

type State = "idle" | "loading" | "check" | "held" | "dupe" | "error";

export function Subscribe({
  caption = "Get new posts by email.",
  source = "home",
}: {
  /** Line above the field. Worth varying: what earns the signup differs by page. */
  caption?: string;
  /** Which placement converted, so the two can be compared. */
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  // Honeypot. Bots fill every field they find; people never see this one.
  const [website, setWebsite] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, website }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        duplicate?: boolean;
        warning?: string;
      };
      // Don't promise an email that can't be sent yet. The address is recorded either way, and
      // scripts/invite-pending.ts mails these once sending is switched on.
      setState(data.duplicate ? "dupe" : data.warning ? "held" : "check");
    } catch {
      setState("error");
    }
  }

  if (state === "check") {
    return (
      <p className="subscribe-done">
        Check your email &mdash; one click to confirm and you&apos;re on.
      </p>
    );
  }
  if (state === "held") {
    return (
      <p className="subscribe-done">
        Got your address. Email isn&apos;t switched on here yet &mdash; you&apos;ll get a
        confirmation link the moment it is.
      </p>
    );
  }
  if (state === "dupe") {
    return <p className="subscribe-done">You&apos;re already on the list.</p>;
  }

  return (
    <>
      <p className="subscribe-cap">{caption}</p>
      <form className="subscribe" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        {/* Honeypot: off-screen, not tabbable, no autofill. */}
        <input
          type="text"
          name="website"
          className="subscribe-hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
      {state === "error" && <span className="subscribe-err">Something went wrong — try again?</span>}
    </>
  );
}
