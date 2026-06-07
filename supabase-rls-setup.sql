-- ============================================================
-- LearnHives — RLS verification and policy setup
-- Run this once in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Check current RLS status on both tables ───────────────
SELECT
  relname        AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname IN ('children', 'subscriptions')
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ── 2. Enable RLS (safe to run even if already enabled) ──────
ALTER TABLE public.children      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ── 3. children table policies ───────────────────────────────
-- Drop first so re-running this script is idempotent
DROP POLICY IF EXISTS "Users can read own children"   ON public.children;
DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
DROP POLICY IF EXISTS "Users can update own children" ON public.children;
DROP POLICY IF EXISTS "Users can delete own children" ON public.children;

CREATE POLICY "Users can read own children"
  ON public.children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = parent_id)
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete own children"
  ON public.children FOR DELETE
  USING (auth.uid() = parent_id);

-- ── 4. subscriptions table policies ──────────────────────────
DROP POLICY IF EXISTS "Users can read own subscription"   ON public.subscriptions;
-- No INSERT/UPDATE/DELETE from the browser — only the webhook (service role) writes here.
-- Service role bypasses RLS entirely, so no policy needed for writes.

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ── 5. Verify policies were created ──────────────────────────
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('children', 'subscriptions')
ORDER BY tablename, cmd;
