# CTO Handover — Momentum Hub

## Devir tarihi

Sprint 2A.0 itibariyla CTO gorevi Hermes tarafina devredildi.

## Urun vizyonu

**Know Today. Plan Tomorrow.**

Momentum Hub'in amaci sadece finans, varlik veya is takip uygulamasi olmak degildir. Uzun vadeli hedef; kullanicinin varlik, finans, is, saglik, bilgi, takvim, belge ve otomasyon ihtiyaclarini tek merkezde toplayan dijital kontrol merkezi olmaktir.

## Mevcut urun durumu

### Faz 1 — Asset Foundation

Durum: Tamamlandi.

Mevcut calisan moduller:

- Bugun
- Momentum AI temel kartlari
- Gayrimenkuller
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
- Supabase entegrasyonu

### Faz 2 — Finance

Durum: Basladi.

Tamamlanan ilk adim:

- Finance database foundation
- Finance indexes
- Finance RLS policies
- Finance storage bucket setup
- Finance database ER diagram
- Finance docs

Referans commit:

```text
3d61af0 feat: Finance database architecture
```

## CTO prensipleri

1. Once deger, sonra teknoloji.
2. Her sprint kucuk, test edilebilir ve geri alinabilir olacak.
3. Kullanici onayi olmadan buyuk kapsam degisikligi yapilmayacak.
4. `main` branch her zaman calisir kalacak.
5. Public repo icinde service-role key, ozel veri veya gercek finans verisi bulunmayacak.
6. Finance modulu muhasebe programi gibi degil, karar destek kokpiti gibi tasarlanacak.
7. Her faz sonunda stable surum hedeflenecek.
8. Her sprint sonunda degisiklik ozeti, test sonucu ve commit mesaji verilecek.

## Aktif teknik mimari

- Frontend: statik HTML/CSS/JavaScript
- Backend: Supabase Auth, Database, Storage
- Deployment: GitHub -> Netlify
- PWA: service worker + manifest

## Teknik borclar

### Yuksek oncelik

- Service worker tum fetch cevaplarini cache'lemeye calisiyor; Supabase/storage istekleri haric tutulmali.
- V6/V7 metadata uyumsuzlugu var; Finance DB geldi ama UI title/manifest hala V6 odakli.
- Finance seed duplicate riskine sahip; unique constraint veya idempotent seed gerekli.

### Orta oncelik

- `app.js` tek buyuk dosya ve ayni fonksiyonlar birden fazla kez override ediliyor.
- Inline `onclick` kullanimi uzun vadede XSS ve bakim riski doguruyor.
- Finance foreign key iliskilerinde tenant butunlugu DB seviyesinde daha guclu hale getirilmeli.

### Dusuk oncelik

- GitHub Actions / kalite kapisi yok.
- Basit test altyapisi yok.
- README ve developer dokumantasyonu sinirli.

## Hemen sonraki CTO onerisi

Sprint 2A.1 — Finance Accounts UI

Bu sprintte Finance menusu ve hesap yonetimi baslatilacak. Amac, kullanicinin finansal hesaplarini Momentum Hub icine girmeye baslamasidir.

## Versiyonlama yaklasimi

- V6.x: Faz 1 / Asset stable ailesi
- V7.x: Faz 2 / Finance stable ailesi
- V8+ sonraki fazlar icin ayrilacak

## Commit mesaji standardi

Ornekler:

```text
chore: lock roadmap for Finance phase
feat: add finance accounts UI
fix: prevent Supabase responses from service worker cache
```

## Devir sonucu

CTO devri kabul edildi. Bundan sonra roadmap, backlog ve sprint planlari repo icinde yasayacak.
