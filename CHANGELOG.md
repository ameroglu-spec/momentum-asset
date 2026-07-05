# Changelog

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
