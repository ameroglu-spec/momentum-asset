# Momentum Hub Release Notes

## Sprint 2D — Finance Dashboard

Bu sprint Finance ekranına ana dashboard katmanını ve taksit durumuna bağlı canlı finansman özetlerini ekler.

### Ozet

- Finance ekranına `Finance Dashboard` paneli eklendi.
- Dashboard toplam varlık, toplam borç, net durum, bu ay net akış, bütçe kullanımı ve kalan finansman kartlarını gösterir.
- Yaklaşan finansman/kredi taksitleri ayrı listelenir.
- `Dikkat Edilecekler` alanı geciken taksit, yüksek/aşılmış bütçe ve negatif net akış sinyallerini gösterir.
- Finansman/kredi kartları artık taksit kaydı varsa ödenen toplam, kalan ödeme ve ödenen taksit sayısını taksit planından hesaplar.
- Bir taksit `Bekliyor` durumundan `Ödendi` durumuna alınırsa ödenen tutar boşsa otomatik taksit tutarıyla doldurulur.
- Service worker cache anahtarı 2D'ye güncellendi.

### Supabase SQL

Bu sprint yeni SQL dosyası gerektirmez. Önceki sprintlerden şu dosyaların production'da çalışmış olması gerekir:

```text
sql/finance_financing_plans.sql
sql/finance_financing_installments.sql
```

### Onerilen commit mesaji

```text
feat: add finance dashboard
```

---

## Sprint 2C.1 — Financing Installment Schedule

Bu sprint finansman/kredi kayıtlarına ay ay taksit planı ve ödeme durumu takibi ekler.

### Ozet

- `finance_financing_installments` tablosu için SQL dosyası eklendi.
- Finansman kartlarına `Taksit Planı` bölümü eklendi.
- Kullanıcı taksit ekleyebilir, düzenleyebilir ve silebilir.
- Taksit durumları desteklenir: bekliyor, ödendi, kısmi ödendi, gecikti, iptal.
- Finansman kaydındaki vade ve aylık ödeme üzerinden otomatik taksit planı oluşturulabilir.
- Vade tarihi geçmiş bekleyen taksitler UI'da gecikti olarak sinyal verir.
- Service worker cache anahtarı 2C.1'e güncellendi.

### Supabase SQL

Supabase SQL Editor'da çalıştırılacak dosya:

```text
sql/finance_financing_installments.sql
```

### Onerilen commit mesaji

```text
feat: add financing installment schedule
```

---

## Sprint 2C.0 — Financing / Loan Tracking Foundation

Bu sprint Finance modülüne banka kredisi ve katılım finansmanı ödeme takibini ekler.

### Ozet

- `finance_financing_plans` tablosu için SQL dosyası eklendi.
- Finance ekranına `Finansmanlar / Krediler` bölümü eklendi.
- Kullanıcı banka kredisi, Katılımevim/Fuzulevim/Birevim benzeri katılım finansmanı veya diğer finansman kayıtlarını ekleyebilir, düzenleyebilir ve silebilir.
- Kartlar alınan finansman, komisyon, aylık ödeme, ödenen ay, kalan ay, ödenen toplam, kalan ödeme, komisyon dahil toplam maliyet ve ilerleme yüzdesi gösterir.
- Finance üst KPI alanına aktif finansman, ödenen finansman, kalan finansman ve komisyon toplamları eklendi.
- İlk sürümde taksitler ay ay ayrı tabloya açılmaz; toplam vade ve ödenen ay üzerinden hesaplanır.
- Service worker cache anahtarı 2C.0'a güncellendi.

### Supabase SQL

Supabase SQL Editor'da çalıştırılacak dosya:

```text
sql/finance_financing_plans.sql
```

### Onerilen commit mesaji

```text
feat: add financing loan tracking foundation
```

---

## Sprint 2B.0 — Budget Foundation

Bu sprint Finance modülüne aylık kategori bütçesi temelini ekler.

### Ozet

- `finance_budgets` tablosu için SQL dosyası eklendi.
- Finance ekranına `Bütçeler` bölümü eklendi.
- Kullanıcı aylık kategori bütçesi ekleyebilir, düzenleyebilir ve silebilir.
- Bütçe kartları limit / harcanan / kalan / kullanım yüzdesi gösterir.
- Harcanan değer aynı ay completed expense hareketlerinden ve kategori/title eşleşmesinden gelir.
- Service worker cache anahtarı 2B.0'a güncellendi.

### Supabase SQL

Supabase SQL Editor'da çalıştırılacak dosya:

```text
sql/finance_budgets.sql
```

### Onerilen commit mesaji

```text
feat: add budget foundation
```

---

## Sprint 2A.5 — Today Dashboard Finance Cards

Bu sprint Bugün dashboard altına sade Finans Özeti kartlarını ekler.

### Ozet

- Bugün ekranına `Finans Özeti` bölümü eklendi.
- Toplam varlık, toplam borç ve net durum gösteriliyor.
- Bu ay gelir, gider ve net akış gösteriliyor.
- Finans hesabı yoksa boş durum gösteriliyor.
- `Finans’a Git` butonu eklendi.
- Kartlar Finance modülündeki mevcut hesaplanan bakiye motorunu kullanıyor.
- Service worker cache anahtarı 2A.5'e güncellendi.

### Onerilen commit mesaji

```text
feat: add finance cards to today dashboard
```

---

## Sprint 2A.4 — Finance Polish & Reconciliation

Bu sprint Finance ekranını küçük ve kontrollü UX iyileştirmeleriyle cilalar.

### Ozet

- Hesap kartlarında hesaplanan bakiye / manuel bakiye / fark bilgisi netleştirildi.
- Fark varsa `Manuel bakiyeyi eşitle` aksiyonu eklendi.
- Finance üst alanına bakiye hesaplama mantığını açıklayan kısa not eklendi.
- Transfer formu, yeni kayıt açılırken kaynak ve hedef hesapları mümkünse farklı seçiyor.
- Para birimi uyumsuzluk mesajları sadeleştirildi.
- Service worker cache anahtarı 2A.4'e güncellendi.

### Onerilen commit mesaji

```text
feat: polish finance reconciliation UX
```

---

## Sprint 2A.3 — Balance Engine + Transfers

Bu sprint Finance modülüne hesaplanan bakiye motoru ve hesaplar arası transferleri ekler.

### Ozet

- `finance_transfers` tablosu uygulamaya bağlandı.
- Hesaplanan bakiye motoru eklendi.
- Hesap kartları artık `Başlangıç + gerçekleşen hareketler + transferler` mantığıyla hesaplanan bakiyeyi gösteriyor.
- Manuel bakiye ile hesaplanan bakiye farkı gösteriliyor.
- Transfer ekleme / düzenleme / silme eklendi.
- Transfer listesi Finance ekranına eklendi.
- Toplam varlık, toplam borç ve net durum hesaplanan bakiye ile güncellendi.
- Transfer account ownership SQL guard dosyası eklendi: `sql/finance_transfer_account_guard.sql`
- Service worker cache anahtarı 2A.3'e güncellendi.

### Bilincli karar

`current_balance` otomatik overwrite edilmiyor. Finansal durum, kayıt defteri mantığıyla yeniden hesaplanabilir kalıyor.

### Guncellenen dosyalar

```text
app.js
style.css
sw.js
README.md
VERSION.md
CHANGELOG.md
RELEASE_NOTES.md
BACKLOG.md
scripts/verify-finance-module.mjs
sql/finance_transfer_account_guard.sql
```

### Testler

```text
node scripts/verify-finance-module.mjs
node scripts/verify-finance-accounts.mjs
node --check app.js
node --check sw.js
```

### Supabase SQL

Supabase SQL Editor'da çalıştırılacak dosya:

```text
sql/finance_transfer_account_guard.sql
```

### Onerilen commit mesaji

```text
feat: add balance engine and transfers
```

---

## Sprint 2A.2 — Finance Transactions UI

Bu sprint Finance modülüne gelir/gider hareketleri ekler. Kullanıcı artık tanımladığı finans hesaplarına hareket bağlayabilir, listeleyebilir, düzenleyebilir ve silebilir.

### Ozet

- `finance_transactions` tablosu uygulamaya bağlandı.
- Finans ekranına `+ Hareket Ekle` aksiyonu eklendi.
- Gelir/gider hareket formu eklendi.
- Hareket listesi ve hesap/tip filtreleri eklendi.
- Bu ay gelir, gider ve net akış KPI kartları eklendi.
- Hareket düzenleme ve silme eklendi.
- Service worker cache anahtari guncellendi.
- Genel Finance doğrulama scripti eklendi: `scripts/verify-finance-module.mjs`
- Service worker artik sadece ayni origin statik app shell dosyalarini cache'liyor.
- Finance transaction/account okumalari client tarafinda `user_id` ile filtreleniyor.
- Transaction kaydinin baska kullanici hesabina baglanmasini engelleyen SQL hardening dosyasi eklendi.

### Bilincli kapsam disi

- Otomatik bakiye motoru Sprint 2A.3 kapsamına bırakıldı.
- Transfer muhasebe etkisi Sprint 2A.3 kapsamına bırakıldı.

### Guncellenen dosyalar

```text
app.js
style.css
sw.js
README.md
VERSION.md
CHANGELOG.md
RELEASE_NOTES.md
BACKLOG.md
scripts/verify-finance-module.mjs
sql/finance_transaction_account_guard.sql
```

### Testler

```text
node scripts/verify-finance-module.mjs
node scripts/verify-finance-accounts.mjs
node --check app.js
node --check sw.js
```

### Onerilen commit mesaji

```text
feat: add Finance Transactions UI
```

---

## Sprint 2A.1 — Finance Accounts UI

Bu sprint Finance fazinin ilk kullanici arayuzu adimidir. Amac, kullanicinin Finans menusune girip hesaplarini tanimlamaya baslamasidir.

### Ozet

- Sol menuye `Finans` eklendi.
- Finance ana ekraninda KPI kartlari olusturuldu.
- `finance_accounts` tablosundan hesaplar yukleniyor.
- Hesap ekleme / duzenleme formu eklendi.
- Hesap pasife alma ve tekrar aktif etme eklendi.
- Mobil uyumlu Finance hesap kartlari eklendi.
- Service worker cache anahtari guncellendi.
- Basit dogrulama scripti eklendi: `scripts/verify-finance-accounts.mjs`

### Guncellenen dosyalar

```text
index.html
app.js
style.css
sw.js
README.md
VERSION.md
CHANGELOG.md
RELEASE_NOTES.md
BACKLOG.md
scripts/verify-finance-accounts.mjs
```

### Testler

```text
node scripts/verify-finance-accounts.mjs
node --check app.js
```

### Onerilen commit mesaji

```text
feat: add Finance Accounts UI
```

---

## Sprint 2A.0 — CTO Handover & Roadmap Lock

Bu sprint uygulama davranisini degistirmez. Amac, ChatGPT konusmasinda olusan CTO kararlarini repo icinde kalici dokumanlara donusturmek ve Finance fazini resmi olarak baslatmaktir.

### Ozet

- CTO devir dokumani eklendi.
- Aktif roadmap repo icine alindi.
- Backlog olusturuldu.
- Finance Phase 2 plan dokumani olusturuldu.
- README, VERSION, CHANGELOG ve RELEASE_NOTES guncellendi.

### Eklenen dosyalar

```text
ROADMAP.md
BACKLOG.md
docs/CTO_HANDOVER.md
docs/FINANCE_PHASE_2_PLAN.md
```

### Guncellenen dosyalar

```text
README.md
VERSION.md
CHANGELOG.md
RELEASE_NOTES.md
```

### Sonraki sprint

```text
Sprint 2A.1 — Finance Accounts UI
```

### Onerilen commit mesaji

```text
chore: lock roadmap for Finance phase
```

---

## Momentum Hub V6.0 Stable

Bu surum Faz 1 icin stabilizasyon surumudur.

### One Cikanlar

- Takvim sadelestirildi ve sadece aylik finans gorunumu birakildi.
- Ileri/geri ay secimi ve dogrudan ay secici eklendi.
- Secilen aya gore finans ozeti gosteriliyor.
- PWA cache surumu guncellendi.

### Test Kontrol Listesi

- [ ] Uygulama aciliyor.
- [ ] Bugun ekrani calisiyor.
- [ ] Takvim ekraninda Hafta/Gun butonlari gorunmuyor.
- [ ] Ay secici calisiyor.
- [ ] Onceki/sonraki ay butonlari calisiyor.
- [ ] Secilen ayin gelir/gider bilgileri dogru gorunuyor.
- [ ] Mobil gorunumde takvim tasmiyor.
- [ ] Raporlar, Belgeler, Varliklar ekranlari aciliyor.
