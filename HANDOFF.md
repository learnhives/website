# 🐝 LearnHives — Project Handoff

**Purpose:** paste this into a fresh chat so a new assistant instance is fully
oriented. Pair it with `BACKLOG.md` (current task list) and, if useful, the
project plan docx + Gantt. Keep this file updated as the project's "stable facts"
change; use `BACKLOG.md` for the moving task list.

_Last updated: Day 15 (Jun 2026)_

---

## What it is

AI-powered preschool education web app — **learnhives.com** — for kids aged 2–6.
Vision: the world's best AI learning platform for kids, eventually expanding to
grade school (Standard 1–6), block-based coding, and STEM.

Operated from the UAE; business registered in India ("Learn Hives").
Business email: hello@learnhives.com (Zoho). Also owns learnhives.in.

## How I work (important)

- Beginner coder. MacBook Pro M1. Work ~4 days/week, after office hours.
- **Step-by-step: one task at a time. I do it, report back, then the next.**
  Don't front-load walls of code or multi-step instructions.
- Engage me as a **product thinker**, not just an executor. Push back honestly
  when something's a bad idea.

## Dev workflow

- Edits done via **Claude Code (VS Code extension)**: you give me a prompt, I run
  it locally, review the diff, test, then push.
- Local repo: `~/Projects/website`  (folder is `website`; GitHub org is
  `learnhives`).
- **Push → Vercel auto-deploys in ~20s.** Live site only reflects pushed code.
- Local testing: **Live Server** at `http://127.0.0.1:5500` (required — the site
  uses ES modules, which don't work over `file://`).
- **Buzz AI chat only works on the deployed site or via `vercel dev`**, not on
  Live Server (it needs the serverless function).
- Use `git add .` (with the dot) to stage everything — files live under `app/`,
  `js/`, etc., so bare filenames miss them.
- Claude Code runs on my **Pro plan** (confirmed: no local `ANTHROPIC_API_KEY`,
  so no per-token API billing).

## Tech stack

HTML/CSS/JS frontend · **Vercel** (hosting + auto-deploy) · **Supabase** (Tokyo;
auth, DB, RLS) · **Stripe** (UAE; Free / Family $9.99 / Family Plus $14.99, 30-day
trial) · **Anthropic Claude API** via a secured Vercel proxy `api/claude-proxy.js`
· **Resend** (Tokyo, email). All secrets are Vercel env vars.

## Curriculum model

Subjects × **4 preschool stages**: Seedling (2–3), Sprout (3–4), Blossom (4–5),
Bloom (5–6). Core subjects are shared across all stages; higher stages get
**additional, independently-counted** lessons (no fixed pattern). AI tutor =
**Buzz the Bee** (bee/honey theme; other characters: Honey, Flora, Petal).

## Current state — Day 15 of 28

Phases 1–3 done: dev setup, auth/Supabase, Stripe payments/webhooks/welcome
email, security hardening (rate limiting, JWT verification, RLS).

**`lesson-alphabet.html` is fully built and is the architectural template for all
future lessons:**
- Full A–Z, **data-driven** from `js/lessons/alphabet.js` (ES module — engine and
  content decoupled).
- Tabs: **Cards / Quiz / Story** (Cards default). Story has a **Listen** TTS button.
- **Quiz teaches:** correct-answer-required, 2-wrong-then-reveal, no reward for
  guessing. Emoji + spoken feedback for non-readers. Pulse-glow on correct answer
  (respects `prefers-reduced-motion`).
- **State-based progress** (not click-based). localStorage now; Supabase later
  (TODO marked in code).
- **Buzz AI chat** via `/api/claude-proxy`; **voice input** (Web Speech API).
- **Worksheets:** age-differentiated, single-page per letter (all 4 stages) + a
  26-page **A–Z pack** with a print-count confirmation dialog.
- **Three profile-driven seams via one consolidated settings helper:**
  `stage`, `lang` (default `en`), `theme` (default `honey`; `ocean` built as
  proof). Read from URL params now (`?stage=bloom`, `?lang=`, `?theme=ocean`).
  `?preview=1` shows the dev-only stage selector. **TODO comments mark exactly
  where Supabase child-profile wiring replaces the URL/default fallback.**
- **i18n is UI-chrome only** (`UI_STRINGS` + `t()` with `en` fallback). Per-language
  lesson *content* is a separate future product decision (different alphabets are
  NOT translations).

A **lesson catalog** was designed (artifact `catalog.js`, not yet committed):
a stage-tagged list the dashboard will filter by child stage. Added **Motion &
Movement** as a core subject across all stages.

## Design principles I care about

- **Separate content from engine** (done — keep doing it).
- **"Cheap now, costly later"** — provision architectural seams early
  (i18n, themes, event logging) even before filling them in.
- **Age-appropriate; no gendered themes** — use vibe/character themes
  (honey / ocean / forest / berry / sunset…), never "boy/girl".
- **Animations & backgrounds**: must be lightweight, *purposeful* (celebrate,
  not constant ambient distraction), respect `prefers-reduced-motion`. Themed
  backgrounds idea = gradient sky + simple silhouette strip (CSS/SVG), not heavy
  photographic scenes. Parked for a dedicated "make it feel alive" session.
- **Future personalization** = "championing the individual child" — strengths &
  next-steps framing, **NOT** global percentile ranking. COPPA/GDPR by design;
  start logging clean structured interaction events ~Day 18.
- Push back honestly; don't just agree.

## Where to look next

See **`BACKLOG.md`** (repo root) for the live task list, organized by hashtag:
`#architecture-next`, `#product-next`, `#content-depth`, `#worksheet-tuning`,
`#polish-feel`, `#infra`, `#vision`.

Most likely next moves:
- **#architecture-next** — build the dashboard lesson catalog (from `catalog.js`).
- **#product-next** — `lesson-numbers.html` (fast now on the clean template).

## Note on assistant memory

A fresh chat does **not** retain prior conversations. The committed `BACKLOG.md`
and this `HANDOFF.md` are the source of truth — the assistant can't see or edit
your repo directly, so keep these files updated locally (by you or Claude Code)
and paste them into new sessions.
