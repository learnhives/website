# 🐝 LearnHives — Backlog

A living list of parked items, ideas, and upcoming work. Organized by hashtag so
items are easy to scan and group. Update freely as things get added or done.

**How to use across sessions:** when starting a work session, point at a tag
(e.g. "let's do #architecture-next — the dashboard catalog") and pull the
relevant section into the chat. Move finished items to the bottom under
`## ✅ Done`.

_Last updated: Day 15 (Jun 2026)_

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

- [ ] `lesson-numbers.html` — next subject (numbers 1–20). Fast now on the clean
      template (module config + stage/lang/theme seams).
- [ ] Remaining subjects: Colors & Shapes, Nature & Animals, Music & Emotions,
      Motion & Movement.
- [ ] Dashboard: show overall progress across all lessons.

## #content-depth
_Richer lesson content._

- [ ] Add more than 4 words per letter in `alphabet.js` so older stages
      (Blossom / Bloom) have richer "more examples" activities.

## #worksheet-tuning
_Minor worksheet layout/spacing tweaks (anytime)._

- [ ] Small fine-tuning tweaks flagged during the Day 15 worksheet redesign.

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

## #vision
_Long-horizon north-star items._

- [ ] **Longitudinal personalization** — "championing the individual child."
      Capture clean structured interaction events starting ~Day 18. Framing =
      strengths / next-steps, NOT global ranking. COPPA/GDPR-compliant by design.
- [ ] **Grade-school expansion** — Standard 1–6, block-based coding, STEM
      (the "Later" half of the stage/lesson grid).

---

## ✅ Done
_Move completed items here with the day they landed._

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
