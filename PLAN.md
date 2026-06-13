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

_Last updated: end of Day 17 (Jun 2026). Day 17 was used for Kid Mode (one unplanned but high-leverage session — all future lessons inherit it free). Phase 4 lesson builds are now ~1 day behind the original numbering._

---

## ✅ DONE — Days 1–16

| Day | What landed |
| --- | --- |
| 1–4 | **Phase 1 — Foundation:** VS Code + Git, cloned repo, Vercel auto-deploy, accounts (Supabase, Stripe, Resend). |
| 5–8 | **Phase 2 — Auth:** signup/login pages, Supabase Auth, child-profile creation, parent dashboard. |
| 9–12 | **Phase 3 — Payments:** Stripe products (Free / Family $9.99 / Family Plus $14.99, 30-day trial), trial gating, webhooks → Supabase, Resend welcome email. |
| 13 | **Secure the API:** Anthropic calls moved to Vercel serverless proxy (`api/claude-proxy.js`); rate limiting, JWT verification, RLS policies. |
| 14–15 | **Alphabet lesson + architecture:** full A–Z `lesson-alphabet.html` (Cards/Quiz/Story, Buzz AI chat, voice input, TTS, age-differentiated single-page worksheets + A–Z pack). Teaching-correct quiz (2-try reveal, emoji + spoken feedback). State-based progress. **Config split into ES module `js/lessons/alphabet.js`.** **Three profile-driven seams (stage / lang / theme) via one settings helper**, `?preview=1` dev flag, Supabase wiring TODO-marked. Lesson catalog designed (`catalog.js`). `BACKLOG.md` + `HANDOFF.md` created. |
| **16** | **Shared engine + Numbers lesson** *(not in the original plan — emerged from building the 2nd lesson)*: Extracted inline engine to `js/lesson-engine.js` (`startLesson(config)` — single export). Each lesson is now **engine + config module + 4-line HTML shell**. Built `lesson-numbers.html`: 1–20, four stages, stage-scaled item sets (Seedling/Sprout 1–10, Blossom/Bloom 1–20), ten-frame layout, Bloom +1 peek. **Days 17–20 lesson builds are now config-only — significantly faster.** |
| **17** | **Kid Mode** *(not in the original plan — triggered by testing numbers with a child)*: Full-screen child-facing layer in `lesson-engine.js`. Guided flow (cards→quiz→story→celebration), hive world backdrop (gradient sky, SVG hive, drifting bees, honey-drip border), real-AI Buzz tap-chip tutoring (🔢🔊⭐ → `/api/claude-proxy` → TTS), pinch-zoom lockout, numbers single-card model fix. Alphabet + numbers verified. `lesson-colors-shapes.html` shell exists but unverified. **Every future lesson inherits Kid Mode for free.** |

---

## ▶️ REMAINING — Days 17–28

### Phase 4 (cont.) — Core lessons & data
| Day | Task | Goal |
| --- | --- | --- |
| **18** | **`lesson-colors-shapes.html`** — verify in kid frame + link to dashboard. Lessons now drop straight into the finished Kid Mode. | 3rd subject live |
| **19** | **Progress tracking → Supabase + structured event logging.** Swap localStorage progress for Supabase; design the **events table** with the longitudinal "champion the child" vision in mind (clean structured events, stage as flexible string, COPPA/GDPR-aware). | Progress persisted; data foundation laid |
| **20** | **`lesson-nature-animals.html`** | 4th subject live |
| **21** | **`lesson-music-emotions.html`** (and/or **Motion & Movement** — movement games with Buzz). | 5th/6th subject live |

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
