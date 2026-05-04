# İhaleAL API Sözleşmesi (API Contract)

**Versiyon:** 2.0.0  
**Format:** OpenAPI 3.1 (Pseudo-Code Reference)  
**Son Güncelleme:** 2026-05-04  
**Hedef Client:** iOS / Android / Web (React Native + Web)

---

## Kimlik Doğrulama & Güvenlik

### POST /api/v2/auth/register
**Amaç:** Yeni kullanıcı kaydı (Misafir → Üye yükseltme dahil)

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "phone": "string (required, E.164 +905xxxxxxxxx)",
  "password": "string (required, min 8, upper+lower+number)",
  "fullName": "string (required)",
  "tcKimlikNo": "string (11 hane, SHA256 hashlenmiş)",
  "deviceFingerprint": "string (required - cihaz ID + model + OS)",
  "accountType": "enum ['bireysel', 'emlakci', 'isyeri']",
  "guestSessionId": "string (optional - misafir mod yükseltme)",
  "consentHashes": {
    "kvkk": "sha256_hex (required)",
    "membership": "sha256_hex (required)",
    "auctionRules": "sha256_hex (required)"
  }
}
```

**Response 201:**
```json
{
  "userId": "uuid",
  "accessToken": "jwt_token_15dk",
  "refreshToken": "jwt_token_30gun",
  "requiresBiometricSetup": "boolean",
  "requiresEmailVerification": "boolean"
}
```

**Error Kodları:**
- `400` — Eksik alan / geçersiz format
- `409` — E-posta veya telefon zaten kayıtlı
- `403` — Yasaklı cihaz (root/jailbreak tespit edildi)
- `429` — Rate limit (5 deneme / 1 saat)

---

### POST /api/v2/auth/login
**Amaç:** Giriş (standart + biyometrik fallback)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "deviceFingerprint": "string",
  "biometricToken": "string (optional - FaceID/TouchID token)",
  "otpCode": "string (optional - 2FA aktifse)"
}
```

**Response 200:**
```json
{
  "userId": "uuid",
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "accountType": "emlakci | bireysel",
  "kycStatus": "verified | pending | rejected",
  "pendingActions": ["email_verify", "kyc_upload", "contract_sign"]
}
```

---

### POST /api/v2/auth/guest
**Amaç:** Misafir oturumu başlat (Fasıl 1 — Store Review zorunluluğu)

**Request Body:**
```json
{
  "deviceFingerprint": "string",
  "appVersion": "string",
  "osVersion": "string"
}
```

**Response 201:**
```json
{
  "guestSessionId": "uuid",
  "accessToken": "jwt_guest_24saat",
  "browseLimit": 20,
  "remainingBrowseCount": 20,
  "upgradePrompts": ["save_favorite", "contact_listing", "create_listing"]
}
```

**Kısıtlamalar:** Misafir kullanıcı teklif veremez, sadece 20 ilan detayı görüntüleyebilir, favori ekleyemez.

---

### POST /api/v2/auth/refresh
**Amaç:** Token yenileme

**Request Body:**
```json
{ "refreshToken": "string" }
```

**Response 200:**
```json
{
  "accessToken": "jwt_yeni",
  "refreshToken": "jwt_yeni",
  "expiresIn": 900
}
```

---

### POST /api/v2/auth/logout
**Amaç:** Çıkış yap + cihaz bağını kaldır

**Headers:** `Authorization: Bearer {accessToken}`

**Response 204:** No Content

---

## Cihaz & Güvenlik

### POST /api/v2/security/device-bind
**Amaç:** Cihazı kullanıcıya bağla (Fasıl 2)

**Request Body:**
```json
{
  "deviceFingerprint": "string",
  "publicKey": "string (RSA public key for secure comms)",
  "isEmulator": "boolean",
  "isRooted": "boolean",
  "isJailbroken": "boolean",
  "appAttestationToken": "string (iOS DeviceCheck / Android SafetyNet)"
}
```

**Response 200:**
```json
{
  "bindingId": "uuid",
  "status": "active | flagged | blocked",
  "requires2FA": "boolean",
  "maxDevicesReached": "boolean (max 3 cihaz)"
}
```

---

### POST /api/v2/security/verify-biometric
**Amaç:** Biyometrik doğrulama sonucunu sunucuya bildir

**Request Body:**
```json
{
  "biometricType": "faceid | touchid | fingerprint | iris",
  "challengeSignature": "string (sunucu challenge'ına imza)",
  "success": "boolean",
  "failureReason": "string (optional)"
}
```

**Response 200:** `{ "verified": true, "newAuthToken": "jwt" }`

---

### GET /api/v2/security/challenge
**Amaç:** Biyometrik doğrulama için sunucu challenge'ı al

**Response 200:** `{ "challengeId": "uuid", "challengeData": "base64", "expiresAt": "ISO8601" }`

---

## İlanlar & Arama

### GET /api/v2/listings
**Amaç:** İlan listesi (arama + filtreleme)

**Query Params:**
- `page` (int, default: 1)
- `limit` (int, default: 20, max: 50)
- `type` (enum: satilik | kiralik | kat-karsiligi | gunluk-kiralik)
- `category` (enum: daire | villa | arsa | dukkan | mustakil | rezidans)
- `minPrice` / `maxPrice` (decimal)
- `currency` (TRY | USD | EUR, default: TRY)
- `city` / `district` / `neighborhood` (string)
- `minM2` / `maxM2` (decimal)
- `odaSayisi` (1+1, 2+1, 3+1, 4+1, 5+)
- `binaYasi` (0-5, 6-10, 11-20, 20+)
- `isAuction` (boolean — sadece ihaledekiler)
- `sort` (price_asc | price_desc | date_desc | ai_score_desc)
- `aiMinScore` (number 0-100, AI skor filtreleme)

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "type": "satilik",
      "category": "daire",
      "price": 4500000,
      "currency": "TRY",
      "priceFormatted": "4.500.000 ₺",
      "m2": 145,
      "odaSayisi": "3+1",
      "city": "İstanbul",
      "district": "Kadıköy",
      "neighborhood": "Moda",
      "thumbnailUrl": "string",
      "imageCount": 12,
      "aiScore": 87,
      "aiTags": ["yuksek_getiri", "metroye_yakin", "okul bolgesi"],
      "isAuction": true,
      "auctionStatus": "active | upcoming | ended",
      "currentBid": 4200000,
      "bidCount": 24,
      "deadline": "ISO8601",
      "viewCount": 342,
      "isFavorite": false,
      "listedAt": "ISO8601",
      "sellerType": "bireysel | emlakci"
    }
  ],
  "meta": {
    "total": 1284,
    "page": 1,
    "limit": 20,
    "hasNext": true
  }
}
```

---

### GET /api/v2/listings/{id}
**Amaç:** İlan detayı

**Response 200:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "type": "satilik",
  "category": "daire",
  "price": 4500000,
  "currency": "TRY",
  "m2": 145,
  "netM2": 130,
  "odaSayisi": "3+1",
  "binaYasi": 8,
  "kat": 5,
  "toplamKat": 12,
  "isitma": "dogalgaz",
  "banyoSayisi": 2,
  "balkon": true,
  "esyali": false,
  "siteIci": true,
  "aidat": 850,
  "address": {
    "full": "string",
    "city": "İstanbul",
    "district": "Kadıköy",
    "neighborhood": "Moda",
    "lat": 40.9829,
    "lng": 29.0264
  },
  "images": ["url1", "url2"],
  "virtualTourUrl": "string (optional)",
  "seller": {
    "id": "uuid",
    "name": "string",
    "type": "emlakci",
    "avatar": "url",
    "phone": "+905xxxxxxxxx (masked)",
    "isVerified": true,
    "rating": 4.8,
    "reviewCount": 127
  },
  "aiAnalysis": {
    "score": 87,
    "pricePerM2": 31034,
    "marketAvgPerM2": 28500,
    "investmentRating": "yuksek",
    "rentalYield": 5.2,
    "appreciationForecast": 12.5,
    "comparables": [
      { "listingId": "uuid", "price": 4350000, "similarity": 0.94 }
    ]
  },
  "auction": {
    "isActive": true,
    "startPrice": 3800000,
    "currentPrice": 4200000,
    "minIncrement": 10000,
    "bidCount": 24,
    "participantCount": 8,
    "deadline": "ISO8601",
    "timeRemainingSeconds": 1847,
    "isExtended": false,
    "isBuyNowAvailable": true,
    "buyNowPrice": 4500000,
    "buyNowTimeLimitMinutes": 15,
    "depositRequired": 50000,
    "depositBlocked": true,
    "auctionRules": ["kural1", "kural2"]
  },
  "contracts": [
    { "type": "satilik", "url": "pdf_url", "version": "2.1.0" }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### POST /api/v2/listings/{id}/favorite
**Headers:** Authorization

**Response 200:** `{ "isFavorite": true }`

---

## İhale (Canlı Teklif)

### GET /api/v2/auctions/{id}/stream
**Amaç:** SSE bağlantısı — canlı ihale akışı (Fasıl 6)

**Headers:**
- `Authorization: Bearer {token}`
- `Accept: text/event-stream`

**SSE Events:**
```
event: bid_placed
data: {"bidId":"uuid","userId":"uuid","amount":4250000,"timestamp":"ISO8601","isAutoBid":false}

event: price_update
data: {"currentPrice":4250000,"bidCount":25,"timeRemaining":1800}

event: extension_triggered
data: {"newDeadline":"ISO8601","reason":"last_minute_bid","extendedBy":300}

event: auction_ended
data: {"winnerId":"uuid","winningBid":4300000,"totalBids":26}

event: heartbeat
data: {"serverTime":"ISO8601","latencyMs":45}
```

---

### POST /api/v2/auctions/{id}/bid
**Amaç:** Teklif ver

**Request Body:**
```json
{
  "amount": 4250000,
  "isAutoBid": false,
  "autoBidLimit": 4500000,
  "deviceFingerprint": "string",
  "consentHash": "sha256 (ihale kuralları onay hash'i)"
}
```

**Response 201:**
```json
{
  "bidId": "uuid",
  "status": "accepted | outbid | won",
  "position": 1,
  "timeRemaining": 1795,
  "requiresDeposit": true,
  "depositAmount": 50000
}
```

**Error Kodları:**
- `402` — Yetersiz bakiye / bloke tutarı
- `409` — Teklif çok düşük (min artış kuralları)
- `410` — İhale sona erdi
- `423` — Cihaz kilidi (ClientLockManager)
- `429` — Anti-snipe rate limit (5sn içinde çoklu teklif)

---

### POST /api/v2/auctions/{id}/deposit
**Amaç:** İhale iştirak bedeli (bloke) ödeme

**Request Body:**
```json
{
  "cardToken": "string",
  "amount": 50000,
  "provisionType": "auction_participation"
}
```

**Response 200:**
```json
{
  "transactionId": "uuid",
  "status": "provisioned",
  "provisionedAmount": 50000,
  "expiresAt": "ISO8601",
  "refundPolicy": "kazanamazsaniz_iade | kazandiktan_after_deduct"
}
```

---

## Hemen Al (Buy It Now)

### POST /api/v2/buy-it-now/{listingId}/lock
**Amaç:** Hemen Al kilidi oluştur (Fasıl 3 — 15dk server-sync lifecycle)

**Request Body:**
```json
{
  "clientTimestamp": "ISO8601",
  "deviceFingerprint": "string",
  "proposedPrice": 4500000
}
```

**Response 201:**
```json
{
  "lockId": "uuid",
  "status": "locked",
  "lockedPrice": 4500000,
  "serverDeadline": "ISO8601",
  "clientDeadline": "ISO8601",
  "serverTimestamp": "ISO8601",
  "timeRemainingSeconds": 900,
  "isKka": false,
  "kkaSubtype": null,
  "nextActions": ["checkout", "cancel"]
}
```

**Error Kodları:**
- `409` — Zaten başka bir kullanıcı tarafından kilitli
- `410` — Stok/içerik artık mevcut değil
- `422` — Fiyat uyuşmazlığı (client-server mismatch)

---

### GET /api/v2/buy-it-now/{lockId}/status
**Amaç:** Kilit durumu sorgula (arka plan / foreground sync)

**Response 200:**
```json
{
  "lockId": "uuid",
  "status": "locked | expired | released | converted",
  "lockedPrice": 4500000,
  "serverDeadline": "ISO8601",
  "timeRemainingSeconds": 742,
  "paymentStatus": "pending | processing | completed | failed",
  "isOfflineSynced": false
}
```

---

### POST /api/v2/buy-it-now/{lockId}/checkout
**Amaç:** Ödeme başlat (1% provizyon kontrolü dahil)

**Request Body:**
```json
{
  "cardToken": "string",
  "billingAddress": {
    "fullName": "string",
    "city": "string",
    "district": "string",
    "addressLine": "string",
    "zipCode": "string"
  },
  "tcKimlikNo": "string (11 hane)",
  "consentHash": "sha256"
}
```

**Response 200:**
```json
{
  "orderId": "uuid",
  "status": "awaiting_3ds",
  "paymentUrl": "string (3DS WebView URL)",
  "amount": 4500000,
  "provisionAmount": 45000,
  "currency": "TRY",
  "transactionId": "uuid"
}
```

---

### POST /api/v2/buy-it-now/callback
**Amaç:** 3DS / ödeme sağlayıcı callback (İyzico / PayTR / Param)

**Content-Type:** `application/x-www-form-urlencoded` veya `application/json`

**Request Body:**
```json
{
  "status": "success | failure",
  "orderId": "uuid",
  "transactionId": "uuid",
  "provider": "iyzico | paytr | param",
  "providerTransactionId": "string",
  "hash": "string (HMAC-SHA256 doğrulama)"
}
```

**Response 200:** `{ "orderStatus": "completed | failed | pending" }`

---

## Ödeme & Cüzdan

### GET /api/v2/wallet
**Headers:** Authorization

**Response 200:**
```json
{
  "balance": 0,
  "currency": "TRY",
  "blockedAmount": 50000,
  "availableBalance": -50000,
  "cards": [
    {
      "cardToken": "tok_xxx",
      "lastFour": "4242",
      "cardBrand": "visa | mastercard | amex",
      "expiryMonth": "12",
      "expiryYear": "28",
      "isDefault": true,
      "cardAlias": "Ziraat Kartım"
    }
  ],
  "pendingProvisions": [
    {
      "provisionId": "uuid",
      "amount": 50000,
      "type": "auction_participation",
      "status": "active | released | captured",
      "createdAt": "ISO8601",
      "expiresAt": "ISO8601"
    }
  ]
}
```

---

### POST /api/v2/wallet/cards
**Amaç:** Kart ekle (tokenize)

**Request Body:**
```json
{
  "cardNumber": "string (server'a gitmez, doğrudan ödeme sağlayıcıya)",
  "expiryMonth": "string",
  "expiryYear": "string",
  "cvv": "string",
  "cardAlias": "string",
  "holderName": "string",
  "verifyWithProvision": true,
  "provisionAmount": 1
}
```

**Response 201:**
```json
{
  "cardToken": "tok_xxx",
  "lastFour": "4242",
  "status": "active",
  "requires3DS": true,
  "verificationUrl": "string (1₺ provizyon 3DS URL)"
}
```

---

### DELETE /api/v2/wallet/cards/{token}
**Response 204**

---

## KKA (Kat Karşılığı Arsa)

### POST /api/v2/kka/calculate
**Amaç:** Hak ediş hesaplama

**Request Body:**
```json
{
  "landM2": 500,
  "shareRatio": 0.40,
  "constructionArea": 2500,
  "floorCount": 8,
  "apartmentCount": 16,
  "projectDurationMonths": 36,
  "currentPhase": "foundation | structure | rough | finishing",
  "paidAmount": 0,
  "city": "İstanbul",
  "district": "Kadıköy"
}
```

**Response 200:**
```json
{
  "calculationId": "uuid",
  "scenarios": {
    "pessimistic": {
      "totalValue": 12000000,
      "monthlyHakEdis": 333333,
      "completionPercentage": 35,
      "riskLevel": "yuksek"
    },
    "realistic": {
      "totalValue": 15000000,
      "monthlyHakEdis": 416666,
      "completionPercentage": 45,
      "riskLevel": "orta"
    },
    "optimistic": {
      "totalValue": 18500000,
      "monthlyHakEdis": 513888,
      "completionPercentage": 55,
      "riskLevel": "dusuk"
    }
  },
  "recommendedEscrow": 1500000,
  "contractTemplateUrl": "pdf_url",
  "taxObligations": {
    "kdv": 1080000,
    "vergiBorcu": 500000
  }
}
```

---

### GET /api/v2/kka/map-data
**Amaç:** 500m yarıçaplı etki alanı GeoJSON

**Query Params:**
- `lat` (decimal)
- `lng` (decimal)
- `radius` (int, default: 500, max: 2000)

**Response 200:**
```json
{
  "center": [40.9829, 29.0264],
  "radiusMeters": 500,
  "geoJson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [[...]]
        },
        "properties": {
          "zoneType": "konut | ticari | karma",
          "maxHeight": 12,
          "maxEmsal": 2.5,
          "riskScore": 72
        }
      }
    ]
  },
  "nearbyProjects": [
    {
      "projectId": "uuid",
      "name": "string",
      "distanceMeters": 320,
      "pricePerM2": 18500,
      "completionPercentage": 60
    }
  ]
}
```

---

## AI & OCR Servisleri

### POST /api/v2/ai/tapu-ocr
**Amaç:** Tapu fotografından veri çıkarımı (Fasıl 5)

**Content-Type:** `multipart/form-data`

**Fields:**
- `image`: File (JPEG/PNG, max 10MB)
- `listingType`: `satilik | kiralik | kat-karsiligi`
- `extractCoordinates`: boolean

**Response 200:**
```json
{
  "scanId": "uuid",
  "confidence": 0.94,
  "extractedData": {
    "il": "İstanbul",
    "ilce": "Kadıköy",
    "mahalle": "Moda",
    "adaNo": "123",
    "parselNo": "4",
    "yuzOlcumu": "500 m²",
    "hisse": "1/2",
    "yapiAlan": "200 m²",
    "kat": "3",
    "ciltNo": "45",
    "sayfaNo": "128",
    "parselTuru": "Arsa",
    "nitelik": "Tarla"
  },
  "warnings": ["Hissenin tamamı için yetki gerekli"],
  "requiresManualReview": false
}
```

**Error Kodları:**
- `415` — Geçersiz görüntü formatı
- `422` — OCR başarısız (düşük kontrast/bulanıklık)
- `429` — Günlük OCR limiti (50/gün misafir, 200/gün üye)

---

### GET /api/v2/ai/score/{listingId}
**Amaç:** AI değerlendirme skoru

**Response 200:**
```json
{
  "listingId": "uuid",
  "score": 87,
  "factors": [
    { "name": "lokasyon", "weight": 0.30, "score": 92, "details": "Metroya 300m" },
    { "name": "fiyat_dogrusu", "weight": 0.25, "score": 85, "details": "Pazar ortalamasının %8 altında" },
    { "name": "yatirim_potansiyeli", "weight": 0.20, "score": 88, "details": "Yıllık %12 artış tahmini" },
    { "name": "mulk_durumu", "weight": 0.15, "score": 90, "details": "8 yıllık, iyi bakımlı" },
    { "name": "pazar_likiditesi", "weight": 0.10, "score": 78, "details": "Ortalama 45 gün satış süresi" }
  ],
  "comparables": [...],
  "updatedAt": "ISO8601"
}
```

---

## Emlakçı Paneli (Net-30)

### GET /api/v2/realtor/dashboard
**Headers:** Authorization (accountType=emlakci required)

**Response 200:**
```json
{
  "period": "2026-04",
  "net30Status": {
    "totalEarnings": 125000,
    "pendingInvoiceAmount": 45000,
    "approvedAmount": 80000,
    "paidAmount": 35000,
    "nextPayoutDate": "2026-05-15",
    "invoiceUploadDeadline": "2026-05-05"
  },
  "listings": {
    "active": 12,
    "pendingApproval": 3,
    "totalViews": 3420,
    "totalLeads": 45
  },
  "performance": {
    "conversionRate": 3.2,
    "avgResponseTimeMinutes": 18,
    "rating": 4.7
  }
}
```

---

### POST /api/v2/realtor/invoices
**Amaç:** Fatura yükleme

**Content-Type:** `multipart/form-data`
- `file`: PDF/JPG/PNG (max 5MB)
- `period`: "2026-04"
- `amount": 15000
- `taxNumber": "string"
- `invoiceType": "komisyon | hizmet | reklam"

**Response 201:** `{ "invoiceId": "uuid", "status": "pending_review", "uploadedAt": "ISO8601" }`

---

### GET /api/v2/realtor/payouts
**Response 200:**
```json
{
  "payouts": [
    {
      "payoutId": "uuid",
      "period": "2026-04",
      "amount": 35000,
      "status": "pending | processing | completed",
      "method": "bank_transfer",
      "scheduledDate": "2026-05-15",
      "completedAt": "ISO8601 (nullable)"
    }
  ]
}
```

---

## Sözleşme & Doküman

### GET /api/v2/contracts/{listingId}
**Amaç:** Mevcut sözleşme şablonlarını getir

**Response 200:**
```json
{
  "listingId": "uuid",
  "availableContracts": [
    {
      "type": "satilik",
      "version": "2.1.0",
      "url": "pdf_url",
      "checksum": "sha256",
      "requiredConsents": ["kvkk", "satis_sozlesmesi", "ihale_kurallari"]
    },
    {
      "type": "kiralama",
      "version": "1.8.0",
      "url": "pdf_url",
      "checksum": "sha256",
      "requiredConsents": ["kvkk", "kira_sozlesmesi"]
    }
  ]
}
```

---

### POST /api/v2/contracts/sign
**Amaç:** Sözleşme imzalama + JSON log

**Request Body:**
```json
{
  "contractType": "satilik | kiralama | kat-karsiligi | devren",
  "contractVersion": "string",
  "listingId": "uuid",
  "counterpartyId": "uuid",
  "signature": {
    "type": "e_imza | sms_onay | biyometrik",
    "data": "base64",
    "timestamp": "ISO8601"
  },
  "consentLog": {
    "kvkkHash": "sha256",
    "contractHash": "sha256",
    "scrollEndHash": "sha256",
    "ipAddress": "string",
    "deviceFingerprint": "string"
  }
}
```

**Response 201:**
```json
{
  "contractId": "uuid",
  "status": "signed",
  "pdfUrl": "string",
  "signedAt": "ISO8601",
  "isLegallyBinding": true,
  "expirationDate": "ISO8601 (kiralama için)"
}
```

---

### POST /api/v2/contracts/validate
**Amaç:** Anayasa 400 madde doğrulama (kritik 16 madde)

**Request Body:**
```json
{
  "contractType": "satilik",
  "payload": {
    "sellerId": "uuid",
    "buyerId": "uuid",
    "price": 4500000,
    "depositAmount": 50000,
    "isAuction": true,
    "hasBuildingPermit": true
  }
}
```

**Response 200:**
```json
{
  "isValid": false,
  "failedRules": [
    {
      "ruleId": "K-042",
      "severity": "critical | warning | info",
      "message": "İhale iştirak bedeli (bloke) teklif tutarının %1'inden az olamaz",
      "suggestedFix": "Bloke tutarı minimum 45.000 ₺ olmalıdır"
    }
  ],
  "passedRulesCount": 384,
  "totalRulesCount": 400
}
```

---

## Push & Bildirimler

### POST /api/v2/push/register
**Amaç:** FCM/APNs token kaydet

**Request Body:**
```json
{
  "platform": "ios | android",
  "pushToken": "string",
  "deviceId": "string",
  "notificationSettings": {
    "auctionUpdates": true,
    "priceAlerts": true,
    "messages": true,
    "marketing": false
  }
}
```

---

### GET /api/v2/notifications
**Response 200:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "bid_outbid | auction_won | auction_ending | price_drop | message | system",
      "title": "Teklifiniz Geçildi",
      "body": "Moda'daki 3+1 daire için yeni teklif: 4.350.000 ₺",
      "data": { "listingId": "uuid", "auctionId": "uuid" },
      "isRead": false,
      "createdAt": "ISO8601"
    }
  ],
  "unreadCount": 3
}
```

---

## Sohbet (Chat)

### GET /api/v2/chat/threads
**Headers:** Authorization

**Response 200:**
```json
{
  "threads": [
    {
      "threadId": "uuid",
      "participant": {
        "id": "uuid",
        "name": "Ahmet Yılmaz",
        "avatar": "url",
        "type": "emlakci"
      },
      "lastMessage": {
        "text": "Evet, pazarlık payı var...",
        "timestamp": "ISO8601",
        "isMasked": false
      },
      "unreadCount": 2,
      "listingId": "uuid"
    }
  ]
}
```

---

### POST /api/v2/chat/threads/{id}/messages
**Amaç:** Mesaj gönder (telefon masking aktif)

**Request Body:**
```json
{
  "text": "string",
  "type": "text | image | location | listing_share",
  "metadata": { "listingId": "uuid" }
}
```

**Telefon Masking Kuralı:** `+905xxxxxxxxx` → `+9053*******` (ilk 4 hane görünür). Tam numara sadece sözleşme imzalandıktan sonra açılır.

---

## Komisyon Hesaplama

### POST /api/v2/commission/calculate
**Amaç:** Dinamik komisyon hesaplama (kimikod engine mirror)

**Request Body:**
```json
{
  "listingType": "sale | rental | kat_karsiligi | transfer_rental | land",
  "price": 4500000,
  "currency": "TRY",
  "commissionParty": "seller_only | buyer_only | both",
  "sellerType": "individual | realtor | company",
  "hasExclusiveContract": false,
  "cityTier": "1 | 2 | 3"
}
```

**Response 200:**
```json
{
  "totalCommission": 225000,
  "commissionRate": 0.05,
  "breakdown": {
    "platformFee": 45000,
    "realtorFee": 135000,
    "marketingFee": 27000,
    "legalFee": 18000
  },
  "vatIncluded": true,
  "vatAmount": 36000,
  "sellerReceives": 4275000,
  "buyerPays": 4500000
}
```

---

## Hata Kodları (Global)

| HTTP | Kod | Açıklama |
|------|-----|----------|
| 400 | `INVALID_REQUEST` | Geçersiz parametre / eksik alan |
| 401 | `UNAUTHORIZED` | Token geçersiz veya süresi dolmuş |
| 403 | `FORBIDDEN` | Yetkisiz erişim (rol/Cİhaz kısıtlaması) |
| 404 | `NOT_FOUND` | Kaynak bulunamadı |
| 409 | `CONFLICT` | İşlem çakışması (örn: kilitleme) |
| 410 | `GONE` | Artık mevcut olmayan kaynak |
| 422 | `UNPROCESSABLE` | İş kuralları ihlali |
| 423 | `LOCKED` | Cihaz/hesap ClientLockManager tarafından kilitli |
| 429 | `RATE_LIMITED` | Çok fazla istek |
| 500 | `INTERNAL_ERROR` | Sunucu hatası |
| 503 | `MAINTENANCE` | Planlı bakım |

**Rate Limiting:**
- Auth endpoint'leri: 5 istek / dakika
- Teklif: 1 istek / 5 saniye (anti-snipe)
- OCR: 50/gün misafir, 200/gün üye, 500/gün emlakçı
- Arama: 30 istek / dakika

---

## WebSocket Events (Realtime)

**Connection:** `wss://api.ihaleal.com/v2/realtime`

**Authentication:** Query param `?token={jwt}`

**Client → Server Messages:**
```json
{ "type": "subscribe_auction", "auctionId": "uuid" }
{ "type": "subscribe_listing", "listingId": "uuid" }
{ "type": "ping", "clientTime": 1714819200 }
{ "type": "bid_attempt", "auctionId": "uuid", "amount": 4250000, "clientTimestamp": 1714819200 }
```

**Server → Client Messages:**
```json
{ "type": "bid_accepted", "bidId": "uuid", "newPrice": 4250000, "position": 1 }
{ "type": "bid_rejected", "reason": "insufficient_funds | below_increment | auction_ended" }
{ "type": "countdown_sync", "auctionId": "uuid", "secondsRemaining": 1847, "serverTime": 1714819200 }
{ "type": "auction_extended", "newDeadline": "ISO8601", "reason": "last_minute_bid" }
{ "type": "buy_now_locked", "listingId": "uuid", "lockedBy": "uuid", "expiresAt": "ISO8601" }
{ "type": "price_drop", "listingId": "uuid", "oldPrice": 5000000, "newPrice": 4750000 }
{ "type": "pong", "serverTime": 1714819200, "latency": 45 }
```

**Anti-Sniper Mekanizması:** Son 2 dakikada teklif gelirse geri sayım 5 dakika uzatılır. Maksimum 3 uzatma.

---

*Bu sözleşme İhaleAL v2.0 API'si için geçerlidir. Tüm tarih/saat değerleri ISO 8601 formatındadır. Tüm para birimleri Kuruş (cent) yerine ana birim (TRY, USD) cinsindendir.*
