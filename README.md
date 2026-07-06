# Momentum Hub

**Know Today. Plan Tomorrow.**

Momentum Hub; ev, arac, gelir/gider, belge, takvim, bildirim, rapor ve finansal durumunu tek merkezden takip etmek icin gelistirilen kisisel kontrol merkezidir.

## Current Product Status

- Stable baseline: **V6.0 Stable**
- Active phase: **Faz 2 — Finance**
- Current sprint: **Sprint 2G — Finance Stable Polish & Hardening**
- Target: **Momentum Hub V7.0 — Finance Stable**

## Core Modules

### Faz 1 — Asset Foundation

- Bugun
- Momentum AI temel kartlari
- Varliklar
- Araclar
- Gelir / gider kayitlari
- Belgeler
- Raporlar
- Takvim
- Bildirimler
- Global arama
- Tanimlar
- Yedek
- PWA

### Faz 2 — Finance

Finance fazi basladi. Ilk teknik adim olarak Finance database architecture olusturuldu.

Finance hedefi klasik muhasebe uygulamasi yapmak degildir. Hedef, kullanicinin finansal durumunu hizli anlamasini saglayan bir karar destek kokpiti olusturmaktir.

Baslica alanlar:

- Hesaplar
- Gelir / gider hareketleri
- Transferler
- Butce
- Yatirimlar
- Krediler / finansmanlar
- Net servet
- Finans raporlari
- Takvim ve bildirim entegrasyonu

## Important Documents

- [ROADMAP.md](ROADMAP.md) — Aktif urun roadmap'i
- [BACKLOG.md](BACKLOG.md) — Sprint ve teknik backlog
- [docs/CTO_HANDOVER.md](docs/CTO_HANDOVER.md) — CTO devir notlari
- [docs/FINANCE_PHASE_2_PLAN.md](docs/FINANCE_PHASE_2_PLAN.md) — Finance faz plani
- [docs/README_DATABASE.md](docs/README_DATABASE.md) — Finance database architecture
- [docs/README_FINANCE.md](docs/README_FINANCE.md) — Finance module notes

## Database Files

Legacy Asset setup:

- `supabase_setup_v5.sql`

Finance setup:

- `sql/finance_schema.sql`
- `sql/finance_seed.sql`
- `sql/finance_indexes.sql`
- `sql/finance_rls.sql`
- `sql/finance_storage.sql`

Recommended Finance SQL order:

1. `sql/finance_schema.sql`
2. `sql/finance_seed.sql`
3. `sql/finance_indexes.sql`
4. `sql/finance_rls.sql`
5. `sql/finance_storage.sql`

## Deployment

Proje GitHub uzerinden Netlify'a baglidir. Degisiklikler GitHub Desktop ile commit ve push edildiginde Netlify otomatik deploy eder.

## Public Repo Security Notes

Public repo icinde su bilgiler bulunmamalidir:

- Supabase service-role key
- Netlify token
- `.env` dosyalari
- Gercek kisisel finans verileri
- Musteri veya kisi ozel verileri
- Database sifreleri

Supabase publishable/anon key frontend icin normal olabilir; ancak RLS daima aktif ve dogrulanmis olmalidir.
