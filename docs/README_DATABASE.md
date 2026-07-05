# Momentum Hub Finance Database Architecture

Version: V7.0 Sprint 1A.2

## Purpose

This package hardens the Finance database foundation created in Sprint 1A.1.
It adds performance indexes, explicit RLS policies, storage bucket policies, and an ER diagram.

## Run Order

Run these files in Supabase SQL Editor in this order:

1. `finance_indexes.sql`
2. `finance_rls.sql`
3. `finance_storage.sql`

> `finance_schema.sql` and `finance_seed.sql` from Sprint 1A.1 must already be applied.

## Files

### sql/finance_indexes.sql
Adds composite indexes for common Finance queries:

- accounts by user/type/status
- transactions by user/date/status/account/category
- financings by status and next payment date
- goals by status and target date
- simple trigram indexes for search fields

### sql/finance_rls.sql
Recreates Finance RLS policies with `auth.uid() = user_id` isolation.
Each user can only view and edit their own Finance records.

### sql/finance_storage.sql
Creates private storage bucket:

```text
finance-documents
```

Recommended path structure:

```text
{user_id}/accounts/{account_id}/file.pdf
{user_id}/transactions/{transaction_id}/file.pdf
{user_id}/financings/{financing_id}/file.pdf
{user_id}/goals/{goal_id}/file.pdf
```

## Core Tables

- `finance_accounts`
- `finance_transactions`
- `finance_transfers`
- `finance_financings`
- `finance_categories`
- `finance_goals`
- `finance_monthly_summary`

## Relationship Summary

```text
auth.users
  ├── finance_accounts
  ├── finance_categories
  ├── finance_transactions
  │      ├── account_id → finance_accounts.id
  │      └── category_id → finance_categories.id
  ├── finance_transfers
  │      ├── from_account_id → finance_accounts.id
  │      └── to_account_id → finance_accounts.id
  ├── finance_financings
  ├── finance_goals
  └── finance_monthly_summary
```

## Important Design Notes

### Assets and Liabilities

`finance_accounts.is_asset` controls net worth calculation.

Examples:

| Account | is_asset |
|---|---:|
| Cash | true |
| Bank | true |
| Gold | true |
| Credit Card | false |

Financings such as Katılım Evim, Fuzul Ev, Eminevim and bank loans are tracked in `finance_financings`.

### Search

`finance_indexes.sql` enables `pg_trgm` for better search performance on names and titles.

### Security

Finance data is private by default. RLS policies require `auth.uid() = user_id`.

## Next Sprint

Sprint 1B will build Finance UI using this database layer.
