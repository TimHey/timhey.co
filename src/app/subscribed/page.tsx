import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false, follow: true },
};

const COPY: Record<string, { h1: string; body: string }> = {
  ok: {
    h1: "You're on the list",
    body: "One post a week, starting with the next one. Reply to any of them if you want to argue with something.",
  },
  already: {
    h1: "Already confirmed",
    body: "This address was on the list. Nothing changed.",
  },
  invalid: {
    h1: "That link didn't work",
    body: "Confirmation links expire after seven days. Subscribe again and a fresh one will arrive.",
  },
};

export default async function Subscribed({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const copy = COPY[status ?? "ok"] ?? COPY.ok;
  return (
    <main>
      <h1>{copy.h1}</h1>
      <p className="lede">{copy.body}</p>
      <p>
        <Link href="/">Back to the writing</Link>
      </p>
    </main>
  );
}
