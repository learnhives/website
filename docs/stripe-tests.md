# Stripe manual test plan — TEST mode only

Scope: trial, convert, cancel, failed card, and each Resend email.
Written from the code in `api/` (checkout, webhook, welcome email) and `app/signup.html`,
`app/pricing.html`, `app/dashboard.html`. Items marked **TO CONFIRM** could not be checked from the repo.

## 0. What the code actually does (read first)

| Piece | Behaviour |
| --- | --- |
| `api/stripe-checkout.js` | Needs a Supabase bearer token. Creates a Checkout Session, `mode: subscription`, card only, `trial_period_days: 30`, `metadata.userId` on the subscription. Success URL `https://www.learnhives.com/app/dashboard.html?subscribed=true`, cancel URL `.../app/pricing.html`. |
| `api/webhook.js` | Verifies the signature, then handles ONLY `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Each upserts one row in Supabase `subscriptions` (`user_id`, `stripe_customer_id`, `stripe_subscription_id`, `status`, `plan`, `current_period_end`, `cancel_at_period_end`, `updated_at`). Unknown price IDs give `plan = null`. A subscription without `metadata.userId` is skipped with a warning. |
| Price IDs | `family` = `price_1TfFyc0VmqypFEijoQfUW0PG`, `family_plus` = `price_1TfG0U0VmqypFEijqZrBOuF8` (in `api/webhook.js` and `app/pricing.html`). **TO CONFIRM** these are TEST-mode prices. |
| `api/send-welcome-email.js` | The only Resend email in the repo. Sent by `signup.html` right after `auth.signUp`, fire-and-forget. From `Buzz from LearnHives <hello@learnhives.com>`, subject `🐝 Welcome to LearnHives — your hive is ready!`. |
| Dashboard | Trial banner is static text ("30 days remaining"); the dashboard does not read the `subscriptions` table. **TO CONFIRM.** |

Known gaps this plan will expose (record results, do not fix here):
- No `invoice.payment_failed` / `invoice.paid` handler. Failed payments only show up as a `status` change via `customer.subscription.updated`.
- No Resend email for trial ending, payment failure, cancellation or receipt. Any such emails come from Stripe (if enabled in the Stripe dashboard), not from our code.
- No billing portal or cancel endpoint in the repo. Cancel is done from the Stripe dashboard in this plan.
- Pricing/signup pages say "no credit card required", but checkout collects a card up front.

## 1. Safety rules

- TEST mode only. Never use a real card. Every card below is a Stripe test card.
- Before starting, confirm in Vercel env vars that `STRIPE_SECRET_KEY` starts with `sk_test_` and `STRIPE_WEBHOOK_SECRET` is the secret of a TEST-mode webhook endpoint. If they are live keys, stop.
- Use a throwaway test user (for example a Gmail plus-address you control) and a Stripe test clock so you never wait 30 days.
- Do not run this once live keys are deployed (Day 31 in PLAN.md) unless it runs against a separate Vercel preview with its own test env vars.
- Stripe test dashboard: toggle "Test mode" on. Webhook endpoint (test mode) should point to `https://<domain>/api/webhook` and send the three events above.
- Local alternative: `vercel dev` plus `stripe listen --forward-to localhost:3000/api/webhook` (then use the CLI's printed `whsec_` as `STRIPE_WEBHOOK_SECRET` locally). The checkout success/cancel URLs are hardcoded to www.learnhives.com, so you are returned to the live site after paying.

Test cards:
| Card | Use |
| --- | --- |
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 0341` | Attaches fine, then FAILS when charged (use for failed renewal) |
| `4000 0000 0000 9995` | Declines: insufficient funds |
| `4000 0000 0000 0002` | Declines at checkout |
Any future expiry, any CVC, any postcode.

## 2. Setup checklist (do once per run)

1. Stripe: switch the dashboard to **Test mode**. (Optional: create a Test clock, see the note below.)
2. Create a new user on the site via `/app/signup.html` with your throwaway email. (This is also test E1 below.)
3. Verify the email in Supabase auth if confirmation is required, log in.
4. Note the user's `id` from Supabase Auth → Users. You'll check `subscriptions` rows by this `user_id`.
5. Open three tabs: Stripe test dashboard (Payments and Webhooks → Event deliveries), Supabase table editor `subscriptions`, Vercel function logs for `api/webhook`.

Note on time travel: `api/stripe-checkout.js` lets Stripe create the customer, so that customer is not on a test clock. The simple way to skip the 30-day trial is Stripe dashboard → the subscription → **End trial now** (used in T2 and T4). Test clocks only help if you create the customer and subscription by hand in the Stripe dashboard with a clock attached. **TO CONFIRM** which route works in your account.

## 3. Tests

Mark each: PASS / FAIL / NOTES. Always check, after each step: (1) Stripe event shows `200` delivery, (2) the `subscriptions` row, (3) Vercel log has no "Webhook handler error".

### T1 — Start trial (checkout)
1. Logged in, open `/app/pricing.html`. Click **Start free trial** on Family.
2. Expect a redirect to Stripe Checkout showing the 30-day trial ($0 due today).
3. Pay with `4242 4242 4242 4242`.
4. Expect redirect to `dashboard.html?subscribed=true`.
5. Expect Stripe events `checkout.session.completed` and `customer.subscription.created` (created is not handled; that's expected) and a `subscriptions` row: `status = trialing`, `plan = family`, `current_period_end` about 30 days out, `cancel_at_period_end = false`, correct `stripe_customer_id` / `stripe_subscription_id`.
6. Repeat with a second user on **Family Plus**: `plan = family_plus`.
7. Negative: logged out, call `POST /api/stripe-checkout` with no token → `401`. Logged in with an empty body → `400`.
8. Negative: pay with `4000 0000 0000 0002` at checkout → Stripe shows a decline, no row is written.
9. Cancel at checkout (Stripe's back arrow) → returned to `pricing.html`, no row written.

### T2 — Convert (trial → paid)
1. Use the trialing subscription from T1.
2. Stripe dashboard → the subscription → **End trial now** (or advance a test clock past the trial end, if the customer is on one).
3. Expect Stripe events: `customer.subscription.updated` (trialing → active), invoice created/paid.
4. Expect row: `status = active`, `current_period_end` moved about one month forward, `plan` unchanged.
5. Check the invoice in Stripe is paid with the test card ($9.99 Family / $14.99 Family Plus).

### T3 — Cancel
1. Stripe dashboard → subscription → **Cancel** → "at end of billing period".
2. Expect `customer.subscription.updated`; row: `status` still `active` (or `trialing`), `cancel_at_period_end = true`.
3. Undo the cancel (Stripe: "Don't cancel") → row returns to `cancel_at_period_end = false`.
4. Cancel immediately (Stripe: **Cancel immediately**) → expect `customer.subscription.deleted`; row: `status = canceled`.
5. Also test cancelling during the trial → row `canceled`.
6. Check what the dashboard shows after cancel (record result; currently expected to be unchanged — TO CONFIRM).

### T4 — Failed card
1. Create a new trial via T1 but pay with `4000 0000 0000 0341` (attaches, fails on charge).
2. End the trial (T2 step 2). The first charge fails.
3. Expect `customer.subscription.updated` with `status = past_due` (or `incomplete`/`unpaid` depending on Stripe settings). Row `status` mirrors it.
4. Stripe retries per its dunning settings; in the dashboard use **Retry payment** with the failing card (fails again), then update the payment method to `4242 4242 4242 4242` and retry → expect `status = active`.
5. If retries are exhausted → `status = unpaid`/`canceled` and `customer.subscription.deleted` per your Stripe settings. **TO CONFIRM** the dunning settings.
6. Also test `4000 0000 0000 9995` (insufficient funds) once.
7. Record: does the user see ANY message in the app or email? (Expected: no, see gaps in section 0.)

### T5 — Webhook robustness
1. Stripe dashboard → webhook endpoint → **Resend** a delivered event twice → row unchanged (upsert is idempotent).
2. Send a request to `/api/webhook` with a bad `stripe-signature` → `400`. GET request → `405`.
3. Subscription without `userId` metadata (create one by hand in the Stripe dashboard) → webhook returns `200`, no row, log line "Subscription missing userId in metadata, skipping".
4. Subscribe a user a second time → still one row per user (`onConflict: user_id`). Record which subscription wins.

## 4. Resend emails

Only one exists in code. Confirm for each: it arrives, lands in inbox (not spam), links work, renders in Gmail web, Apple Mail on iPad/iPhone, and dark mode.

### E1 — Welcome email (the only Resend email in the repo)
1. Sign up with a new email at `/app/signup.html`.
2. Within about a minute expect: from `Buzz from LearnHives <hello@learnhives.com>`, subject `🐝 Welcome to LearnHives — your hive is ready!`, greeting "Hi <FirstName>! 👋".
3. The CTA "Go to your dashboard" → `https://learnhives.com/app/dashboard.html`. Footer link → learnhives.com.
4. Check Resend dashboard → Emails: status Delivered. Check SPF/DKIM show as passing in the message headers (Gmail → Show original).
5. Edge cases: name with `<script>` or `&` (should be escaped); no name (should say "Hi there!"); only first word of the name is used.
6. API checks: `POST /api/send-welcome-email` with an invalid email → `400`; GET → `405`.
7. Known: the email is sent even if signup later needs email confirmation, and even if the email is already registered (Supabase may return no error). Record what happens. **TO CONFIRM.**
8. Copy check: the email says "Four bee characters cover Letters, Numbers, Colors, and Nature", which is out of date versus the 14-subject site.

### E2 — Trial, payment and cancellation emails
There are NO Resend emails for these in the repo. For each of T1–T4, record whether any email arrives, and from where:
| Event | Expected from our code | Observed |
| --- | --- | --- |
| Trial started | none | |
| Trial ending soon | none | |
| First payment / receipt | none (Stripe receipts only if enabled in Stripe settings) | |
| Payment failed | none | |
| Subscription cancelled | none | |
If any of these should be Resend emails, that is new work for TASKS.md; do not build it from this plan. In Stripe test mode, Stripe only emails customers in some cases; use the Stripe dashboard's email settings to check. **TO CONFIRM.**

## 5. Results log

| Test | Date | Tester | Result | Notes / Stripe event IDs |
| --- | --- | --- | --- | --- |
| T1 Start trial | | | | |
| T2 Convert | | | | |
| T3 Cancel | | | | |
| T4 Failed card | | | | |
| T5 Webhook robustness | | | | |
| E1 Welcome email | | | | |
| E2 Other emails | | | | |

## 6. Sign-off before going live (Day 31)
- [ ] All T and E tests above pass or have a written decision on each gap in section 0.
- [ ] Price IDs in `api/webhook.js` and `app/pricing.html` replaced by LIVE price IDs.
- [ ] Vercel env vars swapped to live keys and a LIVE webhook endpoint created with a new `STRIPE_WEBHOOK_SECRET`.
- [ ] "No credit card required" copy reconciled with the checkout behaviour.
