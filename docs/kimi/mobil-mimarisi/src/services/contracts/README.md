# Contracts Servisi

## Amaç
Dinamik sözleşme oluşturma, PDF üretimi, e-imza/biyometrik onay, Anayasa 400 madde doğrulama ve sözleşme JSON log yönetimi. Satılık, kiralama, KKA ve devren kiralama sözleşme tiplerini destekler.

## İlgili Fasıl
- Fasıl 10 — Scroll-to-End Sözleşme, Consent JSON, Offline Salt-Okunur

## Dosya Yapısı

```
contracts/
├── README.md
├── index.ts
├── ContractGenerator.ts     # Parametre → sözleşme metni + PDF
├── ContractValidator.ts     # 400 madde doğrulama (kritik 16 madde)
├── SignatureManager.ts      # e-İmza / SMS onay / biyometrik imza
├── ConsentLogger.ts         # Scroll + onay hash + IP + cihaz log
├── ContractRenderer.tsx     # Sözleşme görüntüleme (ScrollView + PDF)
├── OfflineContractCache.ts  # İmzalanmış sözleşmelerin offline saklanması
├── templates/
│   ├── satilikTemplate.ts
│   ├── kiralamaTemplate.ts
│   ├── kkaTemplate.ts
│   └── devrenTemplate.ts
└── types.ts
```

## Sözleşme Türleri

| Tür | Kullanım | Dinamik Alanlar |
|-----|----------|-----------------|
| Satılık | Hemen Al / İhale sonrası | Fiyat, tapu bilgisi, taraflar, komisyon oranı |
| Kiralama | Kiralık ilan | Kira bedeli, depozito, süre, fesih koşulları |
| KKA | Kat karşılığı arsa | Hisse oranı, hak ediş takvimi, proje süresi |
| Devren | Devren kiralık | Devir bedeli, mevcut kira şartları, eşya listesi |

## Scroll-to-End Onay Akışı

```
[Sözleşme PDF/ScrollView açılır]
         |
         v
[Kullanıcı en alta kaydırır (scrollEventThrottle: 16ms)]
         |
         v
[Scroll pozisyonu %100 olduğunda hash oluşturulur]
         |
         v
["Onaylıyorum" butonu aktif olur]
         |
         v
[Butona basılır → ConsentLogger kaydet]
         |
         v
[Imza tipi seçilir (SMS / Biyometrik)]
         |
         v
[POST /api/v2/contracts/sign]
         |
         v
[Sözleşme imzalanmış PDF olarak indirilebilir]
```

## Anayasa 400 Madde Doğrulama (Kritik 16)

```typescript
const CRITICAL_RULES = [
  { id: 'K-042',  check: (ctx) => ctx.deposit >= ctx.price * 0.01,           message: 'Bloke minimum %1 olmalı' },
  { id: 'K-063',  check: (ctx) => ctx.hasBuildingPermit || ctx.category !== 'daire', message: 'Yapı ruhsatı zorunlu' },
  { id: 'K-089',  check: (ctx) => ctx.sellerId !== ctx.buyerId,            message: 'Alıcı ve satıcı aynı olamaz' },
  { id: 'K-101',  check: (ctx) => ctx.price > 0,                            message: 'Fiyat pozitif olmalı' },
  { id: 'K-128',  check: (ctx) => ctx.contractVersion === '2.1.0',           message: 'Güncel sözleşme versiyonu kullanılmalı' },
  { id: 'K-156',  check: (ctx) => ctx.kvkkConsentHash.length === 64,        message: 'KVKK onayı geçersiz' },
  { id: 'K-201',  check: (ctx) => !ctx.isBannedUser,                         message: 'Yasaklı kullanıcı işlem yapamaz' },
  { id: 'K-223',  check: (ctx) => ctx.isAuction ? ctx.bidCount > 0 : true,   message: 'İhalede en az 1 teklif olmalı' },
  { id: 'K-267',  check: (ctx) => ctx.mortgageAmount === 0 || ctx.hasBankApproval, message: 'İpotekli tapu banka onayı gerekir' },
  { id: 'K-298',  check: (ctx) => ctx.isAdult,                               message: 'Reşit olma şartı' },
  { id: 'K-312',  check: (ctx) => ctx.tcKimlikNo.length === 11,              message: 'TC Kimlik No 11 hane' },
  { id: 'K-334',  check: (ctx) => ctx.taxNumber || ctx.accountType === 'bireysel', message: 'Vergi numarası gerekli' },
  { id: 'K-356',  check: (ctx) => ctx.commissionAgreementSigned,            message: 'Komisyon sözleşmesi imzalanmalı' },
  { id: 'K-378',  check: (ctx) => ctx.isWithinBusinessHours,                message: 'İş saatleri dışında sözleşme imzalanamaz' },
  { id: 'K-389',  check: (ctx) => ctx.hasPowerOfAttorney || ctx.isOwner,     message: 'Vekaletname veya malik olma şartı' },
  { id: 'K-400',  check: (ctx) => ctx.escrowAccountVerified,                 message: 'Emanet hesabı doğrulanmalı' },
];
```

## Kritik Kurallar

1. **Scroll Hash:** Kullanıcı sözleşmeyi en alta kaydırdığında scroll pozisyonundan SHA256 hash oluşturulur. Bu hash `POST /api/v2/contracts/sign` içinde `consentLog.scrollEndHash` olarak gönderilir.
2. **Offline Salt-Okunur:** İmzalanmış sözleşmeler `OfflineContractCache`'te (WatermelonDB) saklanır. Kullanıcı offlineken imzalı sözleşmelerini görüntüleyebilir ancak yeni imza atayamaz.
3. **e-İmza vs SMS Onay:** Varsayılan imza SMS onay kodudur. Nitelikli e-İmza isteğe bağlıdır ve ek maliyet gerektirir.
4. **Sözleşme Versiyonu:** Her sözleşme tipinin versiyonu vardır. Backend `/api/v2/contracts/{listingId}` endpoint'inden güncel versiyon ve checksum alınır.

## API Endpoint'leri
- `GET /api/v2/contracts/{listingId}` — Mevcut sözleşme şablonları
- `POST /api/v2/contracts/sign` — İmzalama
- `POST /api/v2/contracts/validate` — 400 madde doğrulama

## Bağımlılıklar
- `core/security` — Biyometrik imza + cihaz log
- `features/buy_it_now` — Hemen Al sonrası otomatik sözleşme
- `features/kat_karsiligi` — KKA sözleşme template

## Test Senaryoları
1. Satılık sözleşme → scroll-to-end → SMS onay → imza başarılı
2. Kritik kural ihlali (bloke < %1) → 400 validator hata verir, imza engellenir
3. Offline → imzalı sözleşme listesi görüntülenir, yeni imza butonu disabled
4. Sözleşme versiyonu değişirse → "Yeni versiyon mevcut, tekrar onaylayın"
