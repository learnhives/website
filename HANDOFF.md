# 🐝 LearnHives — Project Handoff

**Purpose:** paste this into a fresh chat so a new assistant instance is fully
oriented. Pair it with `BACKLOG.md` (current task list) and, if useful, the
project plan docx + Gantt. Keep this file updated as the project's "stable facts"
change; use `BACKLOG.md` for the moving task list.

_Last updated: Day 17 (Jun 2026)_

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

## Curriculum model — 14 subjects

**4 preschool stages:** Seedling (2–3), Sprout (3–4), Blossom (4–5), Bloom (5–6).

**12 subjects across all stages:**
Alphabet & Words, Numbers & Counting, Colors, Shapes, Farm Animals, Wild Animals,
Birds, Fruits, Vegetables, Transport, Music, Emotions.

**2 subjects for Blossom & Bloom only:**
Occupations, My World (places + daily objects).

**2 subjects parked post-launch (need non-flashcard engine):**
Fine Motor & Creativity (needs canvas/tracing), Motion & Movement (needs
video/animation).

Items per stage scale up: Seedling gets ~5 items, Sprout ~8, Blossom ~12,
Bloom ~16. Each stage includes all items from the previous stage plus new ones.

AI tutor = **Buzz the Bee** (bee/honey theme; other characters: Honey, Flora,
Petal).

### Image strategy (decided Day 17)

**Hybrid approach:** emoji/SVG for abstract subjects (Alphabet, Numbers, Colors,
Shapes, Emotions, Music, Occupations, My World). AI-generated photographs
(DALL-E) for visual-recognition subjects (Farm Animals, Wild Animals, Birds,
Fruits, Vegetables, Transport).

- **91 unique images** needed across 6 photo subjects.
- DALL-E prompt: *"Realistic photograph of a [item], full body, centered on a
  pure white background, soft natural studio lighting, no shadows on background,
  high detail, clean and simple, children's educational book style"*
- Square 1:1 aspect ratio. For elongated items, add "slight diagonal angle."
- File naming: lowercase, hyphens. e.g. `cow.png`, `bell-pepper.png`.
- **Hosted in repo:** `assets/images/{subject-folder}/{item}.png` — zero cost on
  Vercel's free tier (~18MB total). Migrate to CDN post-launch if needed.
- Engine change needed: `renderCard` must support returning `<img>` tags
  alongside emoji. One small engine update, then all photo configs benefit.

Full image list with per-stage breakdown: see `LearnHives_Image_List.xlsx`.

## Current state — Day 17 of ~35

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

**To be scrapped:** `js/lessons/colors-shapes.js` and `app/lesson-colors-shapes.html`
— will be replaced by separate `colors.js` and `shapes.js` configs.

### Kid Mode (built Day 17 — every future lesson inherits it free)

`js/lesson-engine.js` now drives **two views from one page**:

- **Parent view** — tabs (Cards / Quiz / Story), Buzz chat, worksheet, print.
  "Hand to child" button in the nav triggers Kid Mode.
- **Kid layer** — `<div id="kidMode">` full-screen takeover (`position:fixed; z-index:9999`).
  Parent view is `display:none` while Kid Mode is active, not merely covered.

**Architecture:** engine state is shared; no duplication. Kid Mode is injected entirely
by `injectKidModeDom()` in `lesson-engine.js`. New lessons get Kid Mode automatically —
zero extra work per lesson.

**Guided flow:** Cards → Quiz → Story → Celebration. No tabs; giant ← → arrows;
dot progress. Hold 🔒 3s to exit (toddler-proof). Content scales to fit — no scrolling
anywhere; all zones use `dvh` units.

**Hive world backdrop:** gradient sky, SVG honeycomb hive, drifting bees, honey-drip
border, grass strip — all original CSS/SVG (no image files), GPU-composited,
`prefers-reduced-motion` respected.

**Real-AI Buzz:** front-facing SVG bee in lower corner, idle hover + 5s wiggle hint.
Tap → 3 chip bubbles (🔢 count, 🔊 sound, ⭐ fun fact) over a dimmed screen.
Each chip calls `/api/claude-proxy` with `config.getBuzzPrompt()` as system prompt and
speaks Claude's 1-sentence reply via TTS. Graceful spoken fallback on API failure.
No free-text input in Kid Mode (deferred to `#vision` — needs COPPA consent).

**Also built Day 17:**
- Numbers lesson: one card per number (numeral + honey-pot count grouped 10+remainder).
  Fixes the old 2-card split that showed "1 honey pot = Ten".
- Pinch-zoom / double-tap-zoom disabled on lesson pages (toddlers were escaping).

**Quiz layout fixes (partially done Day 17):**
- ✅ Rebalanced quiz image-to-options ratio (image area ~55%, options shrink to fill rest).
- ✅ Drifting backdrop bees hidden during quiz phase (CSS rule via `data-step`).
- ✅ Counting object emoji size increased.
- ❌ BUG OPEN: "Find the number" quiz shows a single per-number emoji (one bee for
  number 2) instead of the correct quantity of counting objects. Fix is in `numbers.js`
  `buildQuiz` function.

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

**Landing page** updated Day 17 to show all 14 subjects (was 6). Section heading:
"Fourteen Honeycombs of Knowledge."

## Design principles I care about

- **Separate content from engine** (done — keep doing it).
- **"Cheap now, costly later"** — provision architectural seams early
  (i18n, themes, event logging) even before filling them in.
- **Stupid simple** — designing for kids, not researchers. No complexity.
- **Age-appropriate; no gendered themes** — use vibe/character themes
  (honey / ocean / forest / berry / sunset…), never "boy/girl".
- **Hybrid visuals** — AI-generated photos for visual-recognition subjects,
  emoji/SVG for abstract subjects. Consistent DALL-E prompt for uniform style.
- **Animations & backgrounds**: must be lightweight, *purposeful* (celebrate,
  not constant ambient distraction), respect `prefers-reduced-motion`. Themed
  backgrounds idea = gradient sky + simple silhouette strip (CSS/SVG), not heavy
  photographic scenes. Parked for a dedicated "make it feel alive" session.
- **Future personalization** = "championing the individual child" — strengths &
  next-steps framing, **NOT** global percentile ranking. COPPA/GDPR by design;
  start logging clean structured interaction events after lesson production.
- Push back honestly; don't just agree.

## Where to look next

See **`BACKLOG.md`** (repo root) for the live task list, organized by hashtag.

Most likely next moves:
- **Fix numbers quiz bug** — "Find the number" shows wrong quantity of objects.
- **Engine image support** — small `renderCard` change to support `<img>` tags.
- **Build configs in batches of 3–4** — Colors, Shapes, Farm Animals first.
- **Dashboard lesson catalog** — make the stage-tagged grid real.

## Note on assistant memory

A fresh chat does **not** retain prior conversations. The committed `BACKLOG.md`
and this `HANDOFF.md` are the source of truth — the assistant can't see or edit
your repo directly, so keep these files updated locally (by you or Claude Code)
and paste them into new sessions.
