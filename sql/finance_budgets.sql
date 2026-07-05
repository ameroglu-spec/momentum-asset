-- Sprint 2B.0 Budget Foundation
-- Run in Supabase SQL Editor.

begin;

create table if not exists public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  budget_type text not null default 'expense' check (budget_type in ('expense','income')),
  amount numeric not null check (amount >= 0),
  currency text not null default 'TRY' check (currency ~ '^[A-Z0-9]{3,5}$'),
  month text not null check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.finance_budgets enable row level security;

drop policy if exists "finance_budgets_select_own" on public.finance_budgets;
drop policy if exists "finance_budgets_insert_own" on public.finance_budgets;
drop policy if exists "finance_budgets_update_own" on public.finance_budgets;
drop policy if exists "finance_budgets_delete_own" on public.finance_budgets;

create policy "finance_budgets_select_own" on public.finance_budgets
  for select using (auth.uid() = user_id);

create policy "finance_budgets_insert_own" on public.finance_budgets
  for insert with check (auth.uid() = user_id);

create policy "finance_budgets_update_own" on public.finance_budgets
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "finance_budgets_delete_own" on public.finance_budgets
  for delete using (auth.uid() = user_id);

commit;
