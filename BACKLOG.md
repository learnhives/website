# 🐝 LearnHives — Backlog

A living list of parked items, ideas, and upcoming work. Organized by hashtag so
items are easy to scan and group. Update freely as things get added or done.

**How to use across sessions:** when starting a work session, point at a tag
(e.g. "let's do #architecture-next — the dashboard catalog") and pull the
relevant section into the chat. Move finished items to the bottom under
`## ✅ Done`.

_Last updated: Day 17 (Jun 2026)_

---

## #bug-fix
_Correctness issues — fix before building more lessons._

- [ ] **Numbers quiz: wrong object count** — "Find the number 'Two'" quiz shows a
      single per-number emoji (one bee) instead of 2 honeypots. Child sees one
      object and picks "1." Fix is in `numbers.js` `buildQuiz`: replace single
      emoji with correct quantity of 🍯 using same grouping logic as cards.

## #engine-next
_Engine changes needed before mass lesson production._

- [ ] **Image support in renderCard** — engine currently returns emoji from
      `renderCard`. Needs to also support `<img src="...">` so photo-based
      subjects (animals, fruits, vegetables, transport) can display AI-generated
      photos. One small change; all photo configs benefit.
- [ ] **Scrap old colors-shapes** — delete `js/lessons/colors-shapes.js` and
      `app/lesson-colors-shapes.html`. Replace with separate `colors.js` and
      `shapes.js` configs.

## #lesson-production
_Building the 12 remaining configs. Build in batches of 3–4, test each batch._

**Batch 1 (emoji-based, no photos needed):**
- [ ] `colors.js` + `app/lesson-colors.html` — color swatches + example objects
- [ ] `shapes.js` + `app/lesson-shapes.html` — geometric shapes + real-world matches

**Batch 2 (photo-based — needs images generated first):**
- [ ] `farm-animals.js` + `app/lesson-farm-animals.html`
- [ ] `wild-animals.js` + `app/lesson-wild-animals.html`
- [ ] `birds.js` + `app/lesson-birds.html`

**Batch 3 (photo-based):**
- [ ] `fruits.js` + `app/lesson-fruits.html`
- [ ] `vegetables.js` + `app/lesson-vegetables.html`
- [ ] `transport.js` + `app/lesson-transport.html`

**Batch 4 (emoji-based):**
- [ ] `music.js` + `app/lesson-music.html` — instruments, sound on card flip
- [ ] `emotions.js` + `app/lesson-emotions.html` — emoji faces + scenarios

**Batch 5 (Blossom/Bloom only, emoji-based):**
- [ ] `occupations.js` + `app/lesson-occupations.html`
- [ ] `my-world.js` + `app/lesson-my-world.html` — places + daily objects

## #images
_AI-generated photo assets for 6 visual-recognition subjects._

- [ ] **Generate 91 images via DALL-E** — see `LearnHives_Image_List.xlsx` for
      full checklist with filenames. 5 test images done (cow, lion, eagle, apple,
      carrot). Style locked: square 1:1, white background, studio lighting.
- [ ] **Add images to repo** — `assets/images/{subject-folder}/{item}.png`.
      Commute-time work; can be done in parallel with config writing.

## #architecture-next
_Real structural work — higher priority than polish._

- [ ] **Dashboard lesson catalog** — make the stage-tagged grid real (from the
      `catalog.js` design artifact) so each child sees the right lessons for
      their stage. Must now handle 12 subjects for Seedling/Sprout and 14 for
      Blossom/Bloom.
- [ ] **Wire Supabase child-profile into the settings seam** — swap the
      URL/default fallback for `child.stage` / `lang` / `theme`. TODO comments
      already mark the exact spots in lesson pages.
- [ ] **Migrate lesson configs + catalog to Supabase** (post-launch) — lessons as
      data rows; stage-specific / independent lesson counts become DB inserts,
      not code changes.

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
_One combined "make it feel alive" session — best done after most lessons exist._

- [ ] **Ambient animation** — buzzing bee, blossoming flowers, gentle seasonal
      touches. Purposeful, not constant; off-by-default-able.
- [ ] **Themed backgrounds** — replace the geometric honeycomb with soft per-theme
      "worlds." Gradient sky + simple silhouette strip, all CSS/SVG.

## #infra
_Small setup items, when convenient._

- [ ] `vercel dev` local setup — full local testing including Buzz.
- [ ] **iOS mobile-chrome** — Safari address bar platform limit. PWA
      add-to-home-screen is the best fix. Known limitation, not a bug.

## #vision
_Long-horizon north-star items._

- [ ] **Hive world gamification** — persistent world per child (forest/hive),
      earn honeypots → grow bees → build hive. Township/Garden Escape inspired.
      3–6 month build; post-launch differentiator, not a launch feature.
- [ ] **Pronunciation checking** — mic input + API comparison for letter/word
      pronunciation. Web Speech API recognition is already in Buzz chat;
      extending to "say this letter" is doable post-launch.
- [ ] **Longitudinal personalization** — "championing the individual child."
      Clean structured interaction events. Strengths / next-steps, NOT global
      ranking. COPPA/GDPR-compliant by design.
- [ ] **Kid-Buzz voice mic** — open-mic voice input for children in Kid Mode.
      Needs child-safety system prompt + parent consent flow (COPPA).
- [ ] **Grade-school expansion** — Standard 1–6, block-based coding, STEM.

---

## ✅ Done
_Move completed items here with the day they landed._

- [x] **Day 17** — Quiz layout partially fixed: rebalanced image-to-options ratio,
      drifting bees hidden during quiz, counting emoji size increased.
- [x] **Day 17** — Landing page updated from 6 subjects to 14 subjects.
- [x] **Day 17** — Subject list finalized: 14 subjects (12 all-stage + 2
      Blossom/Bloom only). Colors & Shapes split. Nature & Animals split into
      Farm Animals, Wild Animals, Birds. Added Fruits, Vegetables, Transport,
      Occupations, My World. Music & Emotions confirmed as flashcard subjects.
      Fine Motor & Motion parked post-launch.
- [x] **Day 17** — Image strategy decided: DALL-E photos for 6 visual subjects,
      emoji for 8 abstract subjects. Hosted in repo. 5 test images generated and
      approved (cow, lion, eagle, apple, carrot). Style prompt locked.
- [x] **Day 17** — **Kid Mode** built into `lesson-engine.js`; every future lesson
      inherits it for free. Full-screen child layer, guided flow, hive world
      backdrop, real-AI Buzz tap-chip tutoring, pinch-zoom lockout, numbers
      single-card model fix.
- [x] **Day 16** — Extracted shared lesson engine into `js/lesson-engine.js`.
      Built `lesson-numbers.html`: 1–20, four stages.
- [x] **Day 15** — `lesson-alphabet.html` full build. Quiz, worksheets, Buzz AI,
      voice input, TTS, stage-from-profile, i18n/theme seams, catalog design.
