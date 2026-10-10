# Engine v2 — Supabase SQL (DRAFT, NOT RUN)

**Nothing in this file has been run.** It is to be pasted into Supabase → SQL Editor by the owner, with Claude present, one block at a time.
It is a draft until reviewed; a privacy lawyer should confirm the consent wording and retention period before launch.

Matches the decisions in `docs/engine-v2-proposal.md` section 7. Existing schema (from `supabase-rls-setup.sql` and `app/dashboard.html`):
`public.children(id, parent_id, name, age, character, created_at)`, with RLS `auth.uid() = parent_id`. Table `subscriptions` is not touched.

## Data minimisation: what is stored (and what is not)

| Stored | Where |
|---|---|
| child id, subject, stage, item completed, stars, date | `lesson_progress` |
| child id, subject, stage, date, active minutes (raw, 12 months) | `lesson_sessions` |
| child id, subject, date, active minutes (kept) | `lesson_daily_totals` |
| parent consent flag + timestamp + policy version | `parent_profiles` |
| parent PIN as a salted bcrypt hash, failed-attempt counter | `parent_pins` |
| child's stage | `children.stage` |

**Not stored:** any free text from the child, voice recordings or transcripts, device identifiers, IP addresses, user agents, location, or analytics events.
There are no columns for any of these, and the tables take no JSON / free-text field a client could stuff them into.

Access: every table is RLS-protected so a parent sees only their own children's rows. No third party reads this data; no analytics or ad code is added.

## Run order and checks

0. **Before running:** confirm in the SQL editor that `public.parent_profiles`, `public.parent_pins`, `public.lesson_*` do not already exist, and that no trigger already exists on `auth.users`:
   ```sql
   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
   select to_regclass('public.parent_profiles'), to_regclass('public.lesson_progress');
   ```
1. Run blocks A to H below in order. Each block is idempotent where possible.
2. Run the verification block (section "Verification"). Expect every check to pass before any app code is deployed.
3. Rollback block is at the end. It deletes the new tables and all data in them; only `children.stage` is left as a harmless column unless the last line is run.

---

## A. `children.stage`

```sql
alter table public.children
  add column if not exists stage text not null default 'seedling'
  check (stage in ('seedling','sprout','blossom','bloom'));
```
Existing rows get `seedling`. Existing RLS policies on `children` already cover this column.

## B. Parent profile and consent

Consent is set at sign-up. `signup.html` is protected, so adding the consent checkbox is a later step with the owner present; it will pass
`options.data = { consent_given: true, consent_version: '2026-10' }` to `supabase.auth.signUp`. The trigger below reads that metadata.

```sql
create table if not exists public.parent_profiles (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  consent_given    boolean     not null default false,
  consent_at       timestamptz,
  consent_version  text,
  created_at       timestamptz not null default now(),
  constraint consent_has_timestamp check (consent_given = false or consent_at is not null)
);

alter table public.parent_profiles enable row level security;

drop policy if exists "Parents read own profile" on public.parent_profiles;
create policy "Parents read own profile"
  on public.parent_profiles for select
  using ((select auth.uid()) = user_id);
-- No insert / update / delete policy: changes go through the trigger and set_consent() only.

-- Create the profile row (with consent from sign-up metadata) when a parent signs up.
create or replace function public.handle_new_parent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  c boolean := coalesce((new.raw_user_meta_data ->> 'consent_given')::boolean, false);
begin
  insert into public.parent_profiles (user_id, consent_given, consent_at, consent_version)
  values (new.id, c, case when c then now() end, case when c then new.raw_user_meta_data ->> 'consent_version' end)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_parent on auth.users;
create trigger on_auth_user_created_parent
  after insert on auth.users
  for each row execute function public.handle_new_parent();

-- Backfill: parents who signed up BEFORE this change have no consent on record.
-- consent_given = false; the app must ask them for consent on next login before Kid Mode can start.
insert into public.parent_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Give or withdraw consent from the parent page (the only way to change it).
create or replace function public.set_consent(p_given boolean, p_version text default null)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.parent_profiles
     set consent_given   = p_given,
         consent_at      = case when p_given then now() else consent_at end,
         consent_version = case when p_given then p_version else consent_version end
   where user_id = (select auth.uid());
$$;
revoke all on function public.set_consent(boolean, text) from public, anon;
grant execute on function public.set_consent(boolean, text) to authenticated;
```
Note: withdrawing consent only flips the flag. The app must then stop writing progress and offer "delete my child's data" (block G). Deleting happens only on the parent's action.

## C. Parent PIN (hashed in Supabase, 4 digits)

The PIN hash lives in a table **no client can read or write** (RLS on, no policies, privileges revoked). The browser can only call two functions:
`set_parent_pin` (first set, or reset after a fresh password login) and `verify_parent_pin` (check, with a server-side lockout).

```sql
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.parent_pins (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  pin_hash      text        not null,
  failed_count  int         not null default 0,
  locked_until  timestamptz,
  updated_at    timestamptz not null default now()
);
alter table public.parent_pins enable row level security;      -- no policies on purpose
revoke all on public.parent_pins from anon, authenticated;

-- Set the first PIN, or reset it. A reset (a PIN already exists) is only allowed within 5 minutes of a password sign-in,
-- which is how "reset by entering the account password" is enforced on the server: the app calls
-- supabase.auth.signInWithPassword(email, password) and then this function.
create or replace function public.set_parent_pin(p_pin text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  has_pin boolean;
  last_login timestamptz;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception 'PIN must be exactly 4 digits'; end if;

  select exists (select 1 from public.parent_pins where user_id = uid) into has_pin;
  if has_pin then
    select last_sign_in_at into last_login from auth.users where id = uid;
    if last_login is null or last_login < now() - interval '5 minutes' then
      raise exception 'password confirmation required';
    end if;
  end if;

  insert into public.parent_pins (user_id, pin_hash, failed_count, locked_until, updated_at)
  values (uid, extensions.crypt(p_pin, extensions.gen_salt('bf', 10)), 0, null, now())
  on conflict (user_id) do update
    set pin_hash = excluded.pin_hash, failed_count = 0, locked_until = null, updated_at = now();
end;
$$;

-- Check a PIN. 5 wrong tries in a row lock further tries for 60 seconds.
-- Returns {"ok": true} | {"ok": false, "locked_for": <seconds>} | {"ok": false, "no_pin": true}
create or replace function public.verify_parent_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  r public.parent_pins%rowtype;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into r from public.parent_pins where user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'no_pin', true); end if;

  if r.locked_until is not null and r.locked_until > now() then
    return jsonb_build_object('ok', false, 'locked_for', ceil(extract(epoch from (r.locked_until - now())))::int);
  end if;

  if extensions.crypt(p_pin, r.pin_hash) = r.pin_hash then
    update public.parent_pins set failed_count = 0, locked_until = null where user_id = uid;
    return jsonb_build_object('ok', true);
  end if;

  update public.parent_pins
     set failed_count = case when failed_count + 1 >= 5 then 0 else failed_count + 1 end,
         locked_until = case when failed_count + 1 >= 5 then now() + interval '60 seconds' else locked_until end
   where user_id = uid;
  return jsonb_build_object('ok', false,
    'locked_for', case when r.failed_count + 1 >= 5 then 60 else 0 end);
end;
$$;

revoke all on function public.set_parent_pin(text)    from public, anon;
revoke all on function public.verify_parent_pin(text) from public, anon;
grant execute on function public.set_parent_pin(text)    to authenticated;
grant execute on function public.verify_parent_pin(text) to authenticated;
```
Known limits (state them to the owner, do not hide them):
- A 4-digit PIN has only 10,000 values. The lockout stops guessing through the app; if the database itself were ever leaked, bcrypt alone would not stop someone brute-forcing the hashes. A secret "pepper" kept outside the database (in an `api/` function) would fix that, but touches `api/`, so it is not in this draft.
- "Fresh login" uses `auth.users.last_sign_in_at`, which Supabase updates on password sign-in. It should not be refreshed by silent token refresh; this is to be tested in verification (V7).
- The PIN protects a child leaving Kid Mode on a shared device. It is not a security boundary against someone who knows the parent's password.

## D. `lesson_progress`

One row per child, subject, stage and item. No free text. `item_id` is a short stable id from the subject file (e.g. `cow`, `a`, `7`).

```sql
create table if not exists public.lesson_progress (
  child_id      uuid        not null references public.children(id) on delete cascade,
  subject       text        not null check (subject ~ '^[a-z0-9-]{1,40}$'),
  stage         text        not null check (stage in ('seedling','sprout','blossom','bloom')),
  item_id       text        not null check (item_id ~ '^[a-z0-9-]{1,40}$'),
  stars         smallint    not null default 0 check (stars between 0 and 3),
  completed     boolean     not null default false,
  updated_on    date        not null default current_date,
  primary key (child_id, subject, stage, item_id)
);
create index if not exists lesson_progress_child_idx on public.lesson_progress (child_id);

alter table public.lesson_progress enable row level security;

drop policy if exists "Parents read own children's progress"   on public.lesson_progress;
drop policy if exists "Parents insert own children's progress" on public.lesson_progress;
drop policy if exists "Parents update own children's progress" on public.lesson_progress;
drop policy if exists "Parents delete own children's progress" on public.lesson_progress;

create policy "Parents read own children's progress" on public.lesson_progress for select
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents insert own children's progress" on public.lesson_progress for insert
  with check (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents update own children's progress" on public.lesson_progress for update
  using      (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())))
  with check (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents delete own children's progress" on public.lesson_progress for delete
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
```

## E. `lesson_sessions` (raw, 12 months) and `lesson_daily_totals` (kept)

The app writes one raw row per sitting and updates `active_minutes` as time accrues (counted only while the page is visible and the child interacted in the last 60 s).
A trigger keeps the daily totals up to date, so the 12-month purge (block F) can delete raw rows without losing history.

```sql
create table if not exists public.lesson_sessions (
  id              uuid        primary key default gen_random_uuid(),
  child_id        uuid        not null references public.children(id) on delete cascade,
  subject         text        not null check (subject ~ '^[a-z0-9-]{1,40}$'),
  stage           text        not null check (stage in ('seedling','sprout','blossom','bloom')),
  session_date    date        not null default current_date,
  active_minutes  numeric(6,2) not null default 0 check (active_minutes >= 0 and active_minutes <= 600)
);
create index if not exists lesson_sessions_child_date_idx on public.lesson_sessions (child_id, session_date);
create index if not exists lesson_sessions_date_idx       on public.lesson_sessions (session_date);

create table if not exists public.lesson_daily_totals (
  child_id        uuid        not null references public.children(id) on delete cascade,
  day             date        not null,
  subject         text        not null,
  active_minutes  numeric(7,2) not null default 0,
  primary key (child_id, day, subject)
);

alter table public.lesson_sessions     enable row level security;
alter table public.lesson_daily_totals enable row level security;

drop policy if exists "Parents read own children's sessions"   on public.lesson_sessions;
drop policy if exists "Parents insert own children's sessions" on public.lesson_sessions;
drop policy if exists "Parents update own children's sessions" on public.lesson_sessions;
drop policy if exists "Parents delete own children's sessions" on public.lesson_sessions;
drop policy if exists "Parents read own children's daily totals" on public.lesson_daily_totals;

create policy "Parents read own children's sessions" on public.lesson_sessions for select
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents insert own children's sessions" on public.lesson_sessions for insert
  with check (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents update own children's sessions" on public.lesson_sessions for update
  using      (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())))
  with check (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
create policy "Parents delete own children's sessions" on public.lesson_sessions for delete
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));
-- Daily totals: read only. Written by the trigger below; no client insert / update / delete policy.
create policy "Parents read own children's daily totals" on public.lesson_daily_totals for select
  using (exists (select 1 from public.children c where c.id = child_id and c.parent_id = (select auth.uid())));

-- Keep daily totals in step with raw sessions (adds only the change; deleting a raw row does not subtract).
create or replace function public.bump_daily_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare delta numeric := new.active_minutes - case when tg_op = 'UPDATE' then old.active_minutes else 0 end;
begin
  if delta <> 0 then
    insert into public.lesson_daily_totals (child_id, day, subject, active_minutes)
    values (new.child_id, new.session_date, new.subject, delta)
    on conflict (child_id, day, subject)
    do update set active_minutes = public.lesson_daily_totals.active_minutes + excluded.active_minutes;
  end if;
  return new;
end;
$$;
drop trigger if exists lesson_sessions_bump_total on public.lesson_sessions;
create trigger lesson_sessions_bump_total
  after insert or update of active_minutes on public.lesson_sessions
  for each row execute function public.bump_daily_total();
```
Design note: a child's `session_date` is the date the session started; a session cannot be edited to a different date by the app (update policy allows it, but the app does not). If you want that enforced in SQL, add a `before update` trigger that raises if `session_date` changes.

## F. 12-month retention

Raw sessions older than 12 months are deleted; daily totals stay. Needs the `pg_cron` extension, which is enabled in the Supabase dashboard (Database → Extensions); the owner enables it, I do not.

```sql
create or replace function public.purge_old_sessions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n integer;
begin
  delete from public.lesson_sessions where session_date < (current_date - interval '12 months');
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.purge_old_sessions() from public, anon, authenticated;

-- After enabling pg_cron: run daily at 03:00 UTC
-- select cron.schedule('purge-old-lesson-sessions', '0 3 * * *', $$select public.purge_old_sessions()$$);
```
If `pg_cron` is not wanted, the same function can be called from a scheduled job in `api/` (touches `api/`, needs the owner present).

## G. "Delete my child's data" (parent action)

Two paths, both callable only by the child's parent:
- delete the whole child: the existing `children` delete policy; `on delete cascade` removes progress, sessions and daily totals automatically;
- keep the child, wipe learning data and history:

```sql
create or replace function public.delete_child_learning_data(p_child_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.children c where c.id = p_child_id and c.parent_id = (select auth.uid())) then
    raise exception 'not your child';
  end if;
  delete from public.lesson_progress     where child_id = p_child_id;
  delete from public.lesson_sessions     where child_id = p_child_id;
  delete from public.lesson_daily_totals where child_id = p_child_id;
  update public.children set stage = 'seedling' where id = p_child_id;
end;
$$;
revoke all on function public.delete_child_learning_data(uuid) from public, anon;
grant execute on function public.delete_child_learning_data(uuid) to authenticated;
```
The parent page needs a confirmation step ("This cannot be undone") before calling it. Whole-account deletion (the parent's own data and PIN) is not in this draft; the `on delete cascade` on `auth.users` already removes `parent_profiles` and `parent_pins` if the auth user is deleted. Needs a product decision.

## H. Export (optional, recommended)

A parent can read their rows through RLS; the parent page can offer "Download my child's data" as a CSV built in the browser from the same selects. No SQL needed.

---

## Verification (run after A to H; all must pass)

Use two test parents, P1 and P2, each with one child (C1, C2). In the SQL editor, impersonate with:
```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"<P1 uuid>","role":"authenticated"}', true);
-- ...test statements...
rollback;
```
| # | Check | Expected |
|---|---|---|
| V1 | As P1: `select * from lesson_progress` after inserting rows for C1 and (as service role) C2 | only C1's rows |
| V2 | As P1: insert into `lesson_progress` with `child_id = C2` | RLS error |
| V3 | As P1: insert `lesson_sessions` for C1 with `active_minutes = 601` | check-constraint error |
| V4 | Insert then update a session 5 → 12 minutes | `lesson_daily_totals` = 12 |
| V5 | `select purge_old_sessions()` with a 13-month-old row and a 2-month-old row | old row deleted, totals unchanged |
| V6 | As P1: `select * from parent_pins` | permission denied |
| V7 | `set_parent_pin('1234')` first time OK; second call right away, no recent login | "password confirmation required" (check this against a real sign-in, not only the SQL editor) |
| V8 | `verify_parent_pin` wrong ×5 | 5th returns `locked_for: 60`; correct PIN during lock still refused |
| V9 | `set_parent_pin('12a4')` | error |
| V10 | New sign-up with `consent_given: true` metadata | `parent_profiles.consent_given = true`, `consent_at` set; sign-up without it → false |
| V11 | `delete_child_learning_data(C1)` as P2 | "not your child" |
| V12 | Delete child C1 | all its progress, sessions, totals gone |
| V13 | Search the schema for any column holding free text from a child | none: only `subject`, `stage`, `item_id` (regex-checked), numbers and dates |

## Rollback (destructive; deletes all learning data)

```sql
drop trigger if exists lesson_sessions_bump_total on public.lesson_sessions;
drop trigger if exists on_auth_user_created_parent on auth.users;
drop function if exists public.bump_daily_total(), public.handle_new_parent(), public.set_consent(boolean, text),
  public.set_parent_pin(text), public.verify_parent_pin(text), public.purge_old_sessions(),
  public.delete_child_learning_data(uuid);
drop table if exists public.lesson_daily_totals, public.lesson_sessions, public.lesson_progress,
  public.parent_pins, public.parent_profiles;
-- alter table public.children drop column if exists stage;   -- optional
-- select cron.unschedule('purge-old-lesson-sessions');       -- if scheduled
```

## Things this SQL does not do (need the owner)
- `app/signup.html` must add the consent checkbox and pass the metadata (protected page).
- `app/pricing.html`, `login.html`, `reset.html` are untouched. Existing parents are backfilled with `consent_given = false`; the app must request consent before Kid Mode can start.
- No change to `supabase-rls-setup.sql` is proposed; if you want this applied as a repeatable setup, it can be appended there later (protected file).
- No `api/` changes. A pepper for the PIN hash would need one (see block C).
