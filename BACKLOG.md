# Momentum Hub Backlog

Bu backlog CTO tarafindan yonetilir. Yeni isler once burada siniflandirilir, sonra sprint kapsaminda ele alinir.

---

## Tamamlanan Sprintler

### Sprint 2A.0 — CTO Handover & Roadmap Lock

**Durum:** Completed

- [x] Roadmap kararlarini repo icine alma
- [x] Finance fazini aktif faz olarak kilitleme
- [x] CTO handover dokumani olusturma
- [x] Finance faz planini olusturma
- [x] README / VERSION / CHANGELOG / RELEASE_NOTES guncelleme
- [x] Degisiklikleri dogrulama
- [x] Commit / push kullanici tarafindan yapildi

### Sprint 2A.1 — Finance Accounts UI

**Durum:** Completed

- [x] Sol menuye `Finans` ekle
- [x] `currentPage` icine finance sayfasi ekle
- [x] `state.financeAccounts` state alanini ekle
- [x] `finance_accounts` tablosundan verileri yukle
- [x] Finance ana ekran shell'i olustur
- [x] Hesap kartlari tasarimi
- [x] Hesap ekleme formu
- [x] Hesap duzenleme formu
- [x] Hesap pasife alma
- [x] Toplam nakit, toplam borc, net bakiye KPI kartlari
- [x] Mobil gorunum kontrolu
- [x] RLS davranisini dogrula

---

## Aktif Sprint

### Sprint 2A.2 — Finance Transactions UI

**Hedef:** Kullanici finans hesaplarina gelir/gider hareketleri ekleyebilsin, listeleyebilsin, duzenleyebilsin ve silebilsin.

#### Kapsam

- [x] `state.financeTransactions` alanini ekle
- [x] `finance_transactions` tablosundan verileri yukle
- [x] Gelir/gider hareket formu ekle
- [x] Hareket listeleme ve filtreleme ekle
- [x] Bu ay gelir/gider/net akış ozeti ekle
- [x] Hareket duzenleme ve silme ekle
- [x] Client-side `user_id` filtrelerini kullan
- [x] Service worker cache 2A.2'ye guncelle
- [x] Finance module verify scripti ekle
- [x] Service worker cache'ini sadece statik app shell ile sinirla
- [x] Transaction-account sahiplik guard SQL dosyasini ekle

#### Kapsam disi

- Otomatik bakiye motoru Sprint 2A.3'e kaldi
- Transfer muhasebe etkisi Sprint 2A.3'e kaldi

---

## Finance Faz Backlog

### Database / Architecture

- [ ] `finance_categories` icin `unique(user_id, type, name)` constraint ekle
- [ ] `finance_seed.sql` dosyasini tekrar calistirilabilir hale getir
- [ ] Budget tablolari tasarla: `finance_budgets`, `finance_budget_items`
- [ ] Installment tablosu tasarla: `finance_financing_installments`
- [ ] Recurring transaction yapisi tasarla
- [ ] Foreign key tenant butunlugunu guclendir
- [ ] Finance storage ile mevcut document merkezi arasindaki iliskiyi netlestir

### UI / Product

- [x] Finance Accounts UI
- [x] Finance Transactions UI
- [ ] Transfers UI
- [ ] Budget UI
- [ ] Finance Dashboard
- [ ] Finance Reports
- [ ] Finance Calendar integration
- [ ] Finance Notifications

### Quality / Technical Debt

- [ ] Service worker cache stratejisini duzelt
- [ ] V6/V7 version metadata uyumsuzlugunu tamamen temizle
- [ ] `app.js` modullere bolme planini hazirla
- [ ] Inline `onclick` kullanimlarini azaltma stratejisi belirle
- [ ] Basit test/quality gate ekle
- [ ] Public repo security checklist ekle

---

## Faz 1 Stabilizasyon Backlog

- [ ] Asset delete davranisi: iliskili kayitlar ne olacak netlestir
- [ ] Belgeler icin dosya boyutu ve mime kontrolu UI'da goster
- [ ] Raporlarda tarih araligi filtresi
- [ ] Global aramada daha temiz bos durum
- [ ] Mobil menü deneyimi iyilestirme

---

## Daha Sonra

- [ ] Work modulu plan dokumani
- [ ] Health modulu plan dokumani
- [ ] Knowledge Hub plan dokumani
- [ ] Calendar 360 plan dokumani
