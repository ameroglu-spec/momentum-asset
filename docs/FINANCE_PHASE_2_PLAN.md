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

## Sprint 2C.0 — Financing / Loan Tracking Foundation

### Amac

Kullanici banka kredisi veya Katilimevim/Fuzulevim/Birevim gibi katilim finansmani odemelerini Finance icinde takip edebilsin.

### Eklenecekler

- Finansman/kredi kaydi
- Kurum adi
- Finansman tipi: banka kredisi / katilim finansmani / diger
- Alinan finansman tutari
- Komisyon / organizasyon ucreti
- Toplam vade
- Aylik odeme
- Odenen ay
- Kalan ay
- Odenen toplam
- Kalan toplam
- Komisyon dahil toplam maliyet
- Ilerleme yuzdesi

### Kullanilacak tablo

`finance_financing_plans`

### Kabul ornegi

Katilimevim'den 1.000.000 TL finansman, 75.000 TL komisyon, 30 ay vade, 33.333,33 TL aylik odeme ve 10 odenen ay icin sistem sunlari gostermeli:

- Odenen: 333.333,33 TL
- Kalan: 666.666,67 TL
- Kalan ay: 20
- Komisyon dahil toplam maliyet: 1.075.000 TL
- Ilerleme: %33,3

### Kapsam disi

- Ay ay taksit tablosu
- Dekont/dokuman baglantisi
- Calendar notification entegrasyonu

---

## Sprint 2C.1 — Financing Installment Schedule

### Kapsam

- Ay ay taksit plani
- Odendi / gecikti / bekliyor durumu
- Kismi odeme hazirligi
- Dekont/dokuman baglantisi hazirligi

### Gerekli database patch

Onerilen tablo:

- `finance_financing_installments`

---

## Sprint 2D — Finance Dashboard

**Durum:** Production test edildi ve onaylandi.

### Ana ekran adi

Menü: `Finans`  
Baslik: `Finansal Durum`

### Tamamlananlar

- Finance Dashboard paneli
- Net durum / toplam varlik / toplam borc kartlari
- Bu ay net akis karti
- Butce kullanimi karti
- Kalan finansman karti
- Yaklasan taksitler
- Dikkat edilecekler alani

---

## Sprint 2E — Finance Reports Foundation

**Durum:** Production test edildi ve onaylandi.

### Tamamlananlar

- Aylik gelir/gider raporu
- Kategori bazli gider raporu
- Finansman/kredi odeme raporu
- Butce / gerceklesen raporu
- Tarih araligi filtresi
- CSV export altyapisi

---

## Sprint 2F — Finance Calendar & Notifications Foundation

**Durum:** Production test edildi ve onaylandi.

### Tamamlananlar

- Finansman taksitleri takvim ay gorunumune baglandi
- Takvim ajandasinda finansman taksit kartlari gosterildi
- Finans takvimi ozeti kartlari eklendi
- `7 gun icinde finansman odemesi var` uyarisi eklendi
- `Gecikmis finansman taksiti var` uyarisi eklendi
- Sol menu bildirim rozeti finance uyarilarini sayar hale getirildi

### Kapsam disi

- Gercek push notification / e-posta / Telegram bildirimi
- Otomatik recurring transaction sistemi

---

## Sprint 2G — Finance Stable Polish & Hardening

**Durum:** Production test edildi ve onaylandi. Ek mobil polish duzeltmesi uygulandi.

### Hedef

Finance fazini V7.0 Stable release'e hazirlamak.

### Tamamlananlar

- V7 Finance Stable kabul kontrolu
- Service worker cache stratejisi temizligi
- V6/V7 version metadata uyumsuzluklarini temizleme
- Public repo security checklist
- Mobil ve masaustu son UX kontrol checklist'i
- Basit test/quality gate iyilestirmesi
- Release notes ve handoff paketinin finalize edilmesi

---

## V7.0 Finance Stable Release Candidate

**Durum:** Kodlari olusturuldu, production validation bekliyor.

### Kapsam

- Sprint 2G onayi RC durumuna islendi.
- `docs/V7_FINANCE_STABLE_RC.md` checklist dosyasi eklendi.
- Service worker cache anahtari `momentum-hub-v7-finance-stable-rc1` olarak guncellendi.
- Finance/Documents mobil polish duzeltmeleri RC paketine dahil edildi.
- Yeni Supabase SQL gerekmedigi not edildi.

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
