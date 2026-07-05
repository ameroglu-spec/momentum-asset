# Momentum Hub Finance Module

## Amaç
Finance modülü, Momentum Hub içinde kişisel finansı muhasebe mantığıyla değil, karar destek sistemi mantığıyla yönetmek için tasarlanmıştır.

## Ana Kavramlar

### Accounts
Kullanıcının finansal hesaplarıdır.

Desteklenen ilk hesap tipleri:
- Nakit
- Banka
- Kredi Kartı
- Döviz
- Altın
- Kripto hazırlığı
- Yatırım hesabı

### Transactions
Tüm gelir, gider ve finansal hareketlerin kaydıdır.

İlk işlem tipleri:
- Gelir
- Gider
- Transfer giriş
- Transfer çıkış
- Yatırım alış/satış
- Finansman ödemesi

### Financings
Kredi ve tasarruf finansmanı benzeri yükümlülükleri yönetir.

Desteklenen tipler:
- Konut Kredisi
- Taşıt Kredisi
- İhtiyaç Kredisi
- Katılım Evim
- Fuzul Ev
- Eminevim
- Diğer

### Goals
Finansal hedeflerdir.

Örnek:
- Ev peşinatı
- Araç
- Tatil
- Acil durum fonu
- Eğitim

### Categories
Gelir/gider ve diğer finansal hareketlerin sınıflandırılması için kullanılır.

### Monthly Summary
Dashboard performansı için aylık özet değerleri tutar.

## Net Servet Mantığı

Net servet şu mantıkla hesaplanır:

```text
Toplam Varlıklar - Toplam Yükümlülükler = Net Servet
```

Bu nedenle `finance_accounts` tablosunda `is_asset` alanı vardır.

Örnek:

| Hesap | is_asset |
|---|---|
| Nakit | true |
| Banka | true |
| Altın | true |
| Kredi Kartı | false |
| Finansman | false |

## RLS
Tüm finance tablolarında Row Level Security aktiftir. Her kullanıcı yalnızca kendi kayıtlarını görebilir.

## Kurulum

1. Supabase SQL Editor açılır.
2. Önce `finance_schema.sql` çalıştırılır.
3. Sonra `finance_seed.sql` çalıştırılır.

> Not: Supabase SQL Editor içinde `auth.uid()` null dönerse seed dosyasında `auth.uid()` yerine kendi kullanıcı UUID'nizi yazmanız gerekir.

## Sonraki Sprint
Sprint 1B ile Finance UI geliştirilecektir.
