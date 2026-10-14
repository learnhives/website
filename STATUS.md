# 🐝 LearnHives: STATUS

**The one status page.** Read this first after any break. Update it at the end of
every work session. Old plans live in `docs/archive/` (history only).
The code and git log beat anything written here.

_Last updated: 2026-10-12_

---

## Finish line: March 2027
Core product live, plus 10-20 paying families. Anything not needed for that goes
to **Later**, not into the build.

## Live today (main → learnhives.com)
- Landing page with Buzz demo. Sign-up, login, reset. Dashboard with child profiles.
- Stripe checkout with 30-day trial (still takes a card, see D9). Welcome email.
- Lessons: **Alphabet** (Seedling/Sprout), **Numbers** (all stages), old
  Colors & Shapes (to scrap). Lessons are public URLs, not linked from the dashboard.
- **Known security holes** (legal register C20-C25): Buzz callable by anyone,
  welcome-email endpoint open, child chat box and mic live, child name not escaped.
  Being fixed in the security run.
- **Known layout bugs** (engine-v2 review screenshots, 2026-10-10): on phones the
  lesson pages are wider than the screen; the quiz shows under the Cards tab;
  "Hold to exit" covers Next Question in Kid Mode; Alphabet header word overflows.

## Built, not live
- **Farm Animals** (`bus/farm-animals`): rubric v2 applied, never seen on a device.
  Its card layout is broken per the screenshots.
- **Engine v2 proposal + SQL** (`bus/engine-v2`): documents only.

## In progress
- **Security run** (`bus/security-hotfix`, tasks in TASKS.md).

## Next 3, in order
1. Security run → test on the Vercel preview → merge.
2. Engine decision: fix the v1 layout bugs above; no rewrite before launch
   (recommended, Abhi to confirm).
3. Farm Animals on iPad → merge → link from the dashboard.

## Road to the finish line (rough order)
1. Security and layout fixes.
2. Lessons, 12 left: Colours, Shapes, Farm Animals, Wild Animals, Birds, Fruits,
   Vegetables, Transport (photos ready for these 6), Music, Emotions,
   Occupations, My World. Target: one lesson per long weekend.
3. Dashboard lesson catalogue; child stage read from the profile; lessons behind
   login, then a login check on Buzz.
4. No-card trial (plan in NIGHT-REPORT, 2026-10-10) and trial/payment emails wired up.
5. Progress saved to Supabase (legal Section 4), parental consent (D6), Kid Mode
   PIN (D7), "delete my child's data" (D5).
6. Privacy, terms and refund pages; self-hosted fonts; **lawyer review before the
   first paying family** (C17).
7. Mobile pass, SEO, end-to-end test, Stripe live mode, soft launch.

## Decisions (don't reopen without a real reason)
- Curriculum locked at 14 subjects: 12 for all stages, 2 for Blossom/Bloom only.
  Fine Motor and Motion & Movement parked until after launch.
- Product and legal decisions D1-D11: `docs/LEGAL-REQUIREMENTS.md`, Section 3.
- Content rules: `docs/pedagogy-rubric.md` (v2, all accepted).
- Each lesson is a config file plus a thin HTML shell over `js/lesson-engine.js`.
- Photos for 6 visual subjects; emoji/SVG for the rest.

## Open decisions
- Engine v2: rewrite now, or fix v1 and rewrite after launch?
- Buzz model: a smaller, cheaper model for 1-2 sentence replies?
- Canonical domain: `learnhives.com` or `www.learnhives.com`?

## Later (not before launch)
Ambient animation and themed backgrounds; richer content depth; hive-world
gamification; pronunciation checking; child voice input; longitudinal
personalisation; lessons stored in Supabase; grade-school expansion.

## Housekeeping
- Merged branches safe to delete: british-spelling, docs-refresh, email-drafts,
  rubric, rubric-v2, screenshot-tool, stripe-tests, trial-email.

## Where things live
- `STATUS.md`: this page.
- `TASKS.md`: Claude Code's work queue.
- `NIGHT-REPORT.md`: Claude Code's run log (not committed).
- `CLAUDE.md` and `.claude/settings.json`: rules and guardrails for Claude Code.
- `docs/`: legal register, pedagogy rubric, Stripe test plan. `emails/drafts/`: email drafts.

## How to restart after a break
1. Read this page.
2. `git switch main && git pull`.
3. Do the top item in **Next 3**, and only that.
4. Update this page before you stop.

Dev notes: Buzz only works on a deployed site (main or a Vercel preview), not
Live Server. `?preview=1` shows the stage selector.
