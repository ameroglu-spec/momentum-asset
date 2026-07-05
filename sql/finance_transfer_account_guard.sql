-- Sprint 2A.3 security hardening
-- Ensures finance_transfers can only reference accounts owned by the same authenticated user.

begin;

drop policy if exists "finance_transfers_insert" on public.finance_transfers;
drop policy if exists "finance_transfers_update" on public.finance_transfers;
drop policy if exists "finance_transfers_insert_own" on public.finance_transfers;
drop policy if exists "finance_transfers_update_own" on public.finance_transfers;

create policy "finance_transfers_insert_own" on public.finance_transfers
  for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.finance_accounts a where a.id = from_account_id and a.user_id = auth.uid())
    and exists (select 1 from public.finance_accounts a where a.id = to_account_id and a.user_id = auth.uid())
    and from_account_id <> to_account_id
  );

create policy "finance_transfers_update_own" on public.finance_transfers
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.finance_accounts a where a.id = from_account_id and a.user_id = auth.uid())
    and exists (select 1 from public.finance_accounts a where a.id = to_account_id and a.user_id = auth.uid())
    and from_account_id <> to_account_id
  );

commit;
