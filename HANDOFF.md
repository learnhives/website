# 🐝 LearnHives — Project Handoff

**Purpose:** paste this into a fresh chat so a new assistant instance is fully
oriented. Pair it with `BACKLOG.md` (current task list) and, if useful, the
project plan docx + Gantt. Keep this file updated as the project's "stable facts"
change; use `BACKLOG.md` for the moving task list.

_Last updated: Day 16 (Jun 2026)_

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

## Current state — Day 16 of 28

Phases 1–3 done: dev setup, auth/Supabase, Stripe payments/webhooks/welcome
email, security hardening (rate limiting, JWT verification, RLS).

**Two subjects live. Architecture: shared engine + per-subject config.**

### Lesson engine architecture (read this before building a new lesson)

Lesson logic lives in **`js/lesson-engine.js`** — single export `startLesson(config)`.
Every lesson page is a 4-line shell:

```js
import { LESSON_CONFIG } from '../js/lessons/alphabet.js';
import { startLesson }   from '../js/lesson-engine.js';
startLesson(LESSON_CONFIG);
```

The engine is fully subject-agnostic. **A new lesson = one config file + one thin HTML
shell. No engine changes needed.**

**Config interface — every lesson must implement these:**

| Property / method | What the engine uses it for |
|---|---|
| `subject`, `lessonKey`, `icon` | Display + localStorage key prefix |
| `stages` | `{ seedling/sprout/blossom/bloom: { label, age, avatar, story(key,d), prompt(key,d) } }` |
| `items` | Ordered array of all item keys (`['A'..'Z']`, `['1'..'20']`, …) |
| `getItems(stageKey)` *(optional)* | Stage-filtered subset; falls back to `items` if absent. Numbers uses this for 1–10 vs 1–20. |
| `uiStrings.en` *(optional)* | Per-subject label overrides (`nextItem`, `pickItem`, `printPack`); engine has generic fallbacks |
| `getCards(key)` | Array of card objects (passed to `renderCard`) |
| `renderCard(card, key, stageKey)` | Returns `{ emoji, label, backHtml }` |
| `buildQuiz(key, stageKey)` | Returns `[{ question, image, options:[{e,l,c}] }]` |
| `getQuickPrompts(key)` | `[{ t, m }]` Buzz quick-prompt chips |
| `renderWorksheet(key, stageKey, isLast)` | HTML string for the printable page |
| `getItemTitle(key)` | Header title ("The Letter A") |
| `getItemDisplayName(key)` | Lowercase for completion modal ("the letter a") |
| `getProgressLabel(key)` | Progress bar label |
| `getItemBadge(key, stageKey)` | Badge text; receives stage for range-aware display |
| `getWorksheetTitle(key)` | Worksheet preview title |
| `getItemEmoji(key)` | Subject illustration emoji |
| `getStory(key, stageKey)` | HTML string for the Story tab |
| `getBuzzPrompt(key, stageKey)` | Buzz system prompt string |
| `getGreeting(key, stageKey)` | Buzz opening message HTML |

**Lessons built:**
- `js/lessons/alphabet.js` + `app/lesson-alphabet.html` — A–Z, all 4 stages
- `js/lessons/numbers.js` + `app/lesson-numbers.html` — 1–20, all 4 stages.
  Seedling/Sprout: items 1–10 (🍯 objects, ten-frame for 6–10, no word for Seedling).
  Blossom/Bloom: items 1–20 (per-number emoji, number word; Bloom adds a "+1 peek").

**Settings seams** (applied inside the engine for every lesson):
- `stage`, `lang` (default `en`), `theme` (default `honey`; `ocean` proof-of-concept built).
- Read from URL params (`?stage=bloom`, `?theme=ocean`). `?preview=1` shows stage selector.
- **TODO comments mark exactly where Supabase child-profile wiring replaces the fallback.**
- i18n: `UI_STRINGS` + `t()` with config-override → engine-fallback chain. English only.

**Engine features (shared across all lessons):**
- Tabs: Cards / Quiz / Story (TTS Listen button in Story).
- Quiz: 2-wrong-then-reveal, no reward for guessing, emoji + spoken feedback, pulse-glow.
- XP progress: state-based (seen cards + answered questions + story done). localStorage now; Supabase later (TODO marked).
- Buzz AI chat via `/api/claude-proxy`; voice input (Web Speech API).
- Worksheets: age-differentiated single-page + full pack with print-count confirmation.

A **lesson catalog** was designed (artifact `catalog.js`, not yet committed):
stage-tagged list for the dashboard to filter by child stage. Added **Motion &
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
- **#product-next** — `lesson-colors-shapes.html` (3rd subject; now just a config file + thin shell).
- **#architecture-next** — build the dashboard lesson catalog (from `catalog.js`).

## Note on assistant memory

A fresh chat does **not** retain prior conversations. The committed `BACKLOG.md`
and this `HANDOFF.md` are the source of truth — the assistant can't see or edit
your repo directly, so keep these files updated locally (by you or Claude Code)
and paste them into new sessions.
