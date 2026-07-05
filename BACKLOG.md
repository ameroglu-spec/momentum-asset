# Momentum Hub Backlog

Bu backlog CTO tarafindan yonetilir. Yeni isler once burada siniflandirilir, sonra sprint kapsaminda ele alinir.

---

## Aktif Sprint

### Sprint 2A.0 — CTO Handover & Roadmap Lock

**Durum:** In progress

- [x] Roadmap kararlarini repo icine alma
- [x] Finance fazini aktif faz olarak kilitleme
- [x] CTO handover dokumani olusturma
- [x] Finance faz planini olusturma
- [x] README / VERSION / CHANGELOG / RELEASE_NOTES guncelleme
- [x] Degisiklikleri dogrulama
- [ ] Commit / push kullanici tarafindan yapilacaksa commit mesaji ile teslim

---

## Sıradaki Sprint

### Sprint 2A.1 — Finance Accounts UI

**Hedef:** Kullanici Finans ekraninda hesaplarini tanimlayabilsin ve toplam durumunu gorebilsin.

#### Kapsam

- [ ] Sol menuye `Finans` ekle
- [ ] `currentPage` icine finance sayfasi ekle
- [ ] `state.financeAccounts` state alanini ekle
- [ ] `finance_accounts` tablosundan verileri yukle
- [ ] Finance ana ekran shell'i olustur
- [ ] Hesap kartlari tasarimi
- [ ] Hesap ekleme formu
- [ ] Hesap duzenleme formu
- [ ] Hesap pasife alma
- [ ] Toplam nakit, toplam borc, net bakiye KPI kartlari
- [ ] Mobil gorunum kontrolu
- [ ] RLS davranisini dogrula

#### Kabul kriterleri

- Kullanici Finans menüsunu gorur.
- Hesap ekler, duzenler ve pasife alir.
- Hesaplar kullanici bazli izole olur.
- Toplam kartlar dogru hesaplanir.
- Mevcut Asset fonksiyonlari bozulmaz.

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

- [ ] Finance Accounts UI
- [ ] Finance Transactions UI
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
- [ ] AI Copilot veri gereksinimleri dokumani
