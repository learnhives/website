# 🐝 LearnHives — Backlog

A living list of parked items, ideas, and upcoming work. Organized by hashtag so
items are easy to scan and group. Update freely as things get added or done.

**How to use across sessions:** when starting a work session, point at a tag
(e.g. "let's do #architecture-next — the dashboard catalog") and pull the
relevant section into the chat. Move finished items to the bottom under
`## ✅ Done`.

_Last updated: Day 17 (Jun 2026)_

---

## #architecture-next
_Real structural work — higher priority than polish._

- [ ] **Dashboard lesson catalog** — make the stage-tagged grid real (from the
      `catalog.js` design artifact) so each child sees the right lessons for
      their stage. Lessons are tagged with the stages they appear in; counts per
      stage are independent/unlimited.
- [ ] **Wire Supabase child-profile into the settings seam** — swap the
      URL/default fallback for `child.stage` / `lang` / `theme`. TODO comments
      already mark the exact spots in `lesson-alphabet.html`.
- [ ] **Migrate lesson configs + catalog to Supabase** (post-launch) — lessons as
      data rows; stage-specific / independent lesson counts become DB inserts,
      not code changes.

## #product-next
_Building the product forward._

- [ ] **Quiz zone distribution** — kid quiz screen: answer tiles crammed at top, empty
      void below the Next Question button. One layout fix in `lesson-engine.js` (make
      `.quiz-options` fill remaining height, same pattern as cards/story already use).
- [ ] **Colors & Shapes verification** — config + HTML shell exist
      (`js/lessons/colors-shapes.js`, `app/lesson-colors-shapes.html`) but have not
      been tested in the kid frame. Review pass + link to dashboard.
- [ ] Remaining subjects: Nature & Animals, Music & Emotions, Motion & Movement.
- [ ] Dashboard: show overall progress across all lessons.

## #content-depth
_Richer lesson content._

- [ ] Add more than 4 words per letter in `alphabet.js` so older stages
      (Blossom / Bloom) have richer "more examples" activities.

## #worksheet-tuning
_Minor worksheet layout/spacing tweaks (anytime)._

- [ ] Small fine-tuning tweaks flagged during the Day 15 worksheet redesign.
- [ ] **Stage-aware lesson subtitle** — breadcrumb hardcoded "Numbers · 1 to 20";
      should read "1 to 10" for Seedling/Sprout and "1 to 20" for Blossom/Bloom.

## #polish-feel
_One combined "make it feel alive" session — best done after a few more lessons
exist, so it can be judged across the whole app. All lightweight, kid-appropriate,
and must respect `prefers-reduced-motion`._

- [ ] **Ambient animation** — buzzing bee, blossoming flowers, gentle seasonal
      touches (rain / wind). Purposeful, not constant; off-by-default-able.
- [ ] **Themed backgrounds** — replace the geometric honeycomb with soft per-theme
      "worlds" (ocean → beach, forest → trees). Approach: gradient sky + simple
      silhouette strip at the bottom, all CSS/SVG (lightweight), NOT photographic
      scenes. Design together with animation so they're coherent.

## #infra
_Small setup items, when convenient._

- [ ] `vercel dev` local setup — full local testing including Buzz (ES modules +
      serverless functions together, not just `file://` / Live Server).
- [ ] **iOS mobile-chrome** — Safari address bar can't be fully hidden on the web
      (platform limit). `apple-mobile-web-app-capable` meta tags + scroll trick are in
      place. Best fix is PWA add-to-home-screen. Known limitation, not a bug.

## #vision
_Long-horizon north-star items._

- [ ] **Longitudinal personalization** — "championing the individual child."
      Capture clean structured interaction events starting ~Day 19. Framing =
      strengths / next-steps, NOT global ranking. COPPA/GDPR-compliant by design.
- [ ] **Kid-Buzz voice mic** — open-mic voice input for children in Kid Mode.
      Deferred: requires a child-safety system prompt design + parent consent flow
      (COPPA). Not a simple UI addition.
- [ ] **Grade-school expansion** — Standard 1–6, block-based coding, STEM
      (the "Later" half of the stage/lesson grid).

---

## ✅ Done
_Move completed items here with the day they landed._

- [x] **Day 17** — **Kid Mode** built into `lesson-engine.js`; every future lesson inherits it for free:
  - Full-screen child layer (`<div id="kidMode">`, `position:fixed`). Parent view is
    `display:none` while Kid Mode is active.
  - Guided flow: Cards → Quiz → Story → Celebration. No tabs; giant ← → arrows; dot
    progress indicators; hold-🔒-3s toddler-proof exit.
  - Hive world backdrop: gradient sky, SVG honeycomb hive, drifting bees, honey-drip
    top border, grass strip — all original CSS/SVG, `prefers-reduced-motion` respected.
  - Real-AI Buzz: front-facing SVG bee, idle hover + 5s wiggle hint. Tap → 3 chips
    (🔢 🔊 ⭐) → each chip calls `/api/claude-proxy` with per-stage system prompt +
    speaks Claude's 1-sentence reply via TTS. Graceful spoken fallback on failure.
  - Pinch-zoom + double-tap-zoom disabled on lesson pages.
  - Numbers lesson: single combo card per number (numeral + honey-pot count grouped
    10+remainder). Fixes the 2-card split that showed "1 honey pot = Ten".
- [x] **Day 16** — Extracted shared lesson engine into `js/lesson-engine.js` (single export
      `startLesson(config)`). `lesson-alphabet.html` is now a 4-line shell. Engine is
      subject-agnostic: `config.items` / `config.getItems(stage)` for item sets,
      `config.renderCard` / `config.renderWorksheet` for rendering, `config.uiStrings`
      for per-subject label overrides.
- [x] **Day 16** — `lesson-numbers.html` built: 1–20, four stages. Seedling/Sprout show
      1–10 (🍯 objects, ten-frame for 6–10, no word for Seedling); Blossom/Bloom show
      1–20 (per-number emoji, number word; Bloom adds a +1 peek). Config-only build on
      the engine — no engine changes needed.
- [x] **Day 15** — `lesson-alphabet.html` full build: A–Z data-driven lesson,
      flashcards, story (with Listen TTS), Buzz AI tutor, voice input.
- [x] **Day 15** — Quiz that teaches: correct-answer-required, 2-try reveal,
      no reward for guessing; emoji + spoken feedback for non-readers; pulse-glow
      on correct answer.
- [x] **Day 15** — Age-differentiated single-page worksheets (all 4 stages) +
      A–Z pack with print confirmation. Fixed print bugs (pseudo-element overlay,
      2nd blank page).
- [x] **Day 15** — Separated lesson config into ES module `js/lessons/alphabet.js`
      (engine / content decoupled).
- [x] **Day 15** — Stage locked to profile via settings seam; `?preview=1` dev
      flag; Supabase profile wiring marked with TODO.
- [x] **Day 15** — Language (i18n) + theme seams via one consolidated settings
      helper (stage / lang / theme). English + honey default; ocean theme proven.
- [x] **Day 15** — Designed lesson catalog (`catalog.js` artifact) — stage-tagged
      grid; added Motion & Movement as a core subject.
