-- Sprint 2A.2 security hardening
-- Ensures finance_transactions can only reference finance_accounts owned by the same authenticated user.

begin;

drop policy if exists "finance_transactions_insert" on public.finance_transactions;
drop policy if exists "finance_transactions_update" on public.finance_transactions;
drop policy if exists "finance_transactions_insert_own" on public.finance_transactions;
drop policy if exists "finance_transactions_update_own" on public.finance_transactions;

create policy "finance_transactions_insert_own" on public.finance_transactions
  for insert
  with check (
    auth.uid() = user_id
    and (
      account_id is null
      or exists (
        select 1
        from public.finance_accounts a
        where a.id = account_id
          and a.user_id = auth.uid()
      )
    )
  );

create policy "finance_transactions_update_own" on public.finance_transactions
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      account_id is null
      or exists (
        select 1
        from public.finance_accounts a
        where a.id = account_id
          and a.user_id = auth.uid()
      )
    )
  );

commit;
