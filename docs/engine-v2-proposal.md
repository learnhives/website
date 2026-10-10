# LearnHives engine v2 — architecture review and proposal

Status: proposal only. Nothing in this document has been built.
Basis: `main` at 09d0910, and `bus/farm-animals` at db400e7 (Farm Animals exists only there).
Screenshots: 36 PNGs (3 lessons × 3 widths × main / quiz / kid mode / kid-mode quiz), all opened and reviewed.

## 0. How the screenshots were taken (deviation from the brief)

- `npm run shots` does **not exist on main**. `scripts/screenshot.js` and the `shots` script live only on `bus/screenshot-tool`.
  Playwright is also not installed in `node_modules`, and I may not install packages.
- So I wrote a throw-away Chrome-DevTools-Protocol script **outside the repo** (in the session scratchpad) that does the same job as
  `scripts/screenshot.js`: same three widths, same four views, same selectors. It uses the Chrome headless shell already cached by Playwright.
- I did **not** touch `scripts/screenshot.js` and did **not** add a `--root` option. There are no uncommitted tooling changes.
  The throw-away script takes the root folder as an argument, which is how it served the Farm worktree.
- PNGs are in the session scratchpad (`.../scratchpad/shots/{numbers,alphabet,farm}/`), not in the repo.
- Coverage gaps: only the first item (1 / A / Cow) at Seedling was shot. Not captured: the Story tab, Stages 2–4,
  the second (sound-clue) Farm quiz question, correct / wrong answer states, the print worksheet.
  Those need to be added to the shot script (see section 5).
- At 390 px the phone emulation reports a **layout width of 603–628 px** for all three lessons (see problem 1 below).
  That is a real finding, not an artefact: the page is wider than the phone.

## 1. What is broken, per lesson, per width

Legend: M = main (parent) view, Q = Quiz tab, K = Kid Mode card, KQ = Kid Mode quiz.

### Numbers (main branch)
| Width | Findings |
|---|---|
| 390 | Page is 628 px wide: the nav row (Dashboard · logo · Hand to child · Lily · Print) does not wrap, so the whole page is shrunk or scrolls sideways. Print button wraps to four lines. M: the quiz renders under the Cards tab (bug a) and "Tap to flip!" has been squeezed. Q: answer tiles are tiny 36–48 px pills. K and KQ: card and tiles are cut off at the right edge, and the question text is truncated ("What number is th"). |
| 820 | M: quiz under Cards (bug a). Q: pill-sized tiles lost in a big white panel. K: card OK, but the "Hold to exit" pill sits above the bee, and the fixed card height wastes the screen. KQ: tiles are fine (the only lesson where kid quiz looks right), but "Hold to exit" **covers the Next Question button**. |
| 1280 | M: quiz under Cards; Buzz panel is a separate column of mostly empty space. K: "Hold to exit" covers the word "One" on the card. KQ: "Hold to exit" covers Next Question. |

### Alphabet (main branch)
| Width | Findings |
|---|---|
| 390 | Page is 603 px wide. Header icon box shows the **word** "Apple" in 40 px text and it spills past the box. M: quiz (with a white-box apple photo) is under the Cards tab; "Tap to flip!" collides with Prev / Next and prints garbled ("Tap to flip!" overlaps "1 / 1"). K and KQ: card and tiles cut off at the right. |
| 820 | Same quiz-under-cards. Photo is a white square on cream. KQ: white photo box on blue sky, tiles OK, Hold-to-exit covers Next Question. |
| 1280 | Header icon box: the word "Apple" overflows the box and touches the title. "Tap to flip!" overlaps the counter. K: Hold-to-exit covers the card bottom. KQ: photo is cropped at the bottom (the bottom 15 % of the apple is cut off), Hold-to-exit covers Next Question. |

### Farm Animals (bus/farm-animals)
| Width | Findings |
|---|---|
| 390 | Page is 623 px wide. M, Cards tab: the cow photo floats **above** an empty cream card and the name "Cow" sits on the card's bottom edge, overlapping "Tap to flip!" and Prev / Next. A second, huge cow (the quiz) is shown underneath (bug a). K: card is cut off at the right; the photo is a white box. KQ: photo cropped at the bottom, tiles cut off at the right, **tiles show only 🐾**, no names. |
| 820 | Same broken Cards tab (floating photo, empty card). KQ: two huge empty tiles with 🐾; Hold-to-exit covers Next Question. K: card fine but white photo box on a cream card, and a lot of dead space. |
| 1280 | Same broken Cards tab. KQ: photo cropped at the bottom; 🐾 tiles; Hold-to-exit covers Next Question. K: Hold-to-exit covers the word "Cow". |

### Top visual problems (ranked)
1. **Every lesson is wider than a phone** (603–628 px layout at 390). Kid-mode cards and tiles are cut off at the right edge on phone.
2. **The quiz is always visible under the Cards tab** (bug a), at every width, in every lesson. On Farm the Cards tab itself is also broken: the photo is outside the card, the name overlaps the controls.
3. **Farm kid quiz shows 🐾 instead of names**, because the engine hides all option text in Kid Mode (`js/lesson-engine.js:1095`). Photos are also cropped at the bottom on laptop.
4. **"Hold to exit" covers the Next Question button** (and the card word on laptop) in every lesson's Kid Mode.
5. **White photo boxes** on cream and sky-blue backgrounds, and the header icon box holding the *word* ("Cow", "Apple") as large text that overflows its box.

## 2. Code audit

### 2.1 Duplication across lesson pages

| File | Lines | Relationship |
|---|---|---|
| `app/lesson-alphabet.html` | 473 | The original. |
| `app/lesson-numbers.html` | 474 | ~120 changed lines of diff vs Alphabet. |
| `app/lesson-farm-animals.html` (branch) | 473 | ~120 changed lines vs Numbers; **a copy of Alphabet**, still carrying Alphabet placeholders (`🍎`, `APPLE`, "1 / 4"). |
| `app/lesson-colors-shapes.html` | 446 | Older copy, "to be scrapped" per PLAN.md. Out of scope; do not touch. |

Each page is ~475 lines: a 289-line `<style>` block, the markup, and a 6-line module script. Numbers vs Alphabet: **40 of the 289 style lines differ**, the markup
differs only in strings and ids, the script differs only in `import ... from '../js/lessons/<x>.js'`.
So the "lesson" HTML carries no information the config doesn't already carry, yet each copy has to be fixed separately.

What differs, and why bugs reappear:
- **Numbers** adds a block of CSS that fights the shared CSS (`app/lesson-numbers.html:300-310`): `.flashcard { aspect-ratio:unset; height:auto }`, `.flashcard-front { position:relative }`,
  with the comment *"This overrides the alphabet-style fixed aspect-ratio without touching the engine."* That is how "Numbers was fixed once": a local patch.
- **Farm** was copied from Alphabet, so it has the alphabet card geometry (absolute-positioned front, fixed aspect ratio) but puts a **photo** in it. That is the broken Cards tab.
  It also adds a patch (`.item-key{ ... !important }`) placed *before* the rule it tries to override.
- **Alphabet**'s `.card-word`, `.quiz-image` and option rules assume a letter and a word; Numbers assumes a multi-line honey-pot grid; Farm assumes a photo.
  Every new lesson type re-opens the same CSS.

Why the same bugs come back: styling lives in **three layers that fight each other**:
1. the lesson page's own `<style>` (alphabet-shaped, 289 lines, copied three times);
2. ~690 lines of CSS injected by the engine at runtime (`js/lesson-engine.js:895-1580`), written with `body:not(.kid-active) #tab-quiz` and `#kidActivityWrap` id selectors, which out-rank anything a lesson can write;
3. per-lesson patches on top.

On top of that, **Kid Mode re-parents the same DOM nodes** (`#tab-quiz`, `#flashcard`) into `#kidActivityWrap`, so every rule has to be correct in both contexts. There is no way to fix a
layout once, because there are two contexts × three layers × N lesson copies.

### 2.2 Known engine bugs — root causes (confirmed in the code)
- **(a) Quiz visible on Cards tab** — `js/lesson-engine.js:1354`: `body:not(.kid-active) #tab-quiz { display:flex; ... }`.
  Specificity (1,1,1) beats the page's `.activity-content{display:none}` and `.activity-content.active{display:block}`, so `#tab-quiz` is *always* displayed.
- **(b) Hold-to-exit hint over Next Question** — `#kidHint` is `position:fixed; bottom:110px; left:50%` (`:1554`), shown for 3.5 s from `enterKidMode()` (`:529`),
  which is exactly where `#nextQBtn` is (`:1444`). Nothing reserves space for it.
- **(c) Farm quiz** — three separate causes:
  - 🐾 instead of names: `#kidActivityWrap .quiz-option { font-size:0 !important }` (`:1095`, "NO-WORDS: hide option text labels") — the engine assumes options are emoji-only. Farm's options are `{e:'🐾', l:'Cow'}`.
  - Tiles overflow: Kid-Mode tile sizing (`:1425-1440`) is tuned for single glyphs; `photoThumb()` in `farm-animals.js:93` hard-codes `clamp(70px,14dvh,120px)` images.
  - Sound-quiz photos at the tile edge, and parent-view `.opt-emoji{display:none}` (`:1393`, "alphabet options are just letters") **hides the photo thumbnails** in the parent view of the clue question. The engine's quiz is shaped like Alphabet.
  - Header icon overflow: `getItemEmoji()` returns the word (`farm-animals.js:198`: `return ANIMALS[key].word`), which the shell renders in a fixed 80 px box.

### 2.3 What `js/lesson-engine.js` controls vs what each lesson controls (1,770 lines)

The engine **does**: state (stage, lang, theme from URL), i18n strings, item strip, tabs, flashcard flip, quiz rendering and scoring, story, chat with Buzz (`/api/claude-proxy`),
voice, XP and stars, progress persistence, worksheet generation, **and all Kid Mode** (DOM injection `:878-1740`, CSS, fullscreen, lock, confetti, wiggle, chips).
It also owns ~690 lines of CSS and ~160 lines of HTML templates inside JS strings.

The lesson config **does** (`js/lessons/*.js`, 280–460 lines each): items and stage lists, plus *functions that return HTML*: `renderCard()`, `buildQuiz()` (returns `image` HTML, and options with `e` HTML),
`renderWorksheet()`, `getStory()`, `getBuzzPrompt()`, `getGreeting()`. The lesson page **adds**: 289 lines of CSS and the full static markup.

The boundary is in the wrong place: **layout lives in all three** (engine CSS, page CSS, and HTML strings built inside config functions, e.g. Farm's inline `style="max-width:60dvh..."`). Data and presentation are mixed in config.
Strengths worth keeping: the config interface is already small and well understood; Buzz prompts, the story / card / quiz flow and the rubric-driven content are good.

### 2.4 Progress storage — what is written, and is it enough for a parent dashboard?

**Finding: nothing writes to a Supabase progress table. There is no progress table.**
- `js/lesson-engine.js:456-463` writes progress to **localStorage only**, key `lh_progress_<lessonKey>_<item>_<stage>`,
  value `{seenCards[], answeredQuestions[], storyDone, completed, ts}`.
- The only `db.from(...)` calls anywhere are in `app/dashboard.html` (`children` select/insert).
- `supabase-rls-setup.sql` defines RLS for `children` and `subscriptions` only.
- The lesson pages never load a child: the nav pill shows a hard-coded "Lily" (`app/lesson-numbers.html:332`); stage / lang / theme come from the URL (`lesson-engine.js:7-8` has a TODO to read them from `children`).
- The dashboard's "Start Learning" button has no handler (`dashboard.html:249`) and no page links to the lessons.

What the parent dashboard needs, and what is missing:
| Need | Today |
|---|---|
| Per child | **Missing.** Progress key has no child id; two children on one iPad share progress. No auth link at all. |
| Lessons done | Partially there (`completed` flag per item+stage), only in this browser. |
| Stars | Derivable (story / all cards / all quiz → 3 stars), not stored. |
| Time spent | **Not recorded.** No session start / end, no active time. |
| What's next | **Missing.** Needs the child's stage and an ordered item list; stage isn't stored on `children`. |
| Cross-device / durable | **Missing.** Clearing Safari data wipes it. |
| Quiz accuracy (first-try) | **Missing.** `wrongAttempts` is local only and discarded. |

Also a **progress bug**: after two wrong answers the engine reveals the answer (`lesson-engine.js:280-293`) but does **not** add the question to `answeredQuestions`,
so `recomputeProgress()` can never reach 100 %. A child who misses one question never completes that item. Fix as part of v2 (count reveal as "answered, not first-try").

## 3. Proposal

### 3.1 Target architecture (summary)

```
app/lesson.html?subject=farm-animals&child=<uuid>&stage=seedling   ONE page: the child's full-screen experience
app/parent.html (new)                                              light progress dashboard (see 3.4)
css/lesson.css                                                     ONE stylesheet: tokens + components + breakpoints
js/engine/                                                         ES modules (state, cards, quiz, story, buzz, progress, kid-shell, worksheet)
js/subjects/<id>.js                                                DATA ONLY, one per subject (shape in 3.5)
app/lesson-<x>.html                                                become 3-line redirect stubs (3.6)
```
`js/lesson-engine.js` and `js/lessons/*.js` stay in place and untouched until the last step, so each subject cuts over independently and the old pages keep working during the migration.

Rules of the new design:
- **Lessons provide data only.** No functions that return HTML, no CSS, no markup in config. The engine owns three card templates (`photo`, `glyph`, `count`) and four quiz option styles.
- **All styling in `css/lesson.css`.** The engine injects no CSS. No `#id` selectors and no `!important` in the stylesheet (specificity is class-only, flat, which is what makes bug (a) impossible).
- **One DOM.** Because parent view no longer shows cards / quizzes, nothing is re-parented between contexts.

### 3.2 `css/lesson.css` — tokens and components

Tokens (CSS custom properties on `:root`; `[data-theme]` swaps palette values only):
- Colour (semantic, on top of today's honey palette): `--c-bg`, `--c-surface`, `--c-surface-2`, `--c-ink`, `--c-ink-soft`, `--c-accent`, `--c-accent-deep`, `--c-ok`, `--c-try`, `--c-sky-top`, `--c-sky-bottom`.
- Space: `--s-1:4px --s-2:8px --s-3:12px --s-4:16px --s-5:24px --s-6:32px --s-7:48px`.
- Radius: `--r-sm:12px --r-md:20px --r-lg:32px --r-pill:999px`. Shadow: `--shadow-card`, `--shadow-raised`.
- Type (fluid, one scale): `--t-label: clamp(14px,1.8cqw,18px)`, `--t-body`, `--t-title: clamp(28px,5cqw,44px)`, `--t-hero: clamp(64px,22cqh,220px)` (letters / numerals). Fonts unchanged (Fredoka, Nunito).
- Touch: `--hit-min: 56px` (every tappable thing ≥ 56 px for ages 2–6).

Components (each defined once): `.stage` (the playfield), `.card` (flashcard), `.photo`, `.tile` (quiz option), `.chip`, `.btn`, `.topbar`, `.dots`, `.hint`.

Photo treatment (near-white backgrounds, CSS only; `assets/images/` is not modified):
```css
.photo        { background: var(--c-surface); isolation: isolate; border-radius: var(--r-md); padding: var(--s-3); }
.photo img    { display:block; width:100%; height:100%; object-fit:contain; mix-blend-mode:multiply; }
@media print  { .photo img { mix-blend-mode: normal; } }
```
`multiply` turns the near-white photo background into the card colour; the card must be an opaque colour (a gradient is fine) and `isolation:isolate` keeps the blend from reaching the sky behind it.
Known limit: white *parts of the animal* (cow patches, sheep wool) also take the card tint slightly. That reads as natural shading, but the proper fix is transparent PNGs (see decision 3).
`object-fit:contain` plus padding fixes the photos touching the tile edges.

Layout primitive for all sizes: the kid stage is a 3-row grid `grid-template-rows: auto minmax(0,1fr) auto` at `height:100dvh`, with `padding: env(safe-area-inset-*)`.
Scenes size from their own box with **container queries** (`container-type:size`), e.g. photo `= min(78cqw, 52cqh)`, rather than from viewport guesses, so iPad landscape (1180×820, short and wide) works as well as phone portrait.

### 3.3 Breakpoints

| Name | Range | Behaviour |
|---|---|---|
| phone | base, < 600 px | One column; card fills width; quiz tiles 1 column when text is long, else 2; no side chrome. Bottom nav 72 px. |
| iPad | 600–1023 px (820 portrait; 1180 landscape lands in laptop) | Card max 560 px centred; quiz 2 columns; larger hero type. |
| laptop | ≥ 1024 px | Stage capped at `max-width: 960px` and centred on the sky background; quiz 2×2; hover states on. |

Only three media queries exist, all in `lesson.css`: `@media (min-width:600px)` and `@media (min-width:1024px)`, plus `@media (max-height:520px)` for landscape phones. Everything else is intrinsic (grid `auto-fit`, `clamp`, container units).
Quiz tile grid: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr))` — cannot overflow.

### 3.4 Kid Mode vs parent view

**Kid experience = `lesson.html`** (full screen; no tabs, no worksheet, no chat panel, no parent chrome).
- Scenes, one at a time: **Card → Quiz Q1…Qn → Story → Done** (the existing flow, minus the tab UI). Progress dots at the bottom; honey-jar bar at the top.
- Top bar: 🔒 (hold 1.5 s to leave) · progress · hive. The "Hold 🔒 to exit" hint is **inside the top bar, next to the lock**, shown for the first 4 s of the first session. It never overlays the footer or the stage.
- Footer: dots and one big Next. Next lives in the grid's own row, so nothing can sit on it.
- Option labels are **always rendered** (names under photos, letters, numbers). Pre-readers get them read aloud; the "no words" CSS goes away. `optionStyle` in the data decides: `label`, `image`, `image+label`, `glyph`.
- Buzz in Kid Mode uses **tap chips and Buzz's own spoken voice only. There is no free-text typing box.** Child-originated voice input is a separate, open question (see section 7, point 1c); it is **off** in the plan until you decide.
- Entry: parent page → "Start" → `lesson.html?subject=…&child=…`. Exit: hold 🔒 for 1.5 s → a **4-digit PIN pad** → back to the parent page. PIN rules are in section 7.

**Parent view = `app/parent.html`** — a light dashboard, **no cards, no quizzes**. Per child, one card:
- lessons done / total per subject (progress ring or bar), stage badge;
- ⭐ stars total (and this week);
- ⏱ time this week / total, last active;
- ➡️ **Next up**: the first unfinished item in stage order, with a "Start" button (→ kid page);
- a small "Printables" link per subject for the worksheet pack (the print pack stays; it is a parent activity).
The existing `dashboard.html` (child list, add child, Start button) is **protected by CLAUDE.md**, so `parent.html` is a new page; wiring `dashboard.html`'s Start button to the new flow needs you present.

### 3.5 Exact data shape for a subject file (`js/subjects/<id>.js`, `export default {...}`)

```js
export default {
  schema: 2,
  id: 'farm-animals',                     // STABLE FOREVER: URL ?subject=, progress key. Never rename.
  title: 'Farm Animals',
  icon: '🐄',                             // header + chips. Emoji only (never a word)
  noun: { one: 'animal', many: 'animals' },
  cardKind: 'photo',                      // 'photo' | 'glyph' | 'count'  -> picks one engine card template
  theme: 'honey',                         // optional default

  stages: {                               // key order = progression. Keys fixed: seedling | sprout | blossom | bloom
    seedling: {
      label: 'Seedling', age: '2–3',
      items: ['cow', 'camel', 'dog', 'cat', 'duck'],   // ids from `items`, in teaching order
      quizOptions: 2,                                  // 2 / 3 / 3 / 4 per the rubric
      cardBack: ['label', 'sound'],                    // what the back shows: label | sound | fact | baby | home
      storyMaxSentences: 3                             // validated against docs/pedagogy-rubric.md
    },
    sprout:   { /* … same fields … */ },
    blossom:  { /* … */ },
    bloom:    { /* … */ }
  },

  items: {
    cow: {
      label: 'Cow',                       // shown AND read aloud (override with `speak`)
      speak: 'Cow',                       // optional
      emoji: '🐄',                        // fallback glyph; never the only visual if `image` exists
      image: '/assets/images/farm-animals/cow.png',   // cardKind 'photo' (required) / 'glyph' (the word-picture)
      imageAlt: 'A black and white cow',  // required when `image` is set
      glyph: null,                        // cardKind 'glyph': 'A'. cardKind 'count': value is `count`
      count: null,                        // cardKind 'count': 1..n   (+ `countEmoji: '🍯'`)
      sound: { text: 'moo', audio: null },// audio: optional file; else speech synthesis
      facts: { blossom: 'Cows give us milk', bloom: 'A cow has four stomach parts' },
      baby:  { blossom: 'calf' },         // optional, per rubric ("baby" below Blossom)
      story: {                            // plain text, one entry per stage; engine formats it
        seedling: 'This is a cow. Cows say moo.',
        sprout: '…', blossom: '…', bloom: '…'
      },
      clue: 'Which animal says "moo" and gives us milk?',   // for 'hear-pick-image' questions
      confusableWith: ['bull']            // never used as a distractor in the same question
    }
  },

  quiz: [                                 // ordered, applied to every item
    { type: 'see-pick-label',  optionStyle: 'label' },        // show photo/glyph -> choose the name
    { type: 'hear-pick-image', optionStyle: 'image' }         // read the clue    -> choose the photo
  ],                                      // types: see-pick-label | hear-pick-image | see-pick-glyph | count-pick-number

  buzz: {
    persona: 'Buzz the Bee, a warm tutor for a 2–6 year old learning about farm animals.',
    byStage: {
      seedling: { maxWords: 50, style: 'Very simple words, 1–2 short sentences, lots of encouragement.' },
      sprout: {}, blossom: {}, bloom: {}
    },
    greeting: { seedling: 'Hello! Let’s meet the {label}. Say “{sound}”!' },   // {label} {sound} {count} placeholders
    chips: ['sound', 'eats', 'fact', 'easier', 'harder']                       // engine knows these chip ids
  },

  worksheet: { pages: ['trace', 'draw', 'circle', 'match'] },     // engine builds them from items
  strings: { en: { pickItem: 'Pick an animal to learn' } }        // optional overrides of engine strings
};
```
Hard rules (enforced by a no-dependency `node tools/validate-subjects.mjs` run before every migration step and in CI):
- every id in `stages[*].items` exists in `items`; stage lists are supersets of the previous stage;
- `quizOptions` ≤ number of eligible distractors; `image` files exist; `imageAlt` present;
- story sentence counts, fact word counts and quiz option counts match the rubric (`docs/pedagogy-rubric.md`);
- ids never disappear between commits (progress keys depend on them);
- **no HTML, no functions, no CSS** anywhere in the file.
The engine appends the global Buzz safety rules (never harsh, never ask for personal details, no scary content) to every persona, in one place, instead of repeating them per lesson.

### 3.6 Old URLs keep working

`app/lesson-numbers.html`, `lesson-alphabet.html`, `lesson-farm-animals.html` become redirect stubs once their subject is migrated:
```html
<!doctype html><meta charset="utf-8"><title>LearnHives</title>
<script>location.replace('lesson.html?subject=numbers' + (location.search ? '&' + location.search.slice(1) : ''))</script>
<noscript><meta http-equiv="refresh" content="0;url=lesson.html?subject=numbers"></noscript>
```
This preserves `?stage=`, `?lang=`, `?theme=` and iPad home-screen bookmarks, needs no deploy config, and the stub can be deleted months later.
(A `vercel.json` 308 redirect would be cleaner but is a deploy-config change; not proposed without you.)

### 3.7 Progress data for the parent dashboard (needs you present — SQL and RLS)

**The SQL is now drafted in `docs/engine-v2-sql.md` (not run).** Summary of what it stores, per your data-minimisation rules:
- `lesson_progress`: child id, subject, stage, item id, stars (0–3), completed, date.
- `lesson_sessions`: child id, subject, stage, date, active minutes (raw rows deleted after 12 months).
- `lesson_daily_totals`: child id, subject, day, active minutes (kept; maintained by a trigger).
- `children.stage`; `parent_profiles` (consent flag, timestamp, version); `parent_pins` (bcrypt hash, lockout counter; unreachable from the browser except via two functions).
- RLS on every table so a parent sees only their own children. No free text from the child, no device or location data, no analytics.

Writes come from the browser as the signed-in parent (the kid page runs under the parent's session): item state when it changes, and active minutes accrued while the page is visible and the child has interacted in the last 60 s, flushed on `visibilitychange` / `pagehide`. Offline: queue in localStorage and replay.
Stars: ⭐ story, ⭐ all cards seen, ⭐ all quiz questions answered (a revealed answer counts as answered). First-try accuracy is **not** stored, to keep the data minimal; the earlier draft's `cards_seen` / `quiz_first_try` columns are dropped.
A one-time import of existing `lh_progress_*` localStorage keys is optional and only on the parent's explicit choice.

## 4. Migration order and gate

The original step table is superseded by the **evening-by-evening build plan in section 9**. The gate below applies to every evening that changes pages.
Per CLAUDE.md each evening is its own `bus/<task>` branch from `main` and needs its own entry in TASKS.md (I cannot add tasks). Protected files (`api/`, `.env`, login / signup / reset / pricing / dashboard, `supabase-rls-setup.sql`, Colors & Shapes, `assets/images/`) are only touched on the evenings marked **you present**.

**Gate after every evening** (screenshot script, 390 / 820 / 1280 × the views that exist by then, plus Stage 2–4 and the Story scene once they exist):
1. no horizontal overflow (`scrollWidth <= innerWidth`) at 390 / 820 / 1280;
2. no element's bounding box overlaps the Next button in kid mode (catches bug b automatically);
3. every quiz tile has visible text or an `<img alt>`; no tile is clipped by its container;
4. photos are not touching tile edges; no white boxes on cream (blend or cut-out, once chosen);
5. I eyeball the PNGs; you check on iPad.

## 5. Risks, effort, and what needs you

Needs you present (touches protected areas):
- **Supabase SQL and RLS** (Evenings 8, 9, 11): the SQL is drafted in `docs/engine-v2-sql.md`; you run it with me present; I do not run it.
- **Auth**: the kid page must run under the parent's session and carry a `child` id; it must check the child belongs to the signed-in parent (RLS enforces it, but the page needs a sign-in redirect). Touches login flow expectations.
- **`app/dashboard.html`**: the Start Learning button has no handler; making it open the kid page, and linking to `parent.html`, is an edit to a protected page.
- **`api/claude-proxy`**: v2 keeps the same request shape, so no change is needed (the kid page sends only Buzz chip prompts, no typed text). If you want server-side enforcement of the Buzz safety rules (recommended — today they live in client-side prompts that the client sends), that is an `api/` change.
- `vercel.json` redirects, if ever wanted.

Other risks:
- **Known risk, accepted:** the 4-digit PIN has no server-side secret (section 7, 1b).
- **Cross-border storage:** Supabase is in Tokyo (section 8); lawyer review pending.
- **Behavioural regression in Kid Mode** (the most polished part today: confetti, bee wiggle, chips). Mitigation: port behaviour module-by-module and diff screenshots; keep the old engine until step 5.
- **`mix-blend-mode: multiply`** tints the white parts of animals slightly; verify on iPad Safari (supported, but `isolation` bugs have existed in older WebKit).
- **iPad Safari fullscreen**: the Fullscreen API is not available on iPhone and limited on iPad; the current "scrollTo(0,1)" trick is a hack. v2 should use a PWA-style full-viewport layout (`100dvh`, safe-area insets) and not depend on fullscreen. Needs a real-iPad test.
- **Parent loses the free-text Buzz chat and the Cards / Quiz tabs.** That is intended, but confirm you do not want a "peek at what my child sees" parent preview.
- **Progress keys**: item ids must never change, or progress is orphaned. The validator guards this.
- **Photos**: originals in `assets/images/` stay untouched; cut-outs go in `assets/images-cutout/` after the 5-image pilot is approved (Evening 2). CSS blend remains the fallback.
- **Colours & Shapes** still uses the old engine. It is excluded from the rebuild; Evening 13 unlinks it from the live site (no files deleted) and it will be rebuilt later on the new engine.
- **Security note (outside scope, spotted while reading):** `app/dashboard.html:247` inserts `child.name` into `innerHTML` unescaped (stored XSS within the parent's own account). Low severity, but trivial to fix when you're present to edit that page.
- **Process**: CLAUDE.md says tasks come only from TASKS.md, so none of this can start until you add the steps.

## 6. Decisions (round 1, answered)

All three round-1 questions were answered; the answers are in section 7.

## 7. Decisions taken (rounds 2 and 3, from the owner)

1. **Kid Mode is its own full-screen page; the parent view is a progress-only page (no cards, no quizzes).**
   a. In Kid Mode, Buzz uses **tap chips and voice only, no free-text typing.**
   b. **Leaving Kid Mode needs a 4-digit parent PIN:** set by the parent, **stored hashed in Supabase**, **reset by entering the parent's account password**. Implemented as `set_parent_pin` / `verify_parent_pin` in the SQL draft: bcrypt, 5 wrong tries = 60 s lockout, reset only within 5 minutes of a password sign-in.
      Limits to know: the PIN stops a child leaving the app; it cannot stop closing the browser tab (a web page cannot lock a device). Checking the PIN needs a connection; offline, the exit is "close the tab". A 4-digit PIN is brute-forceable if the database itself leaks; a server-side pepper would fix that (touches `api/`). **Decision: accepted for now, without a server secret. Recorded as a known risk** (also listed in section 5).
   c. **Child voice input: OFF at launch (decided).** Buzz speaks (on-device text-to-speech); the child taps chips. The browser's speech recognition (which sends audio to Google or Apple) is not used. Evening 4 builds the switch, default off; turning it on later is a separate decision with a lawyer's input.
2. **Supabase approved:** `lesson_progress`, `lesson_sessions`, `children.stage`, RLS so a parent sees only their own children. Active minutes per child per day, with data minimisation:
   - stored: child id, subject, stage, item completed, stars, date, active minutes. No free text from the child, no device or location data;
   - shown only to that parent; no third-party analytics, no ads, no profiling;
   - raw sessions older than 12 months deleted (daily totals kept);
   - a "delete my child's data" path for the parent;
   - a parental-consent field (given + timestamp, plus policy version) on the parent profile, set at sign-up.
   SQL is in **`docs/engine-v2-sql.md`**. It has not been run and will not be run by Claude; the owner runs it with Claude present (Evening 8).
3. **Transparent photos approved**, in a new folder `assets/images-cutout/`; `assets/images/` is never touched. **Pilot first on 5 images only: sheep, goose, cow, duck, camel.** Deliver before/after screenshots on a cream card at 820 px. The other images are **not** processed until the owner approves the pilot (Evening 2). CSS `mix-blend-mode: multiply` stays as the fallback.

4. **Launch markets: UAE and India. The company is registered in India.** Colours & Shapes will be rebuilt later on the new engine; **in Evening 13 it is removed from the live site by unlinking it. No files are deleted or renamed without asking.** Evening 13 is therefore unblocked.
5. **Known risk accepted:** 4-digit PIN without a server-side secret (see 1b).
6. **Schedule:** steps that do not need the owner (1–7, 10, 13) may run overnight on one branch, `bus/engine-v2`, one step per night, each ending with screenshots at 390 / 820 / 1280 and a NIGHT-REPORT.md entry. Steps 8, 9, 11 and 12 wait for the owner. Step 1 (screenshot tool) is merged on origin/main; only the baseline shots remain.

## 8. Child-privacy compliance check (research notes, not legal advice)

I am not a lawyer; this is a desk check of public summaries. Confirm with a privacy lawyer before launch.
Data in play: a child's first name or nickname, age, avatar, learning progress and active minutes, all linked to the parent's account.

| Regime | Applies if | What it means here |
|---|---|---|
| **UAE Federal Decree-Law 26 of 2025 (Child Digital Safety)**, in force 1 Jan 2026, fully enforceable Jan 2027 | You operate in or target UAE users | No collecting or processing of data of children under 13 without verifiable parental consent, an easy way to withdraw it, and clear disclosures; no commercial use or targeted ads; high-privacy defaults; limits on excessive screen time. Education platforms may be exempted by Cabinet decision. |
| **UAE PDPL (Decree-Law 45 of 2021)** | UAE | Text not checked; needs its own review. |
| **India DPDP Act 2023 and DPDP Rules 2025** (company registered in India; Indian users) | Always for the company; and for users in India | **A child is anyone under 18**, not 13. Verifiable parental consent is needed to process a child's data. Commentary reads s.9 as also barring tracking or behavioural monitoring of children and targeted advertising aimed at them, and as limiting harm. The Rules reportedly expect a reliable check that the consenting adult is the parent (e.g. identity-linked credentials), so a simple tick-box may not be enough. Education-related exemptions exist but are narrow and may not cover a private online learning app. **Two questions for the lawyer:** does recording *active minutes per child* count as "behavioural monitoring", and what parent-verification method is acceptable? Rule numbers differ between sources; confirm in the notified text. |
| **US COPPA**, amended rule effective 23 Jun 2025, compliance by 22 Apr 2026 | Under-13s in the US | Verifiable parental consent; a **written, published retention policy**; separate consent for ads or third-party sharing. |
| **UK GDPR + ICO Children's Code** | UK / EU users | Minimisation, high-privacy defaults, no profiling by default, retention limits, a data-protection impact assessment. |

How the owner's decisions line up with these:
- minimal fields, no child free text, no device or location data → data minimisation;
- parent consent field at sign-up, with timestamp and version → verifiable consent record (the *method* of verifying a parent, e.g. card or email loop, still needs a legal decision);
- 12-month raw retention, deletion path → retention and erasure;
- no analytics, no ads, no profiling → high-privacy default;
- an optional "time for a break" nudge after N active minutes fits the screen-time expectations and the data already collected.
**Cross-border transfer (flag for lawyer review; no change now):** the Supabase project is hosted in **Tokyo (Japan)**. Children's and parents' data from UAE and Indian users is therefore stored outside both countries. Lawyer to confirm what the UAE laws and the DPDP Act (which restricts transfers only to countries the government may notify) require, whether consent text must mention the transfer, and whether a data-processing agreement with Supabase is needed. Nothing changes in the plan now.
Still to do before launch (content, not code): update the privacy policy in `legal/` (what is collected, why, 12-month retention, deletion, the AI provider and what Buzz chips send it); launch markets are UAE and India (company in India), so the India row above is binding for the company and the UAE row for UAE users.

## 9. Step-by-step build plan (one step = one evening, about 2 to 3 hours)

Nothing below has been started. Each evening: its own branch from `main`, an entry in TASKS.md, a report in NIGHT-REPORT.md, and **screenshots at 390 / 820 / 1280 at the end** (the section 4 gate). An evening that finds a problem stops there; the next evening does not start until you approve.
**Schedule (decided):** evenings 1–7, 10 and 13 may run overnight, one per night, all on branch `bus/engine-v2` (this supersedes the per-evening branch names in the table below), each ending with screenshots at 390 / 820 / 1280 and a NIGHT-REPORT.md entry. Evenings 8, 9, 11 and 12 wait for the owner. **Evening 1 is already done** (the screenshot tool is merged on origin/main); only the baseline shots remain. Evening 2 is run live with the owner watching and **stops for a verdict before anything is committed**.
"You present" marks evenings that touch protected files, SQL, or auth.

| # | Evening | Branch | What is done | Screenshots at the end | You present? |
|---|---|---|---|---|---|
| 1 | **Tooling and baseline** | `bus/shots-v2` | Land `bus/screenshot-tool` on main (you merge it first); add `--root`; add the gate assertions (overflow, Next-button overlap, tile text, edge padding); add Story tab, Stage 2–4 and correct / wrong state shots; add `tools/validate-subjects.mjs` (skeleton). | Baseline of the three current lessons, all views. | You merge `bus/screenshot-tool` |
| 2 | **Photo pilot (5 images)** | `bus/photo-pilot` | Create `assets/images-cutout/farm-animals/` with **sheep, goose, cow, duck, camel** only, made from copies of the originals with ImageMagick (already installed; no packages): flood-fill the near-white background from the image edges with a small tolerance, defringe, 1 px feather, keep the original 512 px size. Originals untouched. Risk: white coats (cow patches, sheep wool) touching a white background can be eaten by the fill; I will inspect each at 400 %. Camel exists only on `bus/farm-animals`; I will read it from that branch without changing it. | **Before / after on a cream card at 820 px for each of the 5**, plus the same at 390 and 1280. **Then stop for your approval. The other 11 images are not processed.** | Only to approve |
| 3 | **CSS foundation + kid-page shell** | `bus/engine-v2-shell` | `css/lesson.css` (tokens, breakpoints, `.card`, `.photo`, `.tile`, `.chip`, `.btn`, top bar, dots, hint in the top bar); `app/lesson.html` shell with a built-in "kitchen sink" demo (fake data, no engine yet) so every component is seen at all widths. Old files untouched. | Kitchen-sink page at 390 / 820 / 1280 (card with a photo, 2 / 3 / 4 tiles, long labels, hint, Next). | No |
| 4 | **Engine core + Numbers (Stage 1)** | `bus/engine-v2-numbers` | `js/engine/*` (state, card, quiz, story, done, Buzz chips with Buzz's own spoken voice, progress to localStorage as today); `js/subjects/numbers.js` (data only, validator passes); card kind `count`. Child voice input exists only as a switch, **off**. Fix the "wrong twice, never completes" bug. | `lesson.html?subject=numbers` card / quiz / story / done at 3 widths. | No |
| 5 | **Numbers complete + old URL** | `bus/engine-v2-numbers-2` | Stages 2–4, celebration and bee polish ported from the old Kid Mode, stub for `lesson-numbers.html`. Gate must be fully green. | All stages, all scenes, 3 widths; old URL redirect check. | No |
| 6 | **Alphabet** | `bus/engine-v2-alphabet` | `js/subjects/alphabet.js`, card kind `glyph`, quiz `see-pick-glyph`, stub for the old page. | All scenes, 3 widths. | No |
| 7 | **Farm Animals** | `bus/engine-v2-farm` | `js/subjects/farm-animals.js` from the content already on `bus/farm-animals` (rubric v2), card kind `photo`, both quiz types. Uses cut-outs for the 5 piloted animals if you approved them, blend for the rest. Fixes bug (c) by construction. | All scenes, 3 widths, including the sound-clue quiz. | Only if pilot images are in |
| 8 | **Supabase evening** | `bus/engine-v2-sql-run` | Run `docs/engine-v2-sql.md` blocks A to H in the SQL Editor, one at a time, then verification V1 to V13 with two test parents. I read results back; I do not run SQL. Add the verification output to NIGHT-REPORT.md. | Static parent-page shell (no data yet) at 3 widths. | **Yes, you run it** |
| 9 | **Saving progress + PIN exit** | `bus/engine-v2-progress` | Kid page reads `child`, writes `lesson_progress` and active minutes (visible and interacted in the last 60 s; flush on hide; offline queue), loads child's stage. Hold-the-lock opens the PIN pad (`verify_parent_pin`, lockout message), exit returns to the parent page. Requires a sign-in redirect when there is no session. | PIN pad at 3 widths: empty, wrong PIN, locked. | **Yes (auth)** |
| 10 | **Parent progress page** | `bus/engine-v2-parent` | New `app/parent.html`: per child lessons done, stars, minutes this week and total, next up, a Start button; set / change PIN (reset via account password); consent status; "delete my child's data"; "download my child's data" (CSV built in the browser). | Parent page with 0, 1 and 3 children at 3 widths. | Test with you |
| 11 | **Protected-page wiring** | `bus/engine-v2-wiring` | `signup.html` consent checkbox (passes `consent_given` and version), `dashboard.html` Start button and link to `parent.html`, the unescaped `child.name` fix, privacy-policy text in `legal/`. Existing parents are asked for consent on next login. | Changed pages at 3 widths. | **Yes (protected files)** |
| 12 | **Cross-platform QA + photo rollout** | `bus/photo-rollout` | Only after you approve the pilot: process the remaining 11 images into `assets/images-cutout/`; test everything on iPad Safari, iPhone Safari, Chrome and laptop with you; then switch the image root in the subject files so **all platforms** use cut-outs together. | Full set, 3 widths; side-by-side old / new. | **Yes, real devices** |
| 13 | **Cleanup** | `bus/engine-v2-cleanup` | Delete `js/lesson-engine.js`, `js/lessons/*`, redirect stubs once bookmarks are gone. **Also: remove Colours & Shapes from the live site by unlinking it** (find and remove the links to `app/lesson-colors-shapes.html`; **do not delete or rename any file without asking**). Then the old engine's last user is gone. | Final regression set. | None |

Effort: about 13 evenings, i.e. 2.5 to 3 weeks at an evening a day. Evenings 3 to 7 (all layout work) can ship before 8 to 11; until then progress stays in localStorage as it does today.
Evening 2 (the pilot) is independent and can be done first if you want to see the photos before anything else.
Before anything starts: add the evenings you want to TASKS.md. Nothing here has been built, run or committed.
