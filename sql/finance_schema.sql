-- Momentum Hub V7.0 Sprint 1A.1
-- Finance Database Foundation
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- =========================
-- FINANCE CATEGORIES
-- =========================
create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense','transfer','investment','financing')),
  color text default '#2563eb',
  icon text default 'circle',
  is_default boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_categories_user on public.finance_categories(user_id);
create index if not exists idx_finance_categories_type on public.finance_categories(type);

-- =========================
-- FINANCE ACCOUNTS
-- =========================
create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash','bank','credit_card','foreign_currency','gold','crypto','investment','other')),
  currency text not null default 'TRY',
  initial_balance numeric(14,2) default 0,
  current_balance numeric(14,2) default 0,
  is_asset boolean default true,
  institution text,
  iban text,
  card_last4 text,
  credit_limit numeric(14,2),
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_accounts_user on public.finance_accounts(user_id);
create index if not exists idx_finance_accounts_type on public.finance_accounts(account_type);

-- =========================
-- FINANCE TRANSACTIONS
-- =========================
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.finance_accounts(id) on delete set null,
  category_id uuid references public.finance_categories(id) on delete set null,
  transaction_type text not null check (transaction_type in ('income','expense','transfer_in','transfer_out','investment_buy','investment_sell','financing_payment')),
  title text not null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'TRY',
  transaction_date date not null default current_date,
  due_date date,
  status text not null default 'completed' check (status in ('planned','pending','completed','overdue','cancelled')),
  payment_method text,
  related_asset_id uuid,
  related_vehicle_id uuid,
  document_id uuid,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_transactions_user on public.finance_transactions(user_id);
create index if not exists idx_finance_transactions_account on public.finance_transactions(account_id);
create index if not exists idx_finance_transactions_category on public.finance_transactions(category_id);
create index if not exists idx_finance_transactions_date on public.finance_transactions(transaction_date);
create index if not exists idx_finance_transactions_status on public.finance_transactions(status);

-- =========================
-- FINANCE TRANSFERS
-- =========================
create table if not exists public.finance_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid references public.finance_accounts(id) on delete set null,
  to_account_id uuid references public.finance_accounts(id) on delete set null,
  amount numeric(14,2) not null,
  currency text not null default 'TRY',
  transfer_date date not null default current_date,
  fee_amount numeric(14,2) default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_transfers_user on public.finance_transfers(user_id);
create index if not exists idx_finance_transfers_date on public.finance_transfers(transfer_date);

-- =========================
-- FINANCE FINANCINGS
-- =========================
create table if not exists public.finance_financings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  financing_type text not null check (financing_type in ('home_loan','vehicle_loan','personal_loan','katilim_evim','fuzul_ev','eminevim','other')),
  company_name text not null,
  contract_no text,
  contract_date date,
  total_amount numeric(14,2) not null default 0,
  down_payment numeric(14,2) default 0,
  monthly_payment numeric(14,2) default 0,
  installment_count integer,
  remaining_installments integer,
  delivery_date date,
  next_payment_date date,
  currency text not null default 'TRY',
  status text not null default 'active' check (status in ('active','completed','cancelled','paused')),
  related_asset_id uuid,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_financings_user on public.finance_financings(user_id);
create index if not exists idx_finance_financings_type on public.finance_financings(financing_type);
create index if not exists idx_finance_financings_next_payment on public.finance_financings(next_payment_date);

-- =========================
-- FINANCE GOALS
-- =========================
create table if not exists public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null default 'other' check (goal_type in ('home','vehicle','education','travel','emergency','investment','other')),
  target_amount numeric(14,2) not null default 0,
  current_amount numeric(14,2) default 0,
  currency text not null default 'TRY',
  target_date date,
  status text not null default 'active' check (status in ('active','completed','cancelled','paused')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_goals_user on public.finance_goals(user_id);
create index if not exists idx_finance_goals_status on public.finance_goals(status);

-- =========================
-- FINANCE MONTHLY SUMMARY
-- =========================
create table if not exists public.finance_monthly_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null,
  total_income numeric(14,2) default 0,
  total_expense numeric(14,2) default 0,
  total_assets numeric(14,2) default 0,
  total_liabilities numeric(14,2) default 0,
  net_worth numeric(14,2) default 0,
  currency text not null default 'TRY',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, month_start, currency)
);

create index if not exists idx_finance_monthly_summary_user on public.finance_monthly_summary(user_id);
create index if not exists idx_finance_monthly_summary_month on public.finance_monthly_summary(month_start);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_finance_categories_updated on public.finance_categories;
create trigger trg_finance_categories_updated before update on public.finance_categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_finance_accounts_updated on public.finance_accounts;
create trigger trg_finance_accounts_updated before update on public.finance_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_finance_transactions_updated on public.finance_transactions;
create trigger trg_finance_transactions_updated before update on public.finance_transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_finance_transfers_updated on public.finance_transfers;
create trigger trg_finance_transfers_updated before update on public.finance_transfers
for each row execute function public.set_updated_at();

drop trigger if exists trg_finance_financings_updated on public.finance_financings;
create trigger trg_finance_financings_updated before update on public.finance_financings
for each row execute function public.set_updated_at();

drop trigger if exists trg_finance_goals_updated on public.finance_goals;
create trigger trg_finance_goals_updated before update on public.finance_goals
for each row execute function public.set_updated_at();

-- =========================
-- RLS
-- =========================
alter table public.finance_categories enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_transfers enable row level security;
alter table public.finance_financings enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_monthly_summary enable row level security;

-- Drop existing policies if rerun
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'finance_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

create policy "finance_categories_select" on public.finance_categories for select using (auth.uid() = user_id);
create policy "finance_categories_insert" on public.finance_categories for insert with check (auth.uid() = user_id);
create policy "finance_categories_update" on public.finance_categories for update using (auth.uid() = user_id);
create policy "finance_categories_delete" on public.finance_categories for delete using (auth.uid() = user_id);

create policy "finance_accounts_select" on public.finance_accounts for select using (auth.uid() = user_id);
create policy "finance_accounts_insert" on public.finance_accounts for insert with check (auth.uid() = user_id);
create policy "finance_accounts_update" on public.finance_accounts for update using (auth.uid() = user_id);
create policy "finance_accounts_delete" on public.finance_accounts for delete using (auth.uid() = user_id);

create policy "finance_transactions_select" on public.finance_transactions for select using (auth.uid() = user_id);
create policy "finance_transactions_insert" on public.finance_transactions for insert with check (auth.uid() = user_id);
create policy "finance_transactions_update" on public.finance_transactions for update using (auth.uid() = user_id);
create policy "finance_transactions_delete" on public.finance_transactions for delete using (auth.uid() = user_id);

create policy "finance_transfers_select" on public.finance_transfers for select using (auth.uid() = user_id);
create policy "finance_transfers_insert" on public.finance_transfers for insert with check (auth.uid() = user_id);
create policy "finance_transfers_update" on public.finance_transfers for update using (auth.uid() = user_id);
create policy "finance_transfers_delete" on public.finance_transfers for delete using (auth.uid() = user_id);

create policy "finance_financings_select" on public.finance_financings for select using (auth.uid() = user_id);
create policy "finance_financings_insert" on public.finance_financings for insert with check (auth.uid() = user_id);
create policy "finance_financings_update" on public.finance_financings for update using (auth.uid() = user_id);
create policy "finance_financings_delete" on public.finance_financings for delete using (auth.uid() = user_id);

create policy "finance_goals_select" on public.finance_goals for select using (auth.uid() = user_id);
create policy "finance_goals_insert" on public.finance_goals for insert with check (auth.uid() = user_id);
create policy "finance_goals_update" on public.finance_goals for update using (auth.uid() = user_id);
create policy "finance_goals_delete" on public.finance_goals for delete using (auth.uid() = user_id);

create policy "finance_monthly_summary_select" on public.finance_monthly_summary for select using (auth.uid() = user_id);
create policy "finance_monthly_summary_insert" on public.finance_monthly_summary for insert with check (auth.uid() = user_id);
create policy "finance_monthly_summary_update" on public.finance_monthly_summary for update using (auth.uid() = user_id);
create policy "finance_monthly_summary_delete" on public.finance_monthly_summary for delete using (auth.uid() = user_id);
