"use client";

import { useState } from "react";

// Newsletter subscribe — a real conversion. How the visitor arrived (a ?via= tag or an AI referrer)
// is captured server-side by middleware into a first-party cookie; this form just posts the email,
// and /api/subscribe reads that cookie to attribute the signup to the agent. See src/middleware.ts.

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
    return <p style={{ margin: "1rem 0 0", fontSize: "0.9rem", opacity: 0.8 }}>Thanks — you&apos;re on the list.</p>;
  }

  return (
    <form onSubmit={submit} style={{ margin: "1rem 0 0", maxWidth: 380 }}>
      <label htmlFor="sub-email" style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", opacity: 0.8 }}>
        Get new posts by email
      </label>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <input
          id="sub-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, padding: "0.5rem 0.6rem", border: "1px solid currentColor", borderRadius: 6, background: "transparent", color: "inherit", font: "inherit", opacity: 0.9 }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          style={{ padding: "0.5rem 0.9rem", border: "1px solid currentColor", borderRadius: 6, background: "currentColor", color: "var(--bg, #fff)", font: "inherit", cursor: "pointer", mixBlendMode: "difference" }}
        >
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && <span style={{ fontSize: "0.8rem", color: "#dc2626" }}>Something went wrong — try again?</span>}
    </form>
  );
}
