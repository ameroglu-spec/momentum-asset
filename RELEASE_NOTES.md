# Momentum Hub Release Notes

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
