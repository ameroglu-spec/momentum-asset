-- Sprint 2C.0 Financing / Loan Tracking Foundation
-- Run in Supabase SQL Editor.
-- Idempotent: safe to run more than once.

begin;

create table if not exists public.finance_financing_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_name text not null,
  financing_type text not null default 'other' check (financing_type in ('bank_loan','participation_finance','other')),
  purpose text,
  principal_amount numeric not null default 0 check (principal_amount >= 0),
  commission_amount numeric not null default 0 check (commission_amount >= 0),
  total_months integer not null default 1 check (total_months > 0),
  monthly_payment numeric not null default 0 check (monthly_payment >= 0),
  paid_months integer not null default 0 check (paid_months >= 0),
  start_date date,
  next_payment_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add cross-column check separately so reruns do not fail with 42710.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.finance_financing_plans'::regclass
      and conname = 'finance_financing_plans_paid_months_check'
  ) then
    alter table public.finance_financing_plans
      add constraint finance_financing_plans_paid_months_check
      check (paid_months <= total_months);
  end if;
end $$;

alter table public.finance_financing_plans enable row level security;

drop policy if exists "finance_financing_plans_select_own" on public.finance_financing_plans;
drop policy if exists "finance_financing_plans_insert_own" on public.finance_financing_plans;
drop policy if exists "finance_financing_plans_update_own" on public.finance_financing_plans;
drop policy if exists "finance_financing_plans_delete_own" on public.finance_financing_plans;

create policy "finance_financing_plans_select_own" on public.finance_financing_plans
  for select using (auth.uid() = user_id);

create policy "finance_financing_plans_insert_own" on public.finance_financing_plans
  for insert with check (auth.uid() = user_id);

create policy "finance_financing_plans_update_own" on public.finance_financing_plans
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "finance_financing_plans_delete_own" on public.finance_financing_plans
  for delete using (auth.uid() = user_id);

create index if not exists idx_finance_financing_plans_user_status
  on public.finance_financing_plans(user_id, status);

commit;
