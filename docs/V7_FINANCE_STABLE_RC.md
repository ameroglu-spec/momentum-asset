# Momentum Hub V7.0 Finance Stable Release Candidate

Status: Release Candidate ready for production validation.

## Scope

This release candidate packages the completed Finance phase work after Sprint 2G approval and the mobile polish correction.

## Included Finance Capabilities

- Finance accounts
- Income / expense transactions
- Account transfers
- Budget foundation
- Financing / loan tracking
- Financing installment schedule
- Finance dashboard
- Finance reports
- Finance calendar integration
- Finance notifications foundation
- V7 stable metadata and PWA cache hardening
- Finance and Documents mobile layout polish

## Release Candidate Quality Gates

- Finance module verification must pass.
- Finance accounts verification must pass.
- V7 stable verification must pass.
- `app.js`, `sw.js`, and release verifier syntax checks must pass.
- Supabase requests must remain excluded from the service worker cache.
- Public repo handoff must not include service-role keys or private finance data.

## Production Validation Checklist

- [ ] Open app after deploy and hard refresh / service worker update.
- [ ] Confirm title shows Momentum Hub V7 Finance Stable context.
- [ ] Confirm Finance page opens on desktop and mobile.
- [ ] Confirm Momentum Finance header width aligns with Asset/Cars page behavior.
- [ ] Confirm Documents page cards/buttons fit on mobile.
- [ ] Confirm accounts, transactions, transfers, financing, reports, calendar, and notifications pages load.
- [ ] Confirm no Supabase SQL migration is required for this RC package beyond already delivered Finance SQL files.

## Notes

- This RC does not add new database tables.
- This RC increments the service worker cache key to `momentum-hub-v7-finance-stable-rc1` so deployed clients receive the latest assets.
