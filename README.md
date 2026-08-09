# ICE WHISPERS™

A Nordic rune divination web app — Elder Futhark readings, built on your
existing ICE WHISPERS artwork. This is the core reading journey:

**Question → Draw → Flip → Reading → Free limit → $0.99 / $4.99 offer → Stripe → Waitlist**

Reading history and an admin panel are the next milestones (not in this build).

---

## Stack

- **Next.js 14** (App Router) — portable, GitHub-friendly, runs on Cloudflare Pages
- **Cloudflare Pages** — hosting (free tier is enough to start)
- **Supabase** (Postgres, free tier) — visitors, usage limits, entitlements, readings, waitlist
- **Stripe** — one-time top-up + subscription, test mode by default
- **AI reading engine** — currently a rule-based mock (see `lib/ai.ts`); swap in a real model later without touching any other file

Nothing here locks you into this chat, Claude Artifacts, or any Anthropic
product — it's a plain Next.js repo you own.

---

## 1. Local setup

```bash
npm install --legacy-peer-deps   # @cloudflare/next-on-pages' peer range lags Next's latest patch releases; safe to ignore
cp .env.example .env.local   # fill in Supabase + Stripe test keys (see below)
npm run dev
```

Open http://localhost:3000 — the reading flow works immediately using the
mock AI engine, once Supabase env vars are set (needed for the free-limit
check and reading history to work).

## 2. Supabase (database)

1. Create a free project at https://supabase.com
2. Open the SQL editor → paste the contents of `supabase/schema.sql` → run it
3. Project Settings → API → copy the **Project URL** and **service_role key**
   into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## 3. Stripe (test mode)

1. https://dashboard.stripe.com/test/apikeys → copy the secret key into `STRIPE_SECRET_KEY`
2. Once deployed, add a webhook endpoint at `https://yourdomain.com/api/stripe-webhook`
   listening for: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted` → copy its signing secret into `STRIPE_WEBHOOK_SECRET`
3. Test with Stripe's test card `4242 4242 4242 4242`, any future date/CVC
4. When ready to go live, swap the `sk_test_...` / `whsec_...` values for live ones —
   nothing else changes

## 4. Deploy to Cloudflare Pages

```bash
npm install -g wrangler   # if you don't have it
npm run pages:build       # builds via @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name=ice-whispers
```

Then in the Cloudflare dashboard, add the same environment variables from
`.env.local` to the Pages project (Settings → Environment variables), for
both Production and Preview.

Connect your own domain under Pages → Custom domains.

## 5. Connect an AI provider (when ready)

The app works today with a rule-based mock reading engine that already
follows the required answer → reading → guidance → whisper structure. To
upgrade to a real model:

1. Add `ANTHROPIC_API_KEY` (or your provider of choice) to your environment
2. In `lib/ai.ts`, uncomment and adjust the example fetch call inside
   `generateWithProvider`

That's the only file that needs to change — prompts are already kept
separate from UI/routing code, and only the current question + drawn
card(s) are sent per request (not the whole rune database, not
conversation history), to keep costs low.

## 6. Verify the artwork mapping

See `MAPPING.md` — a 5-minute visual check to confirm each numbered file
matches its rune name.

---

## What's built vs. what's next

**Built (core journey):**
- Question input, 3 spread types (Daily Rune free; Three Norns / Five Rune Cross gated to +)
- Server-side card draw using your real artwork
- Card back → flip → reveal animation
- Reading generation (mock engine, swappable) following the required answer-first structure
- Server-side enforced free daily limit (cannot be reset by refreshing)
- $0.99 top-up and $4.99/month subscription via Stripe Checkout (test mode)
- Stripe webhook granting entitlements
- Waitlist capture for the physical deck
- Full Supabase schema, including tables for readings and a future human-reader marketplace (not built, but the data model won't need a migration to add it)

**Not built yet (next milestones):**
- Reading history UI (data is already being stored in `readings`, just needs a page)
- Admin panel (rune/artwork/pricing management, waitlist export)
- Auth (currently anonymous-visitor-cookie based, which is enough for MVP; add Supabase Auth when you want people to log in across devices)
