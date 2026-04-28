# Demo etiketleme standardı

Bu doküman Cloud ile hizalıdır; uygulama içi referans: `src/lib/dataStrategy.ts`, `src/components/DemoDataCornerBadge.tsx`.

## Kural 1 — `data-demo` attribute

Demo veri gösteren bileşen köküne `data-demo="true"` ekleyin. Görünür metin SEO’da “fiyat” iddiasını tek başına güçlendirmez; rozet yine de kullanıcı için önerilir.

## Kural 2 — Görünür rozet

Kullanıcının görmesi için sağ üst köşede küçük “Demo” rozeti:

```tsx
{showDemo && (
  <span
    className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded"
    aria-label="Bu veri demo amaçlıdır, gerçek piyasa verisi değildir"
  >
    Demo
  </span>
)}
```

Projede tekrar kullanım: `DemoDataCornerBadge` (içerik yukarıdakiyle aynı).

## Kural 3 — Hangi yüzeyler

- Endeksa-benzeri tahmini değer, “piyasa fiyatı”, sahte ihale geçmişi, demo yorumlar, sahte teklif sayıları → demo.
- Kullanıcının yüklediği gerçek ilan metni/görseli (üretimde) → demo değil; yalnızca platformun ürettiği sentetik alanlar etiketlenir.

## Kural 4 — Tek merkez

`isDemoData(source: string)` (`src/lib/dataStrategy.ts`) — bileşenlerde sabit `true` yerine örneğin `isDemoData("aiValuation")` kullanın. Yeni demo kaynağı için anahtarı `DEMO_SOURCES` kümesine ekleyin.
