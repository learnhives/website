# Rules for Claude Code on LearnHives

## Context
- PLAN.md, BACKLOG.md and HANDOFF.md may be out of date. The code and
  git log are the source of truth.
- Lessons follow the pattern of app/lesson-alphabet.html and
  app/lesson-numbers.html over js/lesson-engine.js.
- Take work ONLY from TASKS.md. Never invent new tasks.

## Safety (non-negotiable)
- main deploys to the live site. NEVER commit to or push main.
- Every task: new branch from main, named bus/<task>. Push only bus/*.
- Never edit api/, supabase-rls-setup.sql, .env files, or the pages
  login, signup, reset, pricing, dashboard.
- Never delete, rename or overwrite anything in assets/images/.
- Never install packages. Never deploy to Vercel.
- Do not touch the colors-shapes files.

## Workflow
- Work through TASKS.md top to bottom. Do not edit TASKS.md.
- Keep one report: NIGHT-REPORT.md in the project root (never commit it).
  Per task: what changed, branch name, what I should test on iPad,
  questions, and anything you could not verify.
- If blocked or unsure: write the question in NIGHT-REPORT.md, skip to
  the next task.
- Stop after the last task.
