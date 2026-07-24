"use client";

import { useState } from "react";

// Newsletter subscribe — a real conversion. How the visitor arrived (a ?via= tag or an AI referrer)
// is captured server-side by middleware into a first-party cookie; this form just posts the email,
// and /api/subscribe reads that cookie to attribute the signup. See src/middleware.ts.

type State = "idle" | "loading" | "done" | "error";

export function Subscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="subscribe-done">Thanks — you&apos;re on the list.</p>;
  }

  return (
    <>
      <p className="subscribe-cap">Get new posts by email.</p>
      <form className="subscribe" onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </form>
      {state === "error" && <span className="subscribe-err">Something went wrong — try again?</span>}
    </>
  );
}
