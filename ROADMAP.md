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

**Durum:** Tamamlandi

- ROADMAP.md olusturuldu
- BACKLOG.md olusturuldu
- CTO handover dokumani olusturuldu
- Finance faz plani repo icine alindi
- README / VERSION / CHANGELOG / RELEASE_NOTES faz durumuyla uyumlu hale getirildi

#### Sprint 2A.1 — Finance Accounts UI

**Durum:** Tamamlandi

- Sol menuye Finans eklendi
- Finans ana ekran shell'i olusturuldu
- finance_accounts listesi yuklendi
- Hesap ekleme / duzenleme / pasife alma eklendi
- Nakit, banka, kredi karti, doviz, altin, kripto, yatirim hesap tipleri desteklendi
- Toplam nakit, toplam borc, net hesap ozeti eklendi

#### Sprint 2A.2 — Finance Transactions UI

**Durum:** Tamamlandi

- Gelir / gider kaydi eklendi
- Hesap ve kategori baglantisi eklendi
- Tarih, durum, not ve odeme yontemi alanlari eklendi
- Hareket listesi ve filtreleme eklendi

#### Sprint 2A.3 — Balance Engine + Transfers

**Durum:** Tamamlandi

- Transaction sonrasi hesaplanan bakiye motoru eklendi
- Transferlerde iki hesap etkisi eklendi
- Kredi karti / borc hesaplarinda is_asset=false davranisi netlestirildi
- Basit tutarlilik kontrolleri eklendi

#### Sprint 2A.4 — Finance Polish & Reconciliation

**Durum:** Tamamlandi

- Hesaplanan / manuel bakiye farki gosterildi
- Manuel bakiyeyi hesaplanan bakiyeye esitle aksiyonu eklendi
- Transfer varsayilanlari ve para birimi guard'lari iyilestirildi

#### Sprint 2A.5 — Today Dashboard Finance Cards

**Durum:** Tamamlandi

- Bugun dashboard altina Finance ozet kartlari eklendi
- Varlik, borc, net durum, gelir/gider/net akis kartlari gosterildi

#### Sprint 2B.0 — Budget Foundation

**Durum:** Tamamlandi

- `finance_budgets` temeli eklendi
- Aylik kategori butcesi eklendi
- Gerceklesen / kalan / kullanim orani hesaplari eklendi
- Limit asimi sinyalleri eklendi

#### Sprint 2C.0 — Financing / Loan Tracking Foundation

**Durum:** Production test edildi ve onaylandi

- Banka kredisi ve katilim finansmani kaydi eklendi
- Katilimevim / Fuzulevim / Birevim benzeri finansmanlar desteklendi
- Komisyon / organizasyon ucreti takibi eklendi
- Toplam vade, aylik odeme, odenen/kalan ay hesaplari eklendi
- Odenen toplam, kalan toplam ve ilerleme yuzdesi eklendi

#### Sprint 2C.1 — Financing Installment Schedule

**Durum:** Production test edildi ve onaylandi

- Ay ay taksit plani eklendi
- Odendi / gecikti / bekliyor / kismi / iptal durumlari eklendi
- Taksit plani kartlari ve otomatik plan olusturma eklendi
- Finansman ozetleri taksit kayitlarindan guncellenir hale getirildi

#### Sprint 2D — Finance Dashboard

**Durum:** Production test edildi ve onaylandi

- Finansal durum dashboard'u eklendi
- Toplam varlik, toplam borc, net durum kartlari eklendi
- Bu ay net akis, butce kullanimi ve kalan finansman kartlari eklendi
- Yaklasan taksitler ve dikkat edilecekler alani eklendi

#### Sprint 2E — Finance Reports Foundation

**Durum:** Production test edildi ve onaylandi

- Aylik gelir/gider raporu eklendi
- Kategori bazli gider raporu eklendi
- Finansman/kredi odeme raporu eklendi
- Butce / gerceklesen raporu eklendi
- Tarih araligi filtresi ve CSV export altyapisi eklendi

#### Sprint 2F — Finance Calendar & Notifications Foundation

**Durum:** Production test edildi ve onaylandi

- Finansman/kredi taksitleri takvime baglandi
- Takvim ajandasinda finansman taksit kartlari gosterildi
- Yaklasan 7 gun odeme uyarisi eklendi
- Gecikmis finansman taksiti uyarisi eklendi
- Bildirim rozeti finance uyarilarini da sayar hale getirildi

#### Sprint 2G — Finance Stable Polish & Hardening

**Durum:** Kodlandi, production test/onay bekliyor

- V7 Finance Stable kabul kontrolu eklendi
- Service worker cache stratejisi temizlendi
- V6/V7 metadata uyumsuzluklari temizlendi
- Public repo security checklist eklendi
- Mobil UX son kontrol icin checklist hazirlandi
- Basit test/quality gate iyilestirmesi eklendi
- V7.0 Finance Stable release hazirligi yapildi

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
