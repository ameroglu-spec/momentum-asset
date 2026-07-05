-- Momentum Hub V7.0 Sprint 1A.2
-- Finance RLS policies
-- Run after finance_schema.sql

alter table public.finance_categories enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_transfers enable row level security;
alter table public.finance_financings enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_monthly_summary enable row level security;

-- Remove existing finance policies safely before recreating
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'finance_categories',
        'finance_accounts',
        'finance_transactions',
        'finance_transfers',
        'finance_financings',
        'finance_goals',
        'finance_monthly_summary'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Categories
create policy "finance_categories_select_own" on public.finance_categories
  for select using (auth.uid() = user_id);
create policy "finance_categories_insert_own" on public.finance_categories
  for insert with check (auth.uid() = user_id);
create policy "finance_categories_update_own" on public.finance_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_categories_delete_own" on public.finance_categories
  for delete using (auth.uid() = user_id);

-- Accounts
create policy "finance_accounts_select_own" on public.finance_accounts
  for select using (auth.uid() = user_id);
create policy "finance_accounts_insert_own" on public.finance_accounts
  for insert with check (auth.uid() = user_id);
create policy "finance_accounts_update_own" on public.finance_accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_accounts_delete_own" on public.finance_accounts
  for delete using (auth.uid() = user_id);

-- Transactions
create policy "finance_transactions_select_own" on public.finance_transactions
  for select using (auth.uid() = user_id);
create policy "finance_transactions_insert_own" on public.finance_transactions
  for insert with check (auth.uid() = user_id);
create policy "finance_transactions_update_own" on public.finance_transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_transactions_delete_own" on public.finance_transactions
  for delete using (auth.uid() = user_id);

-- Transfers
create policy "finance_transfers_select_own" on public.finance_transfers
  for select using (auth.uid() = user_id);
create policy "finance_transfers_insert_own" on public.finance_transfers
  for insert with check (auth.uid() = user_id);
create policy "finance_transfers_update_own" on public.finance_transfers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_transfers_delete_own" on public.finance_transfers
  for delete using (auth.uid() = user_id);

-- Financings
create policy "finance_financings_select_own" on public.finance_financings
  for select using (auth.uid() = user_id);
create policy "finance_financings_insert_own" on public.finance_financings
  for insert with check (auth.uid() = user_id);
create policy "finance_financings_update_own" on public.finance_financings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_financings_delete_own" on public.finance_financings
  for delete using (auth.uid() = user_id);

-- Goals
create policy "finance_goals_select_own" on public.finance_goals
  for select using (auth.uid() = user_id);
create policy "finance_goals_insert_own" on public.finance_goals
  for insert with check (auth.uid() = user_id);
create policy "finance_goals_update_own" on public.finance_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_goals_delete_own" on public.finance_goals
  for delete using (auth.uid() = user_id);

-- Monthly Summary
create policy "finance_monthly_summary_select_own" on public.finance_monthly_summary
  for select using (auth.uid() = user_id);
create policy "finance_monthly_summary_insert_own" on public.finance_monthly_summary
  for insert with check (auth.uid() = user_id);
create policy "finance_monthly_summary_update_own" on public.finance_monthly_summary
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "finance_monthly_summary_delete_own" on public.finance_monthly_summary
  for delete using (auth.uid() = user_id);
