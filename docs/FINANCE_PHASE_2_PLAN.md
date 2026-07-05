# Finance Phase 2 Plan

## Faz adi

Finance

## Hedef surum

Momentum Hub V7.0 — Finance Stable

## Temel ilke

> Muhasebe degil, karar destek sistemi.

Finance modulu; kullaniciya hesap defteri tutturmak icin degil, finansal durumunu hizli ve dogru anlamasi icin gelistirilecek.

## Urun hedefi

Kullanici Finance ekranini actiginda 5 saniye icinde sunlari anlamali:

- Toplam nakit
- Toplam borc
- Toplam varlik
- Net servet
- Bu ay gelir / gider / tasarruf
- Yaklasan finansal yukumlulukler
- Butce ve hedef durumu

---

## Mevcut database durumu

Olusturulan tablolar:

- `finance_categories`
- `finance_accounts`
- `finance_transactions`
- `finance_transfers`
- `finance_financings`
- `finance_goals`
- `finance_monthly_summary`

Olusturulan destek dosyalari:

- `sql/finance_schema.sql`
- `sql/finance_seed.sql`
- `sql/finance_indexes.sql`
- `sql/finance_rls.sql`
- `sql/finance_storage.sql`
- `docs/README_DATABASE.md`
- `docs/README_FINANCE.md`
- `diagrams/FINANCE_DATABASE.png`

CTO kabul durumu:

> Finance database foundation ilk adim olarak kabul edildi. Ancak Budget, Investment detaylari, taksit plani ve recurring yapilar sonraki patchlerde tamamlanacak.

---

## Sprint 2A.1 — Finance Accounts UI

### Amac

Kullanici finansal hesaplarini tanimlayabilsin ve toplam durumunu gorebilsin.

### Eklenecekler

- Sol menu: `Finans`
- Finance sayfasi
- Account listesi
- Account ekleme formu
- Account duzenleme formu
- Account pasife alma
- KPI kartlari:
  - Toplam nakit / varlik hesaplari
  - Toplam borc / liability hesaplari
  - Net hesap durumu

### Kullanilacak tablo

`finance_accounts`

### Kabul kriterleri

- Auth olan kullanici kendi hesaplarini gorur.
- Hesap ekleme calisir.
- Hesap duzenleme calisir.
- Pasife alma calisir.
- `is_asset=false` hesaplar borc olarak hesaplanir.
- Mevcut Asset modulu bozulmaz.

---

## Sprint 2A.2 — Finance Transactions UI

### Amac

Kullanici finansal hareketlerini kaydedebilsin.

### Eklenecekler

- Gelir kaydi
- Gider kaydi
- Transfer kaydi
- Hesap secimi
- Kategori secimi
- Tarih / vade / durum
- Hareket listesi
- Basit filtreleme

### Kullanilacak tablolar

- `finance_transactions`
- `finance_transfers`
- `finance_categories`
- `finance_accounts`

---

## Sprint 2A.3 — Balance Logic

### Amac

Hesap bakiyeleri ve net durum tutarli hesaplansin.

### Karar bekleyen konu

Bakiyeler transaction'lardan anlik mi hesaplanacak, yoksa `current_balance` alanina yazilarak mi tutulacak?

CTO oneri:

Ilk surumde basit ve kontrollu ilerlemek icin `current_balance` hesap formunda manuel baslangic degeri olarak kullanilsin; transaction etkisi sonraki sprintte netlestirilsin.

---

## Sprint 2B — Budget

### Gerekli database patch

Onerilen tablolar:

- `finance_budgets`
- `finance_budget_items`

### Ozellikler

- Aylik butce
- Kategori bazli limit
- Gerceklesen / kalan
- Limit asimi uyarisi

---

## Sprint 2C — Finance Dashboard

### Ana ekran adi

Menü: `Finans`  
Baslik: `Finansal Durum`

### Gosterilecekler

- Net servet
- Nakit
- Varliklar
- Borclar
- Bu ay gelir
- Bu ay gider
- Tasarruf
- Yaklasan odemeler
- Geciken finans kayitlari

---

## Sprint 2D — Investments

### Kapsam

- Altin
- Doviz
- Hisse senedi
- Fon
- BES
- Kripto hazirligi

### Not

Ilk surumde otomatik piyasa verisi zorunlu degil. Manuel guncel deger yeterli kabul edilebilir.

---

## Sprint 2E — Loans & Financings

### Kapsam

- Konut kredisi
- Arac kredisi
- Ihtiyac kredisi
- Katilim Evim / Fuzul Ev / Eminevim
- Taksit plani
- Kalan borc
- Odeme takipleri

### Gerekli database patch

Onerilen tablo:

- `finance_financing_installments`

---

## Sprint 2F — Reports

### Kapsam

- Aylik gider trendi
- Kategori dagilimi
- Nakit akisi
- Net servet zaman cizgisi
- Portfoy dagilimi

---

## Sprint 2G — Calendar & Notifications

### Kapsam

- Kredi taksitleri takvime duser
- Kart ekstresi takvime duser
- Otomatik odemeler gorunur
- Yaklasan finansal yukumlulukler bildirim uretir

---

## Faz 2 riskleri

1. Kapsam fazla buyuyebilir; sprintleri kucuk tutmak sart.
2. Finance verisi hassastir; RLS ve public repo guvenligi kritik.
3. UI muhasebe programina donmemeli; karar destek kokpiti ilkesi korunmali.
4. `app.js` daha fazla buyumeden modulerlesme planlanmali.
5. Service worker cache'i finans verilerini cache'lememeli.

## Faz 2 stable kriterleri

- Finance Accounts, Transactions, Budget ve Dashboard calisir.
- RLS dogrulanir.
- Mobil ve masaustu deneyim kabul edilebilir seviyededir.
- Net servet / nakit / borc hesaplari tutarlidir.
- Takvim ve bildirim entegrasyonu tamamlanir.
- Kullanici her gun Finance ekranini acmak icin gercek sebep bulur.
