# 🐝 LearnHives — Build Plan (~35 work sessions)

**How to use:** in a fresh chat, upload this with `HANDOFF.md` + `BACKLOG.md` and
say e.g. *"I'm on Day 18 of LearnHives — let's start."* The assistant reads the
day's task here, then works **one step at a time** (my preferred style).

**Schedule:** ~35 work sessions, ~4 days/week, 60–90 min each. learnhives.com is
already live on Vercel (domain connected early).

**Note on reality vs. original plan:** The original 28-day plan had 7 subjects.
Day 17 planning expanded to **14 subjects** (Colors & Shapes split, Nature &
Animals split into 3, added Fruits, Vegetables, Transport, Occupations, My World).
6 subjects use AI-generated photos (DALL-E), requiring an image pipeline. Timeline
extended to ~35 days. The plan is a guide, not a contract — lessons can ship
post-launch too.

_Last updated: end of Day 17 (Jun 2026)._

---

## ✅ DONE — Days 1–17

| Day | What landed |
| --- | --- |
| 1–4 | **Phase 1 — Foundation:** VS Code + Git, cloned repo, Vercel auto-deploy, accounts (Supabase, Stripe, Resend). |
| 5–8 | **Phase 2 — Auth:** signup/login pages, Supabase Auth, child-profile creation, parent dashboard. |
| 9–12 | **Phase 3 — Payments:** Stripe products (Free / Family $9.99 / Family Plus $14.99, 30-day trial), trial gating, webhooks → Supabase, Resend welcome email. |
| 13 | **Secure the API:** Anthropic calls moved to Vercel serverless proxy (`api/claude-proxy.js`); rate limiting, JWT verification, RLS policies. |
| 14–15 | **Alphabet lesson + architecture:** full A–Z lesson, config split into ES module, three profile-driven seams (stage/lang/theme), catalog design, `BACKLOG.md` + `HANDOFF.md` created. |
| 16 | **Shared engine + Numbers lesson:** extracted `js/lesson-engine.js` (`startLesson(config)`). Built `lesson-numbers.html`: 1–20, four stages. Each lesson is now engine + config + 4-line HTML shell. |
| 17 | **Kid Mode + planning:** full-screen child layer in engine (guided flow, hive world backdrop, real-AI Buzz, pinch-zoom lockout). Quiz layout partially fixed. **Subject list expanded to 14.** Colors/Shapes split, Animals split into 3, added Fruits/Vegetables/Transport/Occupations/My World. Image strategy decided (DALL-E photos for 6 visual subjects). Landing page updated to 14 subjects. |

---

## ▶️ REMAINING — Days 18–35

### Phase 4a — Engine prep + bug fixes
| Day | Task | Goal |
| --- | --- | --- |
| **18** | **Fix numbers quiz bug** (one-bee-for-two). **Add image support to engine** (`renderCard` returns `<img>` for photo subjects). **Scrap old `colors-shapes.js`/`.html`**. | Engine ready for all 14 subjects |

### Phase 4b — Lesson production (batches of 3–4)
_Image generation happens in parallel (commute time). Emoji-based subjects first._

| Day | Task | Goal |
| --- | --- | --- |
| **19** | **Batch 1:** `colors.js` + `shapes.js` (emoji-based, no photos needed) | 4 subjects live |
| **20** | **Batch 2:** `farm-animals.js` + `wild-animals.js` + `birds.js` (photos needed) | 7 subjects live |
| **21** | **Batch 3:** `fruits.js` + `vegetables.js` + `transport.js` (photos needed) | 10 subjects live |
| **22** | **Batch 4:** `music.js` + `emotions.js` (emoji-based) | 12 subjects live |
| **23** | **Batch 5:** `occupations.js` + `my-world.js` (Blossom/Bloom only, emoji-based) | 14 subjects live |

### Phase 5 — Dashboard, profile wiring, legal, polish
| Day | Task | Goal |
| --- | --- | --- |
| **24** | **Dashboard lesson catalog** — stage-tagged grid (12 for Seedling/Sprout, 14 for Blossom/Bloom). **Wire Supabase child-profile into stage/lang/theme seams.** | Personalized dashboard |
| **25** | **Progress tracking → Supabase** — swap localStorage for Supabase; design events table for future personalization (COPPA/GDPR-aware). | Progress persisted |
| **26** | **Legal pages** — Privacy Policy, Terms, Refund & Cancellation, Cookie consent banner. COPPA/GDPR/UAE compliance. | Legally compliant |
| **27** | **Nav pages + mobile** — About, Curriculum, Safety, For Schools, Contact. Mobile layout pass across all pages. | Site complete & mobile-ready |
| **28** | **SEO + sitemap** — meta descriptions, titles, Open Graph, `sitemap.xml`, submit to Google Search Console. | Discoverable |

### Phase 6 — Testing & launch
| Day | Task | Goal |
| --- | --- | --- |
| **29** | **End-to-end testing** — full journey: land → sign up → trial → subscribe → lesson → progress. Fix broken steps. Set up `vercel dev`. | No broken steps |
| **30** | **Content & QA pass** — proof all 14 subjects across all stages; confirm Buzz, worksheets, voice, themes, photos render correctly. Accessibility check. | Polished |
| **31** | **Stripe → live mode** — swap test keys for live, process one real payment, verify webhook. | Real payments |
| **32** | **Soft launch** 🐝 — share with 5–10 friends/family, gather feedback. | Launched! |
| **33–35** | **Buffer** — fix critical feedback, polish, additional content depth. | Stable |

---

## Pre-launch checklist (revisit around Day 29)
- [ ] All 14 subjects work end-to-end across relevant stages
- [ ] All AI-generated images render correctly on mobile
- [ ] Signup, login, password reset work
- [ ] Stripe payments work in live mode
- [ ] Welcome email sends after signup
- [ ] Privacy / Terms / Refund pages live; cookie banner shows
- [ ] Mobile layout correct across all pages
- [ ] learnhives.com resolves with HTTPS
- [ ] Google Search Console submitted
- [ ] Dashboard shows correct subjects per child's stage

## Deferred to post-launch (see `BACKLOG.md`)
- `#polish-feel` — ambient animation + themed nature backgrounds
- `#content-depth` — more words per letter / richer older-stage content
- `#vision` — hive world gamification, pronunciation checking, longitudinal
  personalization, grade-school expansion (Standard 1–6), coding/STEM
- Migrate lesson configs + catalog from JS files to Supabase
- Fine Motor & Creativity (needs canvas/tracing engine)
- Motion & Movement (needs video/animation engine)
