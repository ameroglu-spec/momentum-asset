# Momentum Hub Roadmap

> Vision: **Know Today. Plan Tomorrow.**

Bu dosya Momentum Hub icin aktif CTO roadmap'idir. Chat gecmisindeki onceki kararlar referans kabul edilir; operasyonel kaynak artik bu dosyadir.

---

## Faz 1 — Asset Foundation

**Durum:** Tamamlandi  
**Referans surum:** V6.0 Stable

### Kapsam

- Bugun ekrani
- Momentum AI temel kartlari
- Gayrimenkul ve arac varlik yonetimi
- Gelir / gider kayitlari
- Belge merkezi
- Raporlar
- Aylik takvim
- Bildirimler
- Global arama
- Tanimlar
- JSON yedek
- PWA
- Supabase Auth / Database / Storage

### CTO degerlendirmesi

Faz 1 amacina ulasti: Excel fikri calisan web/PWA urunune donustu. Faz 1 artik yeni ozellik alani degil, stabil taban olarak korunacak.

---

## Faz 2 — Finance

**Durum:** Aktif faz  
**Hedef surum:** Momentum Hub V7.0 — Finance Stable

### Ilke

> Muhasebe degil, karar destek sistemi.

Finance modulu kullaniciyi veri girmeye zorlayan bir muhasebe programi olmayacak. Temel hedef, kullanicinin 5 saniye icinde finansal durumunu anlamasidir.

### Cevaplanacak sorular

- Su an ne kadar nakdim var?
- Borcum ne kadar?
- Net servetim ne durumda?
- Bu ay butceme gore iyi miyim, kotu muyum?
- Yaklasan odeme, tahsilat, kredi veya kart ekstresi var mi?
- Hedeflerime yaklasiyor muyum?

### Sprintler

#### Sprint 2A.0 — CTO Handover & Roadmap Lock

**Durum:** Bu sprint

- ROADMAP.md olustur
- BACKLOG.md olustur
- CTO handover dokumani olustur
- Finance faz planini repo icine al
- README / VERSION / CHANGELOG / RELEASE_NOTES dosyalarini faz durumuyla uyumlu hale getir

#### Sprint 2A.1 — Finance Accounts UI

- Sol menuye Finans ekle
- Finans ana ekran shell'i olustur
- finance_accounts listesini cek
- Hesap ekleme / duzenleme / pasife alma
- Nakit, banka, kredi karti, doviz, altin, kripto, yatirim hesap tipleri
- Toplam nakit, toplam borc, net hesap ozeti

#### Sprint 2A.2 — Finance Transactions UI

- Gelir / gider / transfer kaydi
- Hesap ve kategori baglantisi
- Tarih, vade, durum, not, etiket
- Hareket listesi ve filtreleme

#### Sprint 2A.3 — Account Balance Logic

- Transaction sonrasi hesap bakiyesi mantigi
- Transferlerde iki hesap etkisi
- Kredi karti / borc hesaplarinda is_asset=false davranisi
- Basit tutarlilik kontrolleri

#### Sprint 2B — Budget

- Budget database patch
- Aylik butce
- Kategori butcesi
- Gerceklesen / kalan
- Limit asimi sinyalleri

#### Sprint 2C — Finance Dashboard

- Finansal Durum ana ekrani
- Toplam nakit
- Toplam varlik
- Toplam borc
- Net servet
- Bu ay gelir / gider / tasarruf
- Yaklasan finansal yukumlulukler

#### Sprint 2D — Investments

- Altin, doviz, fon, hisse, BES, kripto hazirligi
- Portfoy dagilimi
- Maliyet / guncel deger alanlari

#### Sprint 2E — Loans & Financings

- Konut, arac, ihtiyac kredisi
- Katilim Evim / Fuzul Ev / Eminevim benzeri finansmanlar
- Taksit plani
- Kalan borc
- Odeme takibi

#### Sprint 2F — Finance Reports

- Aylik gider trendi
- Kategori dagilimi
- Nakit akisi
- Net servet zaman cizgisi
- Portfoy dagilimi

#### Sprint 2G — Calendar & Notifications

- Kart ekstresi
- Kredi taksiti
- Otomatik odeme
- Geciken finans kayitlari
- Limit asimi / hedef sapmasi bildirimleri

### Faz 2 stable kabul kriterleri

- Finans ekranlari mobil ve masaustu calisir.
- Her kullanici sadece kendi finans verisini gorur.
- RLS aktif ve test edilmis olur.
- Hesap, hareket, butce ve finans dashboard birlikte calisir.
- Net servet ve nakit akisi dogru hesaplanir.
- Takvim ve bildirimler finans kayitlarini kapsar.
- Public repo icinde service-role key veya kisisel veri bulunmaz.

---

## Faz 3 — Work

- CRM
- Musteri ziyaretleri
- Servis yonetimi
- Teklif takibi
- Satis firsatlari
- Gorevler

---

## Faz 4 — Health

- Kilo
- Spor
- Beslenme
- Uyku
- Su takibi
- Kan degerleri

---

## Faz 5 — Knowledge Hub

- Notlar
- PDF arsivi
- Video notlari
- Proje notlari
- Fikirler
- Ogrenilen bilgiler

---

## Faz 6 — Calendar 360

Tek takvim:

- Asset
- Finance
- Work
- Health
- Personal

---

## Faz 7 — AI Copilot

AI, yeterli veri olustuktan sonra zeka katmani olarak eklenecek.

Ornek hedef:

> Bu ay arac giderlerin artti. Sebep bakim masrafi. Sonraki bakim 4 ay sonra. Takvime ekleyeyim mi?

---

## Faz 8 — Communication Hub

- Gmail
- Outlook
- WhatsApp
- Telegram

---

## Faz 9 — Automation

- Otomatik hatirlatmalar
- Akilli is akisleri
- Belge / teklif / takvim otomasyonlari

---

## Faz 10 — Mobile Experience

- iOS / Android widget
- Apple Watch
- Kilit ekrani
- Live Activities

---

## Faz 11 — Collaboration

- Aile
- Sirket
- Muhasebeci
- Yetki yonetimi

---

## Faz 12 — Analytics

- KPI dashboard
- Risk skoru
- Trend analizi
- Tahminler

---

## Faz 13 — Marketplace

- Banka eklentileri
- Muhasebe entegrasyonlari
- e-Devlet
- Gelir Idaresi
- Tapu

---

## Faz 14 — Momentum OS

Uzun vadeli hedef: Asset, Finance, Work, Health, Knowledge, Calendar, Documents, AI ve Automation modullerinin tek merkezde calistigi dijital yasam isletim sistemi.
