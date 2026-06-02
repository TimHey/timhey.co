import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE, SITE_URL, absolute } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: "%s — Tim Hey" },
  description: SITE.description,
  authors: [{ name: SITE.author, url: SITE_URL }],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": absolute("/feed.xml") },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", creator: "@timhey" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="text/markdown"
          href="/llms.txt"
          title="llms.txt"
        />
      </head>
      <body>
        <div className="wrap">
          <header className="site">
            <Link className="name" href="/">
              Tim Hey
            </Link>
            <nav>
              <Link href="/">Writing</Link>
              <Link href="/about">About</Link>
              <a href="/feed.xml">RSS</a>
            </nav>
          </header>
          {children}
          <footer className="site">
            <p>
              {SITE.role}. Field notes, not theory.{" "}
              <a href="/llms.txt">llms.txt</a> · <a href="/feed.xml">RSS</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
