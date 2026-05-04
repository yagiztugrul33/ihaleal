# Kat Karşılığı Arsa (KKA) Modülü

## Amaç
Kullanıcının arsa payını (hisse oranı) ve proje parametrelerini girerek hak ediş (hak ediş payı) hesaplaması yapmasını, 500m yarıçaplı etki alanı haritasını görüntülemesini ve KKA sözleşmesi oluşturmasını sağlar.

## İlgili Fasıl
- Fasıl 9 — KKA Map & Data Room
- Fasıl 10 — Sözleşme UX

## Dosya Yapısı

```
kat_karsiligi/
├── README.md
├── index.ts
├── KKAEntryScreen.tsx         # Giriş formu (m2, hisse, proje süresi)
├── KKAMapScreen.tsx           # 500m etki alanı + GeoJSON + yakın projeler
├── KKACalculateScreen.tsx     # 3 senaryo hesaplama (kötümser/gerçekçi/iyimser)
├── KKAContractScreen.tsx      # Dinamik sözleşme + imza + JSON log
├── KKAService.ts              # API (calculate, map-data)
├── KKAStore.ts                # Form state + hesaplama cache
├── KKAEngine.ts               # Client-side hak ediş formülleri
├── components/
│   ├── KKAScenarioCard.tsx    # Tek senaryo kartı
│   ├── KKAMapOverlay.tsx      # Harita üzerinde bilgi katmanı
│   └── KKAProgressBar.tsx     # İnşaat fazı ilerleme göstergesi
└── types.ts
```

## Hak Ediş Formülü (Client Engine)

```typescript
function calculateHakEdis(params: KKAParams): KKAScenario[] {
  const { landM2, shareRatio, constructionArea, floorCount, 
          projectDurationMonths, currentPhase, cityTier } = params;
  
  // Taban m² birim değeri (şehir tier'ına göre)
  const baseValuePerM2 = cityTier === 1 ? 18500 : cityTier === 2 ? 12500 : 8500;
  
  // Emsal etkisi
  const emsal = constructionArea / landM2; // örn: 2.5
  const emsalMultiplier = Math.min(emsal, 4.0) * 0.35;
  
  // Kat etkisi
  const floorMultiplier = Math.min(floorCount, 20) * 0.02;
  
  // Tamamlanma oranı
  const phaseMap = { foundation: 0.15, structure: 0.35, rough: 0.60, finishing: 0.85 };
  const completionRatio = phaseMap[currentPhase];
  
  // Senaryolar
  const pessimistic = baseValuePerM2 * 0.7;
  const realistic = baseValuePerM2 * 1.0;
  const optimistic = baseValuePerM2 * 1.3;
  
  return [
    { type: 'pessimistic', totalValue: pessimistic * landM2 * shareRatio * (1 + emsalMultiplier + floorMultiplier) * completionRatio },
    { type: 'realistic',   totalValue: realistic   * landM2 * shareRatio * (1 + emsalMultiplier + floorMultiplier) * completionRatio },
    { type: 'optimistic',   totalValue: optimistic  * landM2 * shareRatio * (1 + emsalMultiplier + floorMultiplier) * completionRatio }
  ];
}
```

## Kritik Kurallar

1. **500m Etki Alanı:** Kullanıcı arsa konumunu seçtiğinde `lat/lng` merkezli 500m yarıçaplı GeoJSON polygon çizilir. Bu alan içindeki projeler backend'den `nearbyProjects` olarak gelir.
2. **Data Room (50K Provizyon):** KKA detaylı dokümanları (imar durumu, ruhsat, tapu örneği) görüntülemek için 50.000 ₺ provizyon bloke edilir. Bu bloke sadece Data Room erişimi içindir, satın alma değildir.
3. **Sözleşme Dinamikliği:** KKA sözleşmesi girilen parametrelere göre otomatik oluşturulur. Hisse oranı, proje süresi, hak ediş dönemleri sözleşme metnine dinamik işlenir.
4. **Tapu OCR Entegrasyonu:** Tapu fotoğrafı yüklendiğinde `services/ai_engine` OCR ile ada/parsel/hisse çıkarımı yapılır.

## API Endpoint'leri
- `POST /api/v2/kka/calculate`
- `GET /api/v2/kka/map-data?lat={x}&lng={y}&radius=500`
- `POST /api/v2/wallet/provision` (Data Room 50K)
- `POST /api/v2/contracts/sign` (KKA sözleşmesi)

## Bağımlılıklar
- `services/ai_engine` — Tapu OCR
- `services/payments` — Data Room provizyonu
- `services/contracts` — Sözleşme PDF oluşturma
- `core/security` — Konum izni yönetimi

## Test Senaryoları
1. Hisse oranı 1/2 + 500m² arsa → 3 senaryo hesaplanıyor
2. Harita zoom in/out + GeoJSON polygon render
3. Data Room provizyon başarısız → hata mesajı
4. Offline modda form doldurulur, online olunca hesaplama gönderilir
