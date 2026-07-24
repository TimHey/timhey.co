"use client";

import { useEffect, useState } from "react";

// Newsletter subscribe — a real conversion. On first arrival it remembers how the visitor got here
// (an ?via= tag or the referring host, first-touch-wins), and on submit it sends that along so
// Pickrate can attribute the signup to the agent that referred them. See /api/subscribe.

const FT_COOKIE = "pr_ft";

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name: string, value: string, days = 180) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

type State = "idle" | "loading" | "done" | "error";

export function Subscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  // First-touch-wins: record the arrival source once, so it survives across pages until they subscribe.
  useEffect(() => {
    if (getCookie(FT_COOKIE)) return;
    const via = new URLSearchParams(window.location.search).get("via") ?? "";
    const ref = document.referrer ? hostOf(document.referrer) : "";
    if (via || (ref && ref !== window.location.host)) {
      setCookie(FT_COOKIE, JSON.stringify({ via, ref }));
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "loading") return;
    setState("loading");
    let ft: { via?: string; ref?: string } = {};
    try {
      ft = JSON.parse(getCookie(FT_COOKIE) ?? "{}");
    } catch {
      /* no first-touch */
    }
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), via: ft.via, ref: ft.ref }),
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
      {state === "error" && (
        <span style={{ fontSize: "0.8rem", color: "#dc2626" }}>Something went wrong — try again?</span>
      )}
    </form>
  );
}
