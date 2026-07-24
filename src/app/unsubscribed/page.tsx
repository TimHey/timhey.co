import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed",
  robots: { index: false, follow: true },
};

export default async function Unsubscribed({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status !== "invalid";
  return (
    <main>
      <h1>{ok ? "You're unsubscribed" : "That link didn't work"}</h1>
      <p className="lede">
        {ok
          ? "Done, effective immediately. No confirmation step and no last-chance email."
          : "The link looks malformed. Reply to any post email and I'll remove you by hand."}
      </p>
      <p>
        <Link href="/">Back to the writing</Link>
      </p>
    </main>
  );
}
