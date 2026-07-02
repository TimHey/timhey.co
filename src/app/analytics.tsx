"use client";

import Script from "next/script";

// GA4. The measurement ID is a public identifier (it ships in the served HTML),
// not a secret, so it lives in the environment rather than the repo — that keeps
// it configurable and keeps local dev and preview deploys out of production
// analytics. When NEXT_PUBLIC_GA_ID is unset, this renders nothing.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
