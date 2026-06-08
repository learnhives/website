# 🐝 LearnHives — Build Plan (28 work sessions)

**How to use:** in a fresh chat, upload this with `HANDOFF.md` + `BACKLOG.md` and
say e.g. *"I'm on Day 16 of LearnHives — let's start."* The assistant reads the
day's task here, then works **one step at a time** (my preferred style).

**Schedule:** 28 work sessions, ~4 days/week, 60–90 min each. learnhives.com is
already live on Vercel (domain connected early).

**Note on reality vs. original plan:** Days 14–15 expanded well beyond the
original "alphabet + numbers" scope — they delivered the full A–Z alphabet lesson
PLUS the architectural foundation (ES-module config split, state-based progress,
i18n seam, theme seam, stage-from-profile lock). Voice input and in-lesson
progress also landed early (were originally Days 18–19). So the remaining days
below are **re-planned** to match where things actually stand. Lesson production
should now be faster because the template + seams exist. The plan is a guide, not
a contract — lessons can ship post-launch too (the catalog supports adding them
independently per stage).

_Last updated: end of Day 15 (Jun 2026)_

---

## ✅ DONE — Days 1–15

| Day | What landed |
| --- | --- |
| 1–4 | **Phase 1 — Foundation:** VS Code + Git, cloned repo, Vercel auto-deploy, accounts (Supabase, Stripe, Resend). |
| 5–8 | **Phase 2 — Auth:** signup/login pages, Supabase Auth, child-profile creation, parent dashboard. |
| 9–12 | **Phase 3 — Payments:** Stripe products (Free / Family $9.99 / Family Plus $14.99, 30-day trial), trial gating, webhooks → Supabase, Resend welcome email. |
| 13 | **Secure the API:** Anthropic calls moved to Vercel serverless proxy (`api/claude-proxy.js`); rate limiting, JWT verification, RLS policies. |
| 14–15 | **Alphabet lesson + architecture:** full A–Z `lesson-alphabet.html` (Cards/Quiz/Story, Buzz AI chat, voice input, TTS, age-differentiated single-page worksheets + A–Z pack). Teaching-correct quiz (2-try reveal, emoji + spoken feedback). State-based progress. **Config split into ES module `js/lessons/alphabet.js`.** **Three profile-driven seams (stage / lang / theme) via one settings helper**, `?preview=1` dev flag, Supabase wiring TODO-marked. Lesson catalog designed (`catalog.js`). `BACKLOG.md` + `HANDOFF.md` created. |

---

## ▶️ REMAINING — Days 16–28

### Phase 4 (cont.) — Core lessons & data
| Day | Task | Goal |
| --- | --- | --- |
| **16** | **`lesson-numbers.html`** — build on the alphabet template: numbers 1–20, counting objects instead of letter-words, per-stage difficulty. Reuse the module-config + seams pattern. | 2nd subject live |
| **17** | **`lesson-colors-shapes.html`** — same template, colors & shapes content per stage. | 3rd subject live |
| **18** | **Progress tracking → Supabase + structured event logging.** Swap localStorage progress for Supabase; design the **events table** with the longitudinal "champion the child" vision in mind (clean structured events, stage as flexible string, COPPA/GDPR-aware). | Progress persisted; data foundation laid |
| **19** | **`lesson-nature-animals.html`** | 4th subject live |
| **20** | **`lesson-music-emotions.html`** (and/or **Motion & Movement** — movement games with Buzz). | 5th/6th subject live |

### Phase 5 — Dashboard, profile wiring, legal, polish
| Day | Task | Goal |
| --- | --- | --- |
| **21** | **Dashboard lesson catalog** — make the stage-tagged grid real (from `catalog.js`); dashboard shows the right lessons per child stage + overall progress. **Wire Supabase child-profile into the stage/lang/theme seams** (replace URL/default fallback — TODOs already mark the spots). | Personalized dashboard |
| **22** | **Legal pages** — Privacy Policy, Terms, Refund & Cancellation, Cookie consent banner. COPPA (US) / GDPR (EU) / UAE; parent-creates-account, AI-content disclosure, account deletion. (`/legal/` folder.) | Legally compliant |
| **23** | **Nav pages + mobile** — build the non-functional nav pages (About, Curriculum, Safety, For Schools, Contact). Test every page on a phone; fix layout. | Site complete & mobile-ready |
| **24** | **SEO + sitemap** — meta descriptions, titles, Open Graph, `sitemap.xml`, submit to Google Search Console. | Discoverable |

### Phase 6 — Testing & launch
| Day | Task | Goal |
| --- | --- | --- |
| **25** | **End-to-end testing** — full journey: land → sign up → trial → subscribe → lesson → progress. Fix broken steps. Set up `vercel dev` for full local testing (incl. Buzz). | No broken steps |
| **26** | **Content & QA pass** — proof all lessons across all stages; confirm Buzz, worksheets, voice, themes work live; accessibility (`prefers-reduced-motion`) check. | Polished |
| **27** | **Stripe → live mode** — swap test keys for live, process one real payment, verify webhook. | Real payments |
| **28** | **Soft launch** 🐝 — share with 5–10 friends/family, gather feedback, fix critical issues, announce. | Launched! |

---

## Pre-launch checklist (revisit around Day 25)
- [ ] Multiple lesson subjects work end-to-end across all 4 stages
- [ ] Signup, login, password reset work
- [ ] Stripe payments work in live mode
- [ ] Welcome email sends after signup
- [ ] Privacy / Terms / Refund pages live; cookie banner shows
- [ ] Mobile layout correct
- [ ] learnhives.com resolves with HTTPS
- [ ] Google Search Console submitted

## Deferred to post-launch (see `BACKLOG.md`)
- `#polish-feel` — ambient animation + themed nature backgrounds (one dedicated session)
- `#content-depth` — more words per letter / richer older-stage content
- Migrate lesson configs + catalog from JS files to Supabase
- `#vision` — longitudinal personalization, grade-school (Standard 1–6), coding/STEM
