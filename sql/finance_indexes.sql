-- Required for trigram search indexes
create extension if not exists pg_trgm;

-- Momentum Hub V7.0 Sprint 1A.2
-- Finance indexes and performance helpers
-- Run after finance_schema.sql

-- Categories
create index if not exists idx_finance_categories_user_active
  on public.finance_categories(user_id, is_active);
create index if not exists idx_finance_categories_user_type_active
  on public.finance_categories(user_id, type, is_active);

-- Accounts
create index if not exists idx_finance_accounts_user_active
  on public.finance_accounts(user_id, is_active);
create index if not exists idx_finance_accounts_user_asset
  on public.finance_accounts(user_id, is_asset);
create index if not exists idx_finance_accounts_user_currency
  on public.finance_accounts(user_id, currency);

-- Transactions
create index if not exists idx_finance_transactions_user_date_desc
  on public.finance_transactions(user_id, transaction_date desc);
create index if not exists idx_finance_transactions_user_due_date
  on public.finance_transactions(user_id, due_date);
create index if not exists idx_finance_transactions_user_status_date
  on public.finance_transactions(user_id, status, transaction_date desc);
create index if not exists idx_finance_transactions_user_type_date
  on public.finance_transactions(user_id, transaction_type, transaction_date desc);
create index if not exists idx_finance_transactions_user_account_date
  on public.finance_transactions(user_id, account_id, transaction_date desc);
create index if not exists idx_finance_transactions_user_category_date
  on public.finance_transactions(user_id, category_id, transaction_date desc);
create index if not exists idx_finance_transactions_tags_gin
  on public.finance_transactions using gin(tags);

-- Transfers
create index if not exists idx_finance_transfers_user_from_account
  on public.finance_transfers(user_id, from_account_id);
create index if not exists idx_finance_transfers_user_to_account
  on public.finance_transfers(user_id, to_account_id);
create index if not exists idx_finance_transfers_user_date_desc
  on public.finance_transfers(user_id, transfer_date desc);

-- Financings
create index if not exists idx_finance_financings_user_status
  on public.finance_financings(user_id, status);
create index if not exists idx_finance_financings_user_next_payment
  on public.finance_financings(user_id, next_payment_date);
create index if not exists idx_finance_financings_user_type_status
  on public.finance_financings(user_id, financing_type, status);

-- Goals
create index if not exists idx_finance_goals_user_status_date
  on public.finance_goals(user_id, status, target_date);
create index if not exists idx_finance_goals_user_type_status
  on public.finance_goals(user_id, goal_type, status);

-- Monthly summary
create index if not exists idx_finance_monthly_summary_user_month_currency
  on public.finance_monthly_summary(user_id, month_start desc, currency);

-- Search helper indexes for simple text search
create index if not exists idx_finance_accounts_name_trgm
  on public.finance_accounts using gin (name gin_trgm_ops);
create index if not exists idx_finance_transactions_title_trgm
  on public.finance_transactions using gin (title gin_trgm_ops);
create index if not exists idx_finance_financings_company_trgm
  on public.finance_financings using gin (company_name gin_trgm_ops);
create index if not exists idx_finance_goals_name_trgm
  on public.finance_goals using gin (name gin_trgm_ops);
