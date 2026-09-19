# Borsa Terminali — ilan sitesinden görsel ayrım planı (TASLAK, uygulanmadı)

Amaç: `/borsa/*` (terminal, emir defteri, izleme, portföy, varlık detayı) ilan/pazar yerinden **bir bakışta ayrışsın**:
daha veri yoğun, daha teknik/profesyonel. Ortak marka (5 token, Inter) korunur; ayrım *rol, yoğunluk ve
ağırlık* ile kurulur — yeni renk yok.

## 1) İki yüzey, tek marka

| | **Pazar yeri** (ana sayfa, ilan, ihale listesi) | **Terminal** (`/borsa/*`) |
|---|---|---|
| His | açık, ferah, görsel/kart öncelikli, prestij | yoğun, teknik, tablo/grafik öncelikli |
| Zemin | `--sayfa` #F4F6FA + beyaz kartlar, 14px köşe | `--sayfa` zemin, **kartsız**: 1px çizgili paneller, 6–8px köşe |
| Boşluk | 8px ızgara, bölümler 64–96px | **4px ızgara**, panel içi 8–12px, bölüm boşluğu 16–24px |
| Tipografi | 5 kademe: 64/32/20/16/14 | terminal ölçeği: **14 / 13 / 12** + 20 (ana rakam); tüm sayılar tabular |
| Sayılar | okunur, sözle | sağa hizalı sütun, sabit ondalık, `+`/`−` işaretli değişim (renk + işaret) |
| Hareket | kaydırmayla beliren öğeler | **yok** (yalnız veri güncellemesinde 150 ms vurgu, `prefers-reduced-motion`'da anında) |
| Koyu bölge | yalnız hero bandı | yalnız **üst araç çubuğu** (secondary #0B1F3A, 40 px); gövde açık |

## 2) Teknik kurulum (küçük, geri alınabilir)

1. **Kapsam belirteci:** `BorsaLayout` kökünde `data-surface="terminal"`. `tema.css`'te yalnızca **rol/yoğunluk**
   tokenlarını bu belirteç altında ezmek: `--bosluk*` (4px), `--kose` (6px), `--t-*` (terminal ölçeği),
   `--golge-*` (yok), `--peso-*` (başlık 600, gövde 400). Marka renk tokenları **değişmez**.
2. **Terminal kabuğu:** 40px koyu araç çubuğu (endeks + ticker + saat), altında sol sekme çubuğu (Terminal / Varlıklar /
   İzleme / Portföy / Veri — mevcut `BorsaLayout` sekmeleri aynen), sabit alt durum çubuğu (bağlantı/gecikme).
3. **Bileşen kuralları:** yoğun tablo (satır 32px, sabit başlık, sıralanabilir, hover satır vurgusu = `--vurgu-yumusak`),
   emir defteri (iki sütun, derinlik çubuğu = primary %12 opaklık), mini grafik (tek çizgi, primary; dolgu yok),
   durum rozetleri küçük (12px).
4. **Erişilebilirlik:** yükseliş/düşüş **renk + ▲▼ + işaret**; kontrast ≥ 4,5:1; klavye ile tablo gezinme ve odak halkası;
   `prefers-reduced-motion`.
5. **Ölçüm kapısı:** her adımda ana sayfadaki gibi (a) etkileşimli öğe envanteri önce/sonra, (b) etkileşim testi,
   (c) `design-checklist.md`'e ek "terminal" maddeleri (yoğunluk, hizalama, işaretli değişim) ile bağımsız puanlama, (d) DUR.

## 3) Açık kararlar (onayınız gerekir)

- **Koyu "pro" modu:** terminal profesyonel hissi için koyu tema çok yaygın, ama mevcut kural "yalnız açık tema".
  Öneri: önce açık terminal; koyu mod ancak siz onaylarsanız, ayrı bir kullanıcı tercihi olarak.
- **Teklif verme / emir / ödeme arayüzü:** MUTLAK KURAL gereği (`placeBid`, payment, escrow, KYC, `fees.ts`,
  `taxConfig` ve görselleri) bu bileşenlerin *görsel* yeniden tasarımı da yalnızca açık, ayrı onayınızla yapılır;
  terminal geçişinde bunlar önce dokunulmadan bırakılır ve yalnız çevreleyen kabuk/tablolar dönüştürülür.
- **Font:** Inter + tabular yeterli; ayrı monospace (JetBrains Mono) yalnızca emir defteri/ticker rakamları için
  düşünülür (`₺` glifi kontrolü şart).

## 4) Önerilen sıra (her biri ayrı DUR noktası)

1. Ana sayfa (pilot) — **bu tur**
2. Ortak kabuk (üst başlık + footer + yüzen düğmeler): masaüstü menüsü, logo, 'İlk adımlar' bandı
3. İlan listeleme / arama sonuçları (pazar yeri dili)
4. **Borsa terminali** (bu plan)
5. Kullanıcı paneli
