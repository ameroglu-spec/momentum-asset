# Momentum Hub Public Repo Security Checklist

## Sprint 2G — Finance Stable Polish & Hardening

Status: active checklist for V7.0 Finance Stable handoff.

## Secrets

- [x] No Supabase service-role key is committed.
- [x] Client uses publishable/anon-style Supabase key only.
- [x] No real customer, personal finance, bank, IBAN, card, or production private data is committed.
- [x] Zip handoff artifacts are not required for source control and should not be committed.

## Database / RLS

- [x] Finance tables are loaded with `eq('user_id', user.id)` client filters.
- [x] Finance write/delete flows include user-scoped guards where implemented.
- [x] SQL migration files define own-user RLS policies for new Finance tables.

## PWA / Cache

- [x] Service worker caches only static app shell files.
- [x] Supabase/API/storage responses are excluded from cache.
- [x] V7 stable cache key is set to `momentum-hub-v7-finance-stable`.

## Verification commands

```text
node scripts/verify-finance-module.mjs
node scripts/verify-finance-accounts.mjs
node scripts/verify-v7-stable.mjs
node --check app.js
node --check sw.js
```

## Release note

Before committing, review `git status --short` and do not commit generated `.zip` handoff files.
