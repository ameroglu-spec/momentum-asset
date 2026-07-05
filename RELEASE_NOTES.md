# Momentum Hub Release Notes

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
