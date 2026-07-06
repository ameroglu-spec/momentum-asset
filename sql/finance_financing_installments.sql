-- Sprint 2C.1 Financing Installment Schedule
-- Run in Supabase SQL Editor.
-- Idempotent: safe to run more than once.

begin;

create table if not exists public.finance_financing_installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  financing_plan_id uuid not null references public.finance_financing_plans(id) on delete cascade,
  installment_no integer not null check (installment_no > 0),
  due_date date not null,
  amount numeric not null default 0 check (amount >= 0),
  paid_amount numeric not null default 0 check (paid_amount >= 0),
  paid_date date,
  status text not null default 'pending' check (status in ('pending','paid','partial','overdue','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One installment number per plan/user. Kept outside create table for rerunnable safety.
create unique index if not exists idx_finance_financing_installments_plan_no
  on public.finance_financing_installments(user_id, financing_plan_id, installment_no);

create index if not exists idx_finance_financing_installments_user_due
  on public.finance_financing_installments(user_id, due_date, status);

alter table public.finance_financing_installments enable row level security;

drop policy if exists "finance_financing_installments_select_own" on public.finance_financing_installments;
drop policy if exists "finance_financing_installments_insert_own" on public.finance_financing_installments;
drop policy if exists "finance_financing_installments_update_own" on public.finance_financing_installments;
drop policy if exists "finance_financing_installments_delete_own" on public.finance_financing_installments;

create policy "finance_financing_installments_select_own" on public.finance_financing_installments
  for select using (auth.uid() = user_id);

create policy "finance_financing_installments_insert_own" on public.finance_financing_installments
  for insert with check (auth.uid() = user_id);

create policy "finance_financing_installments_update_own" on public.finance_financing_installments
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "finance_financing_installments_delete_own" on public.finance_financing_installments
  for delete using (auth.uid() = user_id);

commit;
