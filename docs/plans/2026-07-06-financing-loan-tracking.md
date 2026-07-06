# Financing / Loan Tracking Implementation Plan

> **For Hermes:** Use token-efficient development. Read only the files needed for each change and keep the diff minimal.

**Goal:** Add a Finance sub-module where the user can track bank loans and participation-finance plans such as Katılımevim, Fuzulevim, Birevim, including commission, total term, paid months, remaining months, paid amount, and remaining amount.

**Architecture:** Start with one simple user-scoped table and derived calculations. Do not create per-installment rows in the foundation sprint; calculate paid/remaining values from `principal_amount`, `monthly_payment`, `total_months`, and `paid_months`. A later sprint can add an installment schedule table if needed.

**Tech Stack:** Static HTML/CSS/JS app, Supabase database/RLS, existing Finance screen in `app.js`, service worker cache in `sw.js`.

---

## Product Shape

### Menu / Section

Finance screen section title:

```text
Finansmanlar / Krediler
```

Supported records:

```text
- Banka kredisi
- Katılım finansmanı
- Diğer finansman
```

Example display:

```text
Katılımevim — Konut Finansmanı
Alınan finansman: 1.000.000 TL
Komisyon / organizasyon ücreti: 75.000 TL
Toplam vade: 30 ay
Aylık ödeme: 33.333,33 TL
Ödenen taksit: 10
Kalan taksit: 20
Şu ana kadar ödenen: 333.333,33 TL
Kalan ödeme: 666.666,67 TL
Komisyon dahil toplam maliyet: 1.075.000 TL
İlerleme: %33,3
```

---

## Data Model

### Create: `sql/finance_financing_plans.sql`

Minimal table:

```sql
create table if not exists public.finance_financing_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_name text not null,
  financing_type text not null default 'other',
  purpose text,
  principal_amount numeric(14,2) not null default 0,
  commission_amount numeric(14,2) not null default 0,
  total_months integer not null default 1,
  monthly_payment numeric(14,2) not null default 0,
  paid_months integer not null default 0,
  start_date date,
  next_payment_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_financing_plans_amounts_check check (
    principal_amount >= 0 and commission_amount >= 0 and monthly_payment >= 0
  ),
  constraint finance_financing_plans_months_check check (
    total_months > 0 and paid_months >= 0 and paid_months <= total_months
  ),
  constraint finance_financing_plans_type_check check (
    financing_type in ('bank_loan', 'participation_finance', 'other')
  ),
  constraint finance_financing_plans_status_check check (
    status in ('active', 'completed', 'paused')
  )
);

alter table public.finance_financing_plans enable row level security;

create policy if not exists "finance financing plans select own"
  on public.finance_financing_plans for select
  using (auth.uid() = user_id);

create policy if not exists "finance financing plans insert own"
  on public.finance_financing_plans for insert
  with check (auth.uid() = user_id);

create policy if not exists "finance financing plans update own"
  on public.finance_financing_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "finance financing plans delete own"
  on public.finance_financing_plans for delete
  using (auth.uid() = user_id);

create index if not exists idx_finance_financing_plans_user_status
  on public.finance_financing_plans(user_id, status);
```

Manual Supabase step:

```text
Run sql/finance_financing_plans.sql in Supabase SQL Editor before using the UI.
```

---

## Derived Calculation Rules

Add helpers in `app.js`:

```js
function financeFinancingSummary(plan) {
  const principal = Number(plan.principal_amount || 0);
  const commission = Number(plan.commission_amount || 0);
  const totalMonths = Math.max(1, Number(plan.total_months || 1));
  const paidMonths = Math.min(totalMonths, Math.max(0, Number(plan.paid_months || 0)));
  const monthlyPayment = Number(plan.monthly_payment || 0) || principal / totalMonths;
  const paidAmount = monthlyPayment * paidMonths;
  const remainingMonths = totalMonths - paidMonths;
  const remainingAmount = monthlyPayment * remainingMonths;
  const totalCost = principal + commission;
  const progressPercent = totalMonths ? (paidMonths / totalMonths) * 100 : 0;

  return {
    principal,
    commission,
    totalMonths,
    paidMonths,
    remainingMonths,
    monthlyPayment,
    paidAmount,
    remainingAmount,
    totalCost,
    progressPercent,
  };
}
```

Acceptance example:

```text
principal_amount = 1000000
commission_amount = 75000
total_months = 30
monthly_payment = 33333.33
paid_months = 10

Expected:
paidAmount ≈ 333333.30
remainingMonths = 20
remainingAmount ≈ 666666.60
commission included totalCost = 1075000
progressPercent ≈ 33.33
```

---

## Tasks

### Task 1: Add approved sprint to repo docs

**Objective:** Make the approved feature visible in the product roadmap/backlog before runtime work.

**Files:**
- Modify: `BACKLOG.md`
- Modify: `ROADMAP.md`
- Modify: `docs/FINANCE_PHASE_2_PLAN.md`
- Modify: `VERSION.md`

**Verification:**

```bash
git diff -- BACKLOG.md ROADMAP.md docs/FINANCE_PHASE_2_PLAN.md VERSION.md
```

Expected: Only roadmap/backlog/version planning text changed.

---

### Task 2: Add Supabase SQL migration

**Objective:** Add the user-scoped table for financing/loan plans.

**Files:**
- Create: `sql/finance_financing_plans.sql`

**Verification:**

```bash
node scripts/verify-finance-module.mjs
```

Expected: verification script passes after adding a check for the new SQL file.

---

### Task 3: Load financing plans into Finance state

**Objective:** Fetch current user's financing plans from Supabase.

**Files:**
- Modify: `app.js`

Implementation shape:

```js
state.financeFinancingPlans = [];
```

Fetch from:

```text
finance_financing_plans
```

Use existing auth/user scoped loading style from accounts, transactions, transfers, and budgets.

**Verification:**

```bash
node --check app.js
```

Expected: syntax OK.

---

### Task 4: Add calculation helpers

**Objective:** Calculate paid amount, remaining amount, remaining months, total cost, and progress percent.

**Files:**
- Modify: `app.js`

**Acceptance:** Katılımevim example returns:

```text
paid = 333333.33 TL
remaining = 666666.67 TL
remaining months = 20
commission included total = 1075000 TL
progress = 33.3%
```

**Verification:**

```bash
node --check app.js
node scripts/verify-finance-module.mjs
```

---

### Task 5: Add Financing / Loan UI to Finance screen

**Objective:** User can create, edit, delete, and view financing records.

**Files:**
- Modify: `app.js`
- Modify: `style.css` only if existing classes are insufficient

UI fields:

```text
provider_name
financing_type
purpose
principal_amount
commission_amount
total_months
monthly_payment
paid_months
start_date
next_payment_date
status
notes
```

**Verification:**

```bash
node --check app.js
```

Manual browser smoke:

```text
- Create Katılımevim sample record
- Confirm paid/remaining summary
- Edit paid months from 10 to 11
- Confirm remaining months changes from 20 to 19
- Delete test record
```

---

### Task 6: Update service worker and changelog

**Objective:** Make cache/version metadata match the new feature.

**Files:**
- Modify: `sw.js`
- Modify: `CHANGELOG.md`
- Modify: `RELEASE_NOTES.md`
- Modify: `VERSION.md`

**Verification:**

```bash
node --check sw.js
node scripts/verify-finance-module.mjs
```

---

## Out of Scope for 2C.0

```text
- Per-installment payment table
- Dekont / document attachment
- Automatic bank import
- Interest calculation engine
- Calendar notification integration
```

These belong to:

```text
2C.1 — Financing Installment Schedule
2C.2 — Financing Dashboard & Alerts
2G — Calendar & Notifications
```
