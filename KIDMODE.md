# 🐝 LearnHives — Kid Mode Spec

**Why:** The lesson page serves two users on one screen. Parents need nav, print,
progress, settings. Children (2–6, pre-readers, no scroll control) need a
full-screen, scroll-free, icon-driven learning surface. Kid Mode separates them.

**Decision date:** Day 17 planning (Jun 2026). Build before remaining lessons —
every lesson built after Kid Mode inherits it free.

---

## 1. Architecture

**One page, two views, one engine state.**
- The lesson page keeps a **parent view** (current layout, decluttered).
- A **kid layer** is a fullscreen takeover (`<div id="kidMode">` + Fullscreen
  API) rendered by the same engine over the same state. No separate page, no
  duplicated progress.
- Engine gets one new concept: `mode: 'parent' | 'kid'`. Config render
  functions receive it (or engine swaps layouts) — content identical, chrome
  differs.

## 2. Entry & exit

- **Entry:** big button on parent view — **🧒 "Hand to child"** → requests
  fullscreen, shows kid layer, starts the guided flow.
- **Exit (toddler-proof):** **press-and-hold 3 seconds on a corner lock icon
  🔒** → returns to parent view + progress summary. On entry, show parents a
  one-line hint ("Hold the lock to exit"). Browser ESC/back still works —
  acceptable for web; the future app can harden this.
- Exiting never loses progress (state is shared).

## 3. Kid screen — guided flow (no tabs)

**DECIDED:** flow-driven, completion-based. Tabs removed in Kid Mode.

```
Cards (all items or today's set) → Quiz → Story → 🎉 Celebration
```

- One activity fills the viewport at a time. **No scrolling ever** — content
  scales to fit (viewport-sized layout, `dvh` units, safe-area aware).
- Navigation = **one giant → arrow** (and ← where sensible). No words.
- Progress = **visual only**: honey jar filling / Buzz flying along a dotted
  path. No percentages, no text.
- Parent-settable flow preferences (skip story, free-explore mode) = later
  (`#backlog`).

## 4. No-words policy (kid layer)

The only readable text on the kid screen is **the learning content itself**
("Ten", "B is for Ball"). All UI is symbolic + spoken:

| Current | Kid Mode |
| --- | --- |
| "Prev" / "Next" buttons | Giant ← → arrows |
| "Tap to flip!" caption | Card wobble/pulse hint animation; tap anywhere flips |
| Buzz chips ("Count to 10", "Fun fact"…) | Icon chips: 🔢 🔊 ⭐ 🟢 🔴 — tap = Buzz speaks |
| "How many?" quiz text | TTS speaks the question aloud (text may remain, small) |
| Header badges (stage, age, "10 of 10") | Removed entirely |
| Print / worksheet / dashboard | Removed entirely (parent view only) |

## 5. Card rules (fixes current bugs)

- **Fixed card size** at every stage and number — content scales inside, card
  doesn't grow/shrink (kills the layout-jump bug).
- **Content fills ≥80%** of the card; chrome ≤20%.
- **🔊 speaker icon works:** tap speaks (TTS), does NOT flip the card —
  `stopPropagation` on the speaker handler (current bug).
- **Counting cards (numbers lesson) — content model fix:**
  - Counting objects are ALWAYS one consistent object (🍯), every stage.
  - Counts >10 render as **a full ten-group + remainder group** (10 + 8), never
    a scattered pile.
  - **Varied per-number emoji (🦜 = 18) appears ONLY on identity/word cards and
    quiz "find the numeral" images — NEVER as counting objects.** (Current bug:
    18 parrots teaches "the parrot number," not quantity.)
- Quiz "How many?" images follow the same grouping rule.

## 6. Palette — calm chrome, vivid objects

- **Chrome** (background, frames, buttons): stays honey-warm neutrals. Calm.
- **Learning objects** (counting items, swatches, shapes, celebration): a
  saturated accent palette — true red, blue, green, yellow (define as CSS
  variables, e.g. `--vivid-red` etc., per theme).
- Celebration moments may go loud (confetti, stars). Ambient screen never does.
- Respect `prefers-reduced-motion` throughout (existing principle).

## 7. Parent view cleanup (same session or next)

- Lesson header → compact: subject icon + title + small "10 of 10". Stage/age
  badges removed (dashboard info).
- Worksheet block → one row: 📄 **Print worksheet** (+ pack link).
- Tab bar CSS consistency fix (sizes/backgrounds differ today) — only matters
  in parent view since kid view drops tabs.
- Keep: progress bar, Buzz panel, Print pack, Dashboard link.

## 8. Build phases (Claude Code prompts, one at a time)

1. **Phase 1 — the layer:** kid-mode container + fullscreen entry/exit + guided
   flow state machine (cards→quiz→story→celebration) reusing existing engine
   activities. Alphabet + numbers both work in it.
2. **Phase 2 — interaction pass:** no-words conversions (arrows, icon chips,
   wobble hint), TTS question reading, speaker bug fix, fixed card size,
   counting-object content rules.
3. **Phase 3 — feel:** celebration screen, visual progress (jar/bee), vivid
   object palette tokens, reduced-motion audit.

Each phase = review diff → push → test on deployed site at all 4 stages →
report → next.

## 9. Decisions — LOCKED (Day 17)

- [x] **Exit gesture:** hold-lock 🔒 3 seconds, as proposed.
- [x] **Quiz gating:** existing mechanic IS the gate — 2 wrong attempts →
      reveal answer → flow moves on. Completion = attempted; child always sees
      the correct answer, never gets stuck.
- [x] **Celebration: BOTH** — small mini-celebration on completing each
      activity (quick stars/pulse), one big celebration at flow end (confetti,
      Buzz, honey).
- [x] **Entry: parent view first, always.** "Start Learning" lands on the
      parent view (parent may want printouts or an overview); parent taps
      "Hand to child" to enter Kid Mode.
