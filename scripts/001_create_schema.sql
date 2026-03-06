-- Account Signal Monitor Schema
-- Tables for managing AE book of business, scans, signals, and cached results

-- Accounts table - AE's book of business
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  industry TEXT,
  employee_count TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table - scan history with timestamps
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Signal types enum
CREATE TYPE signal_type AS ENUM (
  'hiring',
  'funding',
  'product_launch',
  'tech_adoption',
  'expansion',
  'partnership',
  'leadership_change',
  'press_mention',
  'open_source_activity',
  'community_engagement'
);

-- Signal sources enum
CREATE TYPE signal_source AS ENUM (
  'hacker_news',
  'web_search',
  'greenhouse',
  'lever',
  'crunchbase',
  'github'
);

-- Signals table - detected signals per account per scan
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  source signal_source NOT NULL,
  type signal_type NOT NULL,
  title TEXT NOT NULL,
  snippet TEXT,
  url TEXT,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  play_recommendation TEXT,
  raw_data JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached results table - store API responses to avoid re-fetching
CREATE TABLE IF NOT EXISTS public.cached_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source signal_source NOT NULL,
  query_key TEXT NOT NULL,
  response_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(source, query_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_domain ON public.accounts(domain);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_account_id ON public.scans(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON public.signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_account_id ON public.signals(account_id);
CREATE INDEX IF NOT EXISTS idx_signals_scan_id ON public.signals(scan_id);
CREATE INDEX IF NOT EXISTS idx_signals_score ON public.signals(score DESC);
CREATE INDEX IF NOT EXISTS idx_cached_results_lookup ON public.cached_results(source, query_key);
CREATE INDEX IF NOT EXISTS idx_cached_results_expiry ON public.cached_results(expires_at);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "accounts_select_own" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "accounts_insert_own" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "accounts_update_own" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "accounts_delete_own" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scans
CREATE POLICY "scans_select_own" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scans_insert_own" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scans_update_own" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scans_delete_own" ON public.scans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signals
CREATE POLICY "signals_select_own" ON public.signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "signals_insert_own" ON public.signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "signals_update_own" ON public.signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "signals_delete_own" ON public.signals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cached_results (readable by all authenticated users, writable by service role)
CREATE POLICY "cached_results_select_authenticated" ON public.cached_results FOR SELECT TO authenticated USING (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to accounts
DROP TRIGGER IF EXISTS accounts_updated_at ON public.accounts;
CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
