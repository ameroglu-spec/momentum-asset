# Changelog

## V7.0 Finance Stable Release Candidate

### Added

- Added `docs/V7_FINANCE_STABLE_RC.md` with production validation checklist.

### Changed

- Updated service worker cache key to `momentum-hub-v7-finance-stable-rc1` so RC deployments pick up the latest assets.
- Advanced current implementation milestone to `release: build v7 finance stable candidate`.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node scripts/verify-v7-stable.mjs`
- `node --check app.js`
- `node --check sw.js`
- `node --check scripts/verify-v7-stable.mjs`

## Sprint 2G — Finance Stable Polish & Hardening

### Added

- Added `docs/SECURITY_CHECKLIST.md` for public repo and V7 Finance Stable handoff checks.
- Added `scripts/verify-v7-stable.mjs` quality gate.

### Changed

- Updated browser title metadata to `Momentum Hub - V7.0 Finance Stable`.
- Updated PWA manifest name to `Momentum Hub V7 Finance`.
- Updated backup export filename to `momentum-hub-v7-yedek.json`.
- Hardened service worker cache key to `momentum-hub-v7-finance-stable`.
- Explicitly excluded Supabase hostnames from service worker cache eligibility.
- Expanded Finance verification script with V7 stable hardening checks.
- Aligned Finance page shell width with Asset/Cars page header behavior.
- Added Finance and Documents mobile polish rules for narrow screens.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node scripts/verify-v7-stable.mjs`
- `node --check app.js`
- `node --check sw.js`
- `node --check scripts/verify-v7-stable.mjs`

---

## Sprint 2F — Finance Calendar & Notifications Foundation

### Added

- Added `financeCalendarItems` helper for financing installment calendar events.
- Added `financeCalendarSummary` helper and Finance calendar summary cards.
- Added financing installment cards into Calendar agenda.
- Added finance notification candidates for overdue installments and payments due within 7 days.

### Changed

- Calendar month view now includes financing installment events alongside asset income/expense records.
- Notification Center and notification badge now include finance installment warnings.
- Updated service worker cache key for Sprint 2F.
- Expanded Finance verification script for calendar and notification foundation.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2E — Finance Reports Foundation

### Added

- Added `financeReportsData` helper for monthly income/expense, category expense, financing payment, and budget actual reports.
- Added date range filtering for Finance reports.
- Added `Finans Raporları` panel to Finance screen.
- Added CSV export actions for monthly, category, financing, and budget report sections.

### Changed

- Updated Finance navigation tabs with Reports shortcut.
- Updated service worker cache key for Sprint 2E.
- Expanded Finance verification script for reports foundation.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2D — Finance Dashboard

### Added

- Added Finance Dashboard detail helper and dashboard panel.
- Added dashboard cards for total assets, total debt, net status, monthly net flow, budget usage, and remaining financing.
- Added upcoming financing/loan installment list to Finance Dashboard.
- Added `Dikkat Edilecekler` attention area for overdue installments, budget usage, and negative cash flow signals.

### Changed

- Today dashboard Finance Summary now reuses Finance Dashboard details.
- Financing summaries now use installment rows when available, so paid total, remaining payment, and paid installment count update after installment status changes.
- Marking an installment as `Ödendi` with empty paid amount now fills paid amount with the installment amount.
- Updated service worker cache key for Sprint 2D.
- Expanded Finance verification script for Finance Dashboard and installment-derived financing totals.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2C.1 — Financing Installment Schedule

### Added

- Added `finance_financing_installments` loading into app state.
- Added installment schedule helpers for per-plan rows, status summary, and overdue signal.
- Added `Taksit Planı` section inside financing/loan cards.
- Added installment create/edit/delete UI.
- Added automatic installment generation from financing plan term/monthly payment.
- Added `sql/finance_financing_installments.sql` with RLS own-user policies.

### Changed

- Updated service worker cache key for Sprint 2C.1.
- Expanded Finance verification script for installment schedule.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2C.0 — Financing / Loan Tracking Foundation

### Added

- Added `finance_financing_plans` loading into app state.
- Added financing/loan summary helpers for paid amount, remaining amount, remaining months, total cost, and progress percent.
- Added `Finansmanlar / Krediler` section to Finance screen.
- Added financing/loan create/edit/delete UI.
- Added Finance KPI cards for active financing count, paid total, remaining total, and commission total.
- Added `sql/finance_financing_plans.sql` with RLS own-user policies.

### Changed

- Updated service worker cache key for Sprint 2C.0.
- Expanded Finance verification script for financing/loan tracking.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2B.0 — Budget Foundation

### Added

- Added `finance_budgets` loading into app state.
- Added monthly budget helper functions.
- Added budget list/cards to Finance screen.
- Added budget create/edit/delete UI.
- Added `sql/finance_budgets.sql` with RLS own-user policies.

### Changed

- Updated service worker cache key for Sprint 2B.0.
- Expanded Finance verification script for budget foundation.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2A.5 — Today Dashboard Finance Cards

### Added

- Added Finance Summary cards to the Today dashboard.
- Added empty state for users without Finance accounts.
- Added dashboard navigation button to Finance.

### Changed

- Dashboard Finance cards reuse Finance balance engine summaries.
- Updated service worker cache key for Sprint 2A.5.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2A.4 — Finance Polish & Reconciliation

### Added

- Added manual balance reconciliation action for Finance accounts.
- Added clearer calculated/manual/delta display on account cards.
- Added Finance balance calculation note.

### Changed

- Transfer form now defaults source and target accounts to different accounts when possible.
- Updated Finance currency mismatch messages.
- Updated service worker cache key for Sprint 2A.4.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`

---

## Sprint 2A.3 — Balance Engine + Transfers

### Added

- Added `finance_transfers` loading into app state.
- Added ledger-style balance engine based on initial balance, completed transactions, and transfers.
- Added transfer create/edit/delete UI.
- Added transfer list to Finance screen.
- Added calculated balance, manual balance, and balance delta display on account cards.
- Added `sql/finance_transfer_account_guard.sql` for transfer account ownership hardening.

### Changed

- Finance KPI cards now use calculated balances instead of raw `current_balance`.
- Service worker cache key updated for Sprint 2A.3 while keeping same-origin static app shell caching only.
- Finance verification script expanded for transfers and balance engine checks.

### Notes

- `current_balance` is not automatically overwritten. Calculated balance remains ledger-derived.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`
- Browser smoke test
- Public RLS REST check

---

## Sprint 2A.2 — Finance Transactions UI

### Added

- Added `finance_transactions` loading into app state.
- Added Finance transaction create/edit form for income and expense records.
- Added transaction list with account/type filters.
- Added monthly income, expense, net flow, and total transaction KPI cards.
- Added transaction delete flow scoped by `user_id`.
- Added `scripts/verify-finance-module.mjs` quality check.
- Added `sql/finance_transaction_account_guard.sql` for account ownership hardening.

### Changed

- Updated Finance screen to show account and transaction management together.
- Updated service worker cache key for Sprint 2A.2.
- Hardened service worker caching to same-origin static app shell only.
- Added client-side `user_id` filters on Finance account/transaction reads.
- Updated README, VERSION, RELEASE_NOTES, and BACKLOG for current sprint.

### Notes

- Automatic balance engine and transfer accounting remain planned for Sprint 2A.3.

### Verification

- `node scripts/verify-finance-module.mjs`
- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- `node --check sw.js`
- Browser smoke test
- Public RLS REST check

---

## Sprint 2A.1 — Finance Accounts UI

### Added

- Added `Finans` navigation item.
- Added Finance Accounts dashboard shell.
- Added `finance_accounts` loading into app state.
- Added active account list, passive account list, and finance KPI cards.
- Added account create/edit form for cash, bank, credit card, FX, gold, crypto, investment, and other accounts.
- Added account archive/reactivate flow via `is_active`.
- Added `scripts/verify-finance-accounts.mjs` quality check.

### Changed

- Updated service worker cache key to force clients to pick up new Finance UI assets.
- Updated README, VERSION, and backlog sprint state.

### Verification

- `node scripts/verify-finance-accounts.mjs`
- `node --check app.js`
- Browser smoke test on local static server

---

## Sprint 2A.0 — CTO Handover & Roadmap Lock

### Added

- Added `ROADMAP.md` as the active product roadmap.
- Added `BACKLOG.md` for sprint and technical backlog tracking.
- Added `docs/CTO_HANDOVER.md` for CTO handover decisions and operating principles.
- Added `docs/FINANCE_PHASE_2_PLAN.md` for the Finance phase implementation direction.

### Changed

- Updated README to reflect active Finance phase.
- Updated version metadata to clarify V6.0 Stable as baseline and V7.0 Finance as target.
- Clarified that Finance is the active Faz 2.

### Notes

- No application runtime behavior changed in this sprint.
- This sprint locks the product direction before Finance UI work starts.

---

## V7.0 Sprint 1A.2 — Finance Database Architecture

### Added

- Finance performance indexes.
- Finance RLS policy file.
- Finance private storage bucket setup.
- Finance storage access policies.
- Finance database ER diagram.
- Database architecture documentation.

---

## V6.0 Stable

### Fixed

- Takvim ekranindaki calismayan Gun ve Hafta gorunumu kaldirildi.
- Takvim yalnizca aylik gorunum olacak sekilde sadelestirildi.
- Mobil ve masaustu takvim yerlesimi iyilestirildi.
- Service Worker cache versiyonu guncellendi.

### Added

- Takvim ay secici eklendi.
- Secilen ay icin gelir, gider, net, acik ve geciken kayit ozeti eklendi.
- Secilen aya gore finans kayitlari filtreleme eklendi.

### Improved

- Genel UI tutarliligi iyilestirildi.
- Manifest uygulama adi V6.0 Stable olarak guncellendi.
