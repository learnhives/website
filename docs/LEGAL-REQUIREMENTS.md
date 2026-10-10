# LearnHives — Legal & Compliance Requirements

> **Status:** working register, not legal advice. Every item marked `[VERIFY]` must be confirmed by a lawyer (India + UAE) before taking payment from families.
> **Owner:** Abhi · **Created:** 2026-10-11 · **Review:** before every launch milestone and whenever data, payments, Buzz or third-party services change.

---

## 0. How to use this file (rules for Claude Code and for Abhi)

1. **Read this file before any change that touches:** sign-up/login, child profiles, progress tracking, Buzz (AI), payments, emails, analytics, third-party scripts/fonts, or what data is stored.
2. **Never add a new data field, third-party service or tracking script** without (a) adding it to Section 4 (Data inventory) and Section 5 (Third parties) and (b) Abhi's approval.
3. **If a change conflicts with a requirement here, stop and ask.** Do not work around it.
4. Update the **Checklist (Section 8)** status when something is built. Add a line to the **Change log (Section 11)**.

---

## 1. Business facts that decide which laws apply

| Fact | Value | Source |
|---|---|---|
| Company registration | India `[VERIFY entity type]` | Abhi |
| Operated from | UAE (Dubai, moving to RAK) | Abhi |
| Launch markets | UAE and India | Abhi, 2026-10-11 |
| Users | Parents (adults) create accounts; children aged **2–6** use the app | Product |
| Database | Supabase, **Tokyo region** (cross-border storage) | Stack |
| Hosting | Vercel | Stack |
| Payments | Stripe (UAE account, currently sandbox) | Stack |
| Email | Resend (transactional), Zoho (business mail) | Stack |
| AI | Anthropic Claude API via `/api/claude-proxy` (Buzz) | Stack |

---

## 2. Laws that apply

### 2.1 India — Digital Personal Data Protection (DPDP) Act 2023 + DPDP Rules 2025
- **Child = anyone under 18.**
- **Verifiable parental consent** required *before* processing any child's personal data (Sec. 9; Rule 10). A simple "I am over 18" checkbox is **not** enough. The parent's adulthood/identity must be verified reliably (e.g. DigiLocker-style tokens or equivalent). `[VERIFY acceptable method for a small EdTech]`
- **Banned:** tracking or behavioural monitoring of children, targeted advertising to children, processing likely to harm a child. EdTech engagement analytics is named as affected.
- **Education exemption (Rule 12)** covers schools/educational institutions and narrow purposes. **Assume LearnHives does NOT qualify.**
- Parents must be able to **access, correct, erase** data and **withdraw consent** as easily as they gave it.
- **Delete data** once its purpose is served (notice before erasure under Rule 8).
- Clear **privacy notice**, a **grievance contact**, and **breach notification** to the Data Protection Board and affected users. `[VERIFY timelines]`
- Penalties for children's-data violations up to **₹200 crore**.
- Phased commencement; full obligations expected by **May 2027**. `[VERIFY exact dates]`

### 2.2 UAE — Child Digital Safety Law (Federal Decree-Law No. 26 of 2025)
- In force **1 Jan 2026**; platforms must comply **by Jan 2027** (unless extended by Cabinet).
- **Child = under 18.** Covers apps/websites/games targeting UAE users.
- For children **under 13**: no collecting/processing/sharing personal data without **verifiable parental consent**, easy withdrawal, clear privacy disclosures. No commercial use or targeted ads.
- **Age verification** proportionate to risk.
- **Enhanced protection:** privacy-by-default, age ratings, parental controls, reporting channel, removal of harmful content.
- Possible Cabinet exemption for education platforms. **Do not rely on it.** `[VERIFY]`

### 2.3 UAE — Personal Data Protection Law (Federal Decree-Law No. 45 of 2021)
- General data-protection duties: lawful basis, purpose limitation, security, data-subject rights, cross-border transfer rules. `[VERIFY status of executive regulations]`

### 2.4 Cross-border transfer
- Children's data from UAE and India is stored in **Tokyo** (Supabase). Disclosure or other safeguards may be required under DPDP and UAE PDPL. `[VERIFY with lawyer; consider moving region before launch]`

### 2.5 Payments, subscriptions & consumer law `[VERIFY all]`
- Clear price, trial length, what happens at trial end, how to cancel, before the parent commits.
- Free trial with **no card** (decided). If cards are collected later, show renewal terms and send reminders before charging.
- Easy cancellation from the parent dashboard. Refund policy published.
- India: recurring card payments fall under RBI e-mandate rules (Stripe handles most of this).
- Tax: GST (India) / VAT (UAE) registration and invoicing thresholds. `[VERIFY with accountant]`

### 2.6 AI provider terms (Anthropic)
- Products serving minors must have **age-appropriate safeguards**. `[VERIFY current Anthropic usage policy wording]`
- Buzz must never collect personal details from the child; outputs filtered to be child-safe; parent informed in the privacy notice that an AI assistant is used.

### 2.7 Content & intellectual property
- Images: DALL-E generated (check OpenAI terms on ownership/commercial use), processed with remove.bg.
- Animal sound clips: use **CC0** or properly licensed; record licence + attribution in Section 10.
- Fonts: confirm licences (Baloo 2 etc. are open licence). **Self-host** (see Section 5).
- "LearnHives" and "Buzz the Bee": trademark search/registration. `[VERIFY]`

---

## 3. Product decisions already made (do not reverse without Abhi)

| # | Decision | Date |
|---|---|---|
| D1 | No ads, no third-party analytics, no profiling of children | 2026-10-11 |
| D2 | Progress shown **only to the parent**: lessons done, stars, active minutes per day | 2026-10-11 |
| D3 | No free text from the child stored; no device or location data | 2026-10-11 |
| D4 | Raw session data deleted after **12 months**; daily totals kept | 2026-10-11 |
| D5 | Parent "delete my child's data" function | 2026-10-11 |
| D6 | Parental consent flag + timestamp + policy version on parent profile, set at sign-up; existing parents asked at next login | 2026-10-11 |
| D7 | Kid Mode exit needs a 4-digit parent PIN (hashed, lockout after 5 tries) | 2026-10-11 |
| D8 | **Child voice input OFF** at launch: Buzz speaks, child taps chips; no free-text typing for children | 2026-10-11 |
| D9 | Free trial with **no credit card** at launch | 2026-10-10 |
| D10 | Row-level security: a parent can only ever see their own children | 2026-10-11 |
| D11 | Content rules per `docs/pedagogy-rubric.md` (no scary content, no pig/pork/beef, British English, etc.) | 2026-10-10 |

---

## 4. Data inventory (everything we store)

| Data | About | Where | Why | Kept for |
|---|---|---|---|---|
| Email, password (hashed by Supabase Auth) | Parent | Supabase `auth` | Login | Until account deleted |
| Parent profile, consent flag/timestamp/policy version | Parent | `parent_profiles` | Consent record | Account life + `[VERIFY legal retention]` |
| Child first name / nickname, stage | Child | `children` | Personalise lessons | Until deleted by parent |
| Lesson progress: subject, stage, item, stars, date | Child | `lesson_progress` | Parent progress view | Until deleted by parent |
| Sessions: date, active minutes | Child | `lesson_sessions` | Parent progress view | Raw 12 months; daily totals kept |
| Hashed Kid Mode PIN | Parent | `parent_profiles` | Exit lock | Account life |
| Subscription status, Stripe customer ID | Parent | `subscriptions` | Billing | `[VERIFY tax/accounting retention]` |
| Buzz chip prompts sent to AI | Child (indirect) | Not stored by us; sent to Anthropic API | Buzz replies | Not stored by us |

**Must NOT be stored:** child's surname, date of birth, photo, voice, free text, school, location, device identifiers.

---

## 5. Third parties (processors)

| Service | Receives | Location | Notes |
|---|---|---|---|
| Supabase | All account + progress data | Tokyo | Cross-border transfer `[VERIFY]` |
| Vercel | Requests, IP addresses (logs) | Global | Check that Vercel Analytics / Speed Insights are **off** or disclosed (D1) |
| Stripe | Parent payment data | Global | Parent only, never child data |
| Resend | Parent email address | `[VERIFY]` | Transactional only, no marketing to children |
| Anthropic | Buzz prompts (no personal data) | US | Proxy must strip any personal data |
| Google Fonts | Visitor IP address on page load | Google | **Self-host fonts** to remove this third party |
| Browser speech engines | Spoken text (Buzz output) | Device / Apple / Google | Output only; child voice input is OFF (D8) |

---

## 6. Required pages & notices

- [ ] Privacy notice for parents (plain language, UAE + India), incl. what is collected, why, retention, third parties, cross-border storage, AI use, rights, grievance contact
- [ ] Children's-data section explaining parental consent and what we never collect
- [ ] Terms of service (subscription, trial, cancellation, refunds)
- [ ] Cookie/storage notice (if any non-essential storage is used)
- [ ] Grievance officer / contact details `[VERIFY requirement under DPDP]`
- [ ] Content-reporting channel (UAE child safety law)

---

## 7. Security requirements

- RLS on every table holding child data (D10); verified with tests V1–V13 in `docs/engine-v2-sql.md`
- No secret keys in front-end code; secrets only in Vercel env vars
- Stripe live keys **Production only**; sandbox keys on Preview
- Rate limiting + JWT verification on API routes (done in earlier security audit)
- Breach-response plan: who to notify, by when `[VERIFY timelines]`
- Kid Mode PIN hashed, lockout after 5 tries (D7)

---

## 8. Compliance checklist

| # | Requirement | Law | Status |
|---|---|---|---|
| C1 | Verifiable parental consent before child data is created | DPDP, UAE CDS | Planned (D6), method `[VERIFY]` |
| C2 | Consent withdrawal + data deletion by parent | DPDP, UAE CDS | Planned (D5) |
| C3 | No tracking/profiling/ads for children | DPDP, UAE CDS | Decided (D1) |
| C4 | Data minimisation (Section 4) | DPDP, PDPL | Planned |
| C5 | Retention limits (12 months raw) | DPDP | Planned (D4), needs `pg_cron` |
| C6 | Privacy notice + terms published | All | Not started |
| C7 | Self-host fonts (remove Google Fonts) | DPDP, PDPL | Not started |
| C8 | Vercel analytics off or disclosed | DPDP, PDPL | To check |
| C9 | Cross-border storage reviewed (Tokyo) | DPDP, PDPL | Lawyer |
| C10 | Age gate: account holder is an adult | DPDP, UAE CDS | Not started |
| C11 | Parental controls + reporting channel | UAE CDS | Partly (PIN); reporting not started |
| C12 | Buzz safety: no personal-data questions, child-safe prompt, no child free text | AI terms, UAE CDS | Partly (prompt rules added on Farm Animals) |
| C13 | Subscription terms, cancellation, refund policy | Consumer law | Not started |
| C14 | Tax registration (GST/VAT) | Tax | Accountant |
| C15 | IP: image, sound, font licences recorded | Copyright | Not started |
| C16 | Trademark: LearnHives, Buzz the Bee | IP | Not started |
| C17 | Lawyer review completed (India + UAE) | All | **Must be done before first paying family** |
| C18 | **Audit — undeclared third party:** `cdn.jsdelivr.net` serves `@supabase/supabase-js@2` (unpinned version) to the browser on dashboard, login, signup, reset and pricing (`app/*.html`). It receives each visitor's IP address and is not listed in Section 5. Self-host or pin the version, or add it to Section 5. | DPDP, PDPL | Found in audit |
| C19 | **Audit — fonts:** Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) loads on index, dashboard, login, signup, reset, pricing and all three lesson pages (10 files). Confirms C7. No other external scripts, analytics, ads or pixels found in tracked code (C8: nothing in code; the Vercel dashboard setting still has to be checked by hand). | DPDP, PDPL | Found in audit |
| C20 | **Audit — child free text and voice are live:** the lesson pages have a typed Buzz chat box (`js/lesson-engine.js:358`) and a microphone button using the browser's speech recognition (`:394-400`). A child's typed or spoken words go to `/api/claude-proxy` and on to Anthropic. Not stored by us, but contradicts D3 and D8 and the Section 5 note that child voice input is OFF. The lesson pages are not linked from the dashboard, but they are public URLs and have no login check. | DPDP, UAE CDS | Found in audit |
| C21 | **Audit — `/api/claude-proxy` has no JWT check:** it only checks the `Origin` header (requests with no Origin pass) and an in-memory limit of 5 requests per IP per minute (`api/claude-proxy.js:53-70`). Section 7 says JWT verification on API routes is done; only `api/stripe-checkout.js` does it. Anyone can call Buzz without an account. | Security, AI terms | Found in audit |
| C22 | **Audit — `/api/send-welcome-email` has no auth:** anyone can POST any email address and name and Resend sends a welcome email to that address (`api/send-welcome-email.js:10-22`). Spam-relay and unsolicited-email risk. | DPDP, PDPL, Security | Found in audit |
| C23 | **Audit — Buzz safety prompt:** the proxy ignores the `system` prompt sent by the lesson pages and always uses its own fixed `SYSTEM_PROMPT` (`api/claude-proxy.js:5-9`). The per-lesson rules (e.g. Farm Animals "never ask for personal details") never reach the model, and the fixed prompt has no such rule. C12's "Partly" is overstated. | AI terms, UAE CDS | Found in audit |
| C24 | **Audit — fields written to Supabase vs Section 4:** `auth.users.user_metadata.full_name` (parent's full name, `app/signup.html:123-128`); `children.age` (whole years) and `children.character` (avatar) as well as `name` (`app/dashboard.html:277-281`); `subscriptions.stripe_subscription_id`, `plan`, `current_period_end`, `cancel_at_period_end`, `updated_at` (`api/webhook.js:69-82`). None of these are listed in Section 4, which names only status and Stripe customer ID. Decide: add to Section 4, or stop collecting. | DPDP, PDPL | Found in audit |
| C25 | **Audit — child name is unvalidated free text:** the parent can type anything, including a surname, into `children.name` (`app/dashboard.html:274-279`). Section 4 says first name or nickname only. Also, `child.name` is inserted into the page unescaped (`:247`), so it is a script-injection risk. | DPDP, Security | Found in audit |
| C26 | **Audit — progress is in the browser, not Supabase:** no code writes lesson progress to Supabase today. Progress is kept in `localStorage` under `lh_progress_<lesson>_<item>_<stage>` (seen cards, answered questions, story done, completed, timestamp) (`js/lesson-engine.js:452-463`). Supabase also keeps the login session in browser storage by default. Neither is in Section 4, and Section 6 has no storage notice item answered. The Section 4 tables `lesson_progress`, `lesson_sessions`, `parent_profiles` and the `children.stage` column do not exist yet. | DPDP, PDPL | Found in audit |
| C27 | **Audit — card collected at checkout:** `api/stripe-checkout.js` creates a subscription with `payment_method_types: ['card']` and a 30-day trial. This conflicts with D9 (free trial with no card) and Section 2.5. Already tracked as TASKS.md item 4 (report only). | Consumer law | Found in audit |
| C28 | **Audit — IP addresses processed by our code:** `api/claude-proxy.js` reads `x-forwarded-for` and keeps IPs in memory for rate limiting; `console.error` calls in the API routes write error text to Vercel logs. Add to the privacy notice and Section 5 (Vercel row). | DPDP, PDPL | Found in audit |
| C29 | **Audit — no privacy notice, terms or storage notice exist:** no such files are tracked (`legal/` is empty) and neither `index.html` nor `app/signup.html` links to any. Sign-up collects name, email and password with no consent text. Confirms C6; also bears on C1. | All | Found in audit |

---

## 9. Open questions for the lawyer

1. Which verifiable parental consent method is acceptable for a small EdTech with no school partner (India and UAE)?
2. Is showing a parent their own child's progress (lessons, stars, minutes) "behavioural monitoring" under DPDP Sec. 9?
3. Does storing data in Supabase Tokyo require extra steps? Should we move region?
4. Do we qualify for any education exemption (DPDP Rule 12 / UAE Cabinet exemption)?
5. Exact commencement dates and breach-notification timelines.
6. Required content of privacy notice and terms for both countries; grievance officer requirement.
7. Data retention required for billing/tax records.
8. GST/VAT obligations for an India-registered company selling to UAE and Indian families.

---

## 10. Licences register

| Asset | Source | Licence | Attribution needed |
|---|---|---|---|
| Subject photos (96+) | DALL-E | OpenAI terms `[VERIFY]` | — |
| Background removal | remove.bg | Service terms | — |
| Animal sounds | TBD | Must be CC0 or licensed | TBD |
| Fonts | Google Fonts (to self-host) | Open licence `[VERIFY each]` | — |

---

## 11. Change log

| Date | Change |
|---|---|
| 2026-10-11 | File created from decisions D1–D11 and research on DPDP Rules 2025 and UAE Decree-Law 26/2025 |

---

## 12. Sources (checked 2026-10-11)

- Mondaq — Children's data under the DPDP Act 2023 and DPDP Rules 2025: https://www.mondaq.com/india/privacy-protection/1710322/
- Tsaaro — Parental consent and behavioural monitoring under DPDPA: https://tsaaro.com/blogs/safeguarding-minors-online-understanding-parental-consent-obligations-and-behavioural-monitoring-restrictions-under-the-dpdpa-and-dpdp-rules
- MediaNama — DPDP Rules: parental consent: https://www.medianama.com/2025/01/223-data-protection-rules-2025-children-data-india/
- Clyde & Co — UAE Child Digital Safety Law: https://www.clydeco.com/en/insights/2026/01/uae-issues-landmark-child-digital-safety-law
- Baker McKenzie — UAE Child Digital Safety law: https://www.bakermckenzie.com/en/insight/publications/2026/01/uae-issues-new-child-digital-safety-law
- Latham & Watkins — UAE Child Digital Safety Law: https://www.lw.com/en/insights/uaes-child-digital-safety-law-what-every-digital-platform-and-isp-should-know
