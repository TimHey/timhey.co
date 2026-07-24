# Newsletter setup checklist

The code is built and tested. Nothing sends until steps 3 and 5 are done, so you can work through
this at any pace. Order matters: DNS has to verify before a send will succeed.

**Important:** this domain is on **Google Cloud DNS** (`ns-cloud-b1..b4.googledomains.com`), not
Cloudflare. pickrate.io and purelysearch.com are Cloudflare; this one isn't. Different console.

---

## 1. Fix the root domain's email records

These are missing today. Worth doing whether or not the newsletter ships: with no SPF and no DMARC,
nothing declares who is allowed to send as timhey.co.

At Google Cloud DNS, on the **timhey.co** zone. No quotes around any value.

- [ ] **TXT** on `timhey.co` (root) → `v=spf1 include:_spf.google.com ~all`
- [ ] **TXT** on `_dmarc.timhey.co` → `v=DMARC1; p=quarantine; rua=mailto:tim@timhey.co`

Start at `p=quarantine`. Move to `p=reject` later, once the DMARC reports show clean.

Verify:

```
dig +short TXT timhey.co
dig +short TXT _dmarc.timhey.co
```

## 2. Add the sending subdomain at Resend

- [ ] Create the Resend account (or reuse the Pickrate one)
- [ ] Add domain `send.timhey.co`
- [ ] Copy the three records Resend shows you into **Google Cloud DNS**:
  - MX on `send.timhey.co` → `feedback-smtp.us-east-1.amazonses.com` (priority 10)
  - TXT on `send.timhey.co` → `v=spf1 include:amazonses.com ~all`
  - TXT on `resend._domainkey.send.timhey.co` → the long DKIM value Resend gives you
- [ ] Click Verify in Resend, wait for green

Using a subdomain keeps newsletter reputation separate from your Google Workspace mail on the root.
Same split as pickrate.io.

Gotcha you have hit twice before: paste values **without** surrounding quotes, and make sure you are
editing the `send.timhey.co` row, not the root row.

Verify:

```
dig +short TXT send.timhey.co
dig +short MX send.timhey.co
dig +short TXT resend._domainkey.send.timhey.co
```

## 3. Get a Resend API key

- [ ] Resend → API Keys → create one with send permission
- [ ] Keep it out of chat and out of the repo. It goes straight into Vercel in step 5.

## 4. Decide on a postal address

CAN-SPAM requires a real physical mailing address in bulk email. I did not invent one.

- [ ] Get a PO box, or pick the address you're willing to publish

The footer of every post email prints whatever you set. A mailing list is public enough that a home
address is worth avoiding.

## 5. Set the Vercel env vars

Project → Settings → Environment Variables, Production. Add the first four, confirm things work,
then add the last one.

- [ ] `RESEND_API_KEY` → from step 3
- [ ] `NEWSLETTER_SECRET` → generate with `openssl rand -hex 32`. Signs confirm and unsubscribe
      links. **Never change it after launch** or every unsubscribe link in every already-delivered
      email stops working.
- [ ] `CRON_SECRET` → `openssl rand -hex 32`. Vercel sends this to the cron route; without it the
      route returns 401 to everyone, including Vercel.
- [ ] `NEWSLETTER_POSTAL_ADDRESS` → from step 4
- [ ] `NEWSLETTER_ENABLED` → `1` **(do this last — it's the arming switch)**

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
