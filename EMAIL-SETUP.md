# Newsletter setup checklist

The code is built and tested. Nothing sends until steps 3 and 5 are done, so you can work through
this at any pace. Order matters: DNS has to verify before a send will succeed.

**Where DNS actually lives:** timhey.co is registered at **Squarespace** (Key-Systems GmbH is their
reseller of record). The `ns-cloud-b1..b4.googledomains.com` nameservers are left over from
Squarespace acquiring Google Domains — they are *not* a Google Cloud DNS project you can log into.
Records are edited in the Squarespace domains console. Decision below is to move this to Cloudflare,
where pickrate.io and purelysearch.com already are.

---

## 0. Move DNS to Cloudflare first

Do this before touching any email record, so that if mail or the site breaks you know which change
did it. Migration carries the existing records; nothing about email changes yet.

**Current records, as observed live.** Everything here has to exist at Cloudflare before the
nameserver switch:

| type | name | value | note |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | Vercel. **DNS only, grey cloud** |
| CNAME | `www` | `cname.vercel-dns.com` | Vercel. **DNS only, grey cloud** |
| MX | `@` | `aspmx.l.google.com` (1) | Google Workspace |
| MX | `@` | `alt1.aspmx.l.google.com` (5) | |
| MX | `@` | `alt2.aspmx.l.google.com` (5) | |
| MX | `@` | `alt3.aspmx.l.google.com` (10) | |
| MX | `@` | `alt4.aspmx.l.google.com` (10) | |
| A | `*` | `199.34.228.47` | old Squarespace site — see below |
| A | `mail` | `216.21.224.199` | Squarespace — see below |
| CNAME | `_domainconnect` | `_domainconnect.domains.squarespace.com` | Squarespace plumbing |

- [ ] Add timhey.co at Cloudflare, let it scan, then **compare against the table above** and add
      anything it missed. Cloudflare's scanner guesses common names; it cannot enumerate a zone.
- [ ] Set the root A and the www CNAME to **DNS only (grey cloud)**. Proxying in front of Vercel
      causes certificate and redirect problems.
- [ ] Change nameservers at Squarespace to the two Cloudflare gives you
- [ ] Wait for Cloudflare to show Active (usually under an hour, can be 24)

**Two records worth dropping rather than carrying**, both pointing at a Squarespace site that isn't
the live site any more. Decide deliberately, don't copy them by reflex:

- The `*` wildcard means every nonexistent subdomain resolves to Squarespace. That is why
  `anything.timhey.co` currently returns a page. Dropping it makes typos fail cleanly, which is what
  you want once real subdomains exist.
- `mail.timhey.co` is a Squarespace record, unrelated to Google Workspace mail delivery (which runs
  entirely off the MX records above). Dropping it does not affect your email.

Verify after the switch, before going further:

```
dig +short NS timhey.co          # cloudflare
dig +short A timhey.co           # 76.76.21.21
dig +short CNAME www.timhey.co   # cname.vercel-dns.com
dig +short MX timhey.co          # the five google records
```

- [ ] Load https://www.timhey.co and confirm the site is up
- [ ] Send yourself an email at your timhey.co address and confirm it arrives

## 1. Fix the root domain's email records

These are missing today. Worth doing whether or not the newsletter ships: with no SPF and no DMARC,
nothing declares who is allowed to send as timhey.co.

At Cloudflare, on the **timhey.co** zone. No quotes around any value.

- [ ] **TXT** on `@` (root) → `v=spf1 include:_spf.google.com ~all`
- [ ] **TXT** on `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:tim@timhey.co`

Start at `p=quarantine`. Move to `p=reject` later, once the DMARC reports show clean.

Verify:

```
dig +short TXT timhey.co
dig +short TXT _dmarc.timhey.co
```

## 2. Add the sending subdomain at Resend

Use the existing Pickrate account — Resend allows many domains per account, and the free tier's
3,000/month and 100/day are shared across them. Plenty for both at current volume.

- [ ] Resend → Domains → Add Domain → `send.timhey.co`, region us-east-1
- [ ] Copy the three records it shows into **Cloudflare**, on the timhey.co zone. Set all three to
      **DNS only (grey cloud)** — a proxied TXT or MX record breaks verification:
  - MX on `send` → `feedback-smtp.us-east-1.amazonses.com`, priority 10
  - TXT on `send` → `v=spf1 include:amazonses.com ~all`
  - TXT on `resend._domainkey.send` → the long DKIM value Resend shows you
- [ ] Click Verify in Resend, wait for green

Using a subdomain keeps newsletter reputation separate from your Google Workspace mail on the root.
Same split as pickrate.io.

Gotcha you have hit twice before: paste values **without** surrounding quotes, and make sure you are
editing the `send` row, not the root row.

Note that Cloudflare appends the zone automatically. Entering `send` gives you `send.timhey.co`;
entering `send.timhey.co` gives you `send.timhey.co.timhey.co`.

Verify:

```
dig +short TXT send.timhey.co
dig +short MX send.timhey.co
dig +short TXT resend._domainkey.send.timhey.co
```

## 3. Get a Resend API key

The existing Pickrate key will not work here — it came back `restricted_api_key`, meaning
send-only and scoped to that domain. This needs its own.

- [ ] Resend → API Keys → Create, permission **Sending access**, domain `send.timhey.co`
- [ ] Keep it out of chat and out of the repo. It goes straight into Vercel in step 5.

Scoping the key to this one domain means a leak from this site can't send as pickrate.io.

## 4. Decide on a postal address

CAN-SPAM requires a real physical mailing address in bulk email. I did not invent one.

- [ ] Get a PO box, or pick the address you're willing to publish

The footer of every post email prints whatever you set. A mailing list is public enough that a home
address is worth avoiding.

## 5. Set the Vercel env vars

Project → Settings → Environment Variables, Production.

Already set:

- [x] `NEWSLETTER_SECRET` — generated and stored encrypted, never printed anywhere. Signs confirm and
      unsubscribe links. **Never rotate it after launch** or every unsubscribe link in every
      already-delivered email stops working, which is how you collect spam complaints.
- [x] `CRON_SECRET` — generated and stored encrypted. Vercel sends this to the cron route; without it
      the route returns 401 to everyone, including Vercel.

Still needed:

- [ ] `RESEND_API_KEY` → from step 3. Add it yourself so the value never lands in a transcript:

      npx vercel env add RESEND_API_KEY production

      then paste at the prompt. In a Claude Code session, prefix with `!` to run it here.

- [ ] `NEWSLETTER_POSTAL_ADDRESS` → from step 4
- [ ] `NEWSLETTER_ENABLED` → `1` **(do this last — it's the arming switch)**
- [ ] Optional but recommended: `NEWSLETTER_REPLY_TO` → `tim@timhey.co`, so replies reach your inbox
      instead of a send-only subdomain

Env changes only take effect on a new deploy. Redeploy after the last one.

Optional:

- `NEWSLETTER_FROM` → defaults to `Tim Hey <tim@send.timhey.co>`
- `NEWSLETTER_REPLY_TO` → set to `tim@timhey.co` so replies land in your normal inbox

## 6. Deploy and check the wiring

- [ ] Deploy (the cron in `vercel.json` registers on deploy — confirm it appears under
      Project → Settings → Cron Jobs)
- [ ] Subscribe with your own address on the live site
- [ ] Confirm the email arrives, click the link, land on `/subscribed`
- [ ] Click unsubscribe in a post email later and confirm `/unsubscribed`
- [ ] Send yourself a test through Resend and run it through
      [mail-tester.com](https://www.mail-tester.com) — wants 9/10 or better
- [ ] Mail confirmation links to anyone who signed up before sending worked:

```
node --experimental-strip-types scripts/invite-pending.ts          # dry run
node --experimental-strip-types scripts/invite-pending.ts --send
```

Until sending is on, the form tells people their address is held and a confirmation link will follow
rather than claiming an email is on its way. That script is what makes good on it. It skips anyone
already confirmed or unsubscribed.

The first cron run after deploy adopts all currently-published posts as already-sent and mails
nobody. That is deliberate, and it means turning this on cannot blast the back catalogue. The first
real send will be the next post that goes live.

---

## How it behaves once it's on

- Cron runs daily at **13:00 UTC (9am ET)**. Posts go live at 00:00 UTC, so a Thursday post mails
  Thursday morning rather than Wednesday evening.
- Only posts dated within the last 2 days are eligible, so editing an old post can't mail it.
- A post is claimed before the first send, so overlapping runs can't double-send.
- If Resend is down and every send fails, the post is un-claimed and retried the next day. A partial
  success is not retried, because that would double-mail everyone who already got it.
- Only confirmed subscribers are ever mailed.

## Turning it off

Set `NEWSLETTER_ENABLED` to anything but `1`. Takes effect on the next cron run, no deploy needed.

## Where the data lives

Upstash Redis, same store as the agent traffic log:

| key | what |
| --- | --- |
| `subscribers` | everyone who submitted the form, confirmed or not |
| `subscribers:confirmed` | the actual mailing list |
| `subscribers:unsubscribed` | opted out |
| `subscriber:<email>` | source, attribution, timestamps |
| `subscribers:by-source` | which placement converted (home / post / agents) |
| `subscribers:by-attribution` | which agent or referrer gets credit |
| `newsletter:sent` | slugs already mailed |
| `newsletter:log` | last 100 send results |
