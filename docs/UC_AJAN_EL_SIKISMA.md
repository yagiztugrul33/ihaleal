# Üç ajan el sıkışması — Cursor + Kimi + Cloud (kayıt; 2026-04-28)

Bu dosya **kaybolmasın** diye repoda tutulur. Ayrıntılı teknik günlük: `CLOUD_CIKTI/AGENT_RAPORU.md` (**§B** Cursor, **§A** Cloud, **§C/§D** ortak).

---

## Şu ana kadar ne var? (özet)

- **Demo SPA:** çok sayfa, `fees.ts` tek kaynak, akışlar (`userFlows` + `FlowSelector` + dashboard), mock auth, `RouteSeo` taslağı, demo banner (kapatılamaz).
- **Tur #5:** `supabase/` migrasyonlar (6 tablo hedefi + RLS + `place_bid` RPC), Edge `place_bid` şablonu, `src/lib/supabase.ts` (**henüz UI’da import yok**), Vitest (4 test), K7 minimal AntiCopy.
- **Blokörler:** Yerelde **Git PATH yok**; **K12/K13** doldurulmadığı için **uzak `db push` / commit / push yok**; `hero-aerial.mp4` Pexels CDN **403** → dosya manuel.

---

## Rol dağılımı (senin istediğin model)

| Ajan | Rol | Kota / sıklık önerisi |
|------|-----|------------------------|
| **Cursor (CROSS)** | Repoda **gerçek** değişiklik; `typecheck`/`build`/`test`; Kimi çıktısını **dosya dosya doğrulama**; halüsinasyon yok sayılmaz. | Ana yük |
| **Kimi** | Aynı komutla **kısıtlı** görevler (metin, küçük bileşen, asset listesi); **repo dışı sandbox** riski — her şey **Cursor ile repoya alınmadan merge edilmez**. | “Amele”: çok parça, düşük mimari risk |
| **Cloud** | Mimari, hukuk, §D kararları, SQL/RLS **inceleme**; az ama net komut. | Sabah açılınca kısa tur |

**Altın kurallar**

1. **Tek ortak komut** hem Kimi’ye hem Cursor’a yapıştırılır; komutta **kimin hangi çıktıyı nereye** koyacağı yazılır.
2. Kimi **doğrudan kritik dosyayı** (`App.tsx`, `fees.ts`, migrasyon) **yalnız** “Cursor onaylı patch” formatında verir; mümkünse **yeni küçük dosya** veya **metin blokları**.
3. **API key / service_role** asla repo; `.env.local` gitignore.
4. Mevcut **§A↔§B** ayrımı korunur; üçlü çalışmada **kanonik teknik gerçek = repo + Cursor doğrulaması**.

---

## Siteyi “şu an” görmek (canlı URL yok)

Canlı deploy bu sohbetten bağımsız; yerel:

```bash
cd ihaleal.com
npm install
npm run dev
```

Tarayıcı: **http://127.0.0.1:5173/#/** (Vite varsayılanı 5173; `package.json`’da `--port 5173`).

Önemli rotalar örnek: `/#/reklam`, `/#/onboarding/akis`, `/#/dashboard`, `/#/giris`.

---

## Ortak komut iskeleti (Kimi + Cursor’a aynı yapıştırılacak — taslak)

```
[KİMİ + CURSOR — ORTAK]
Kimlik: Bu metni Kimi sandbox'a ve Cursor (ihaleal.com repo) aynen yapıştırın.

CURSOR (disk): Repoda değişiklik yapar, npm run typecheck && npm run build && npm run test:run zorunlu.
KİMİ (sandbox): Sadece metin / küçük kod önerisi üretir; dosya yolu repoyla aynı olmalı; secret yok.

Görev: <tek cümle>
Kimi çıktısı: <Kimi'nin ürettiği blok — Cursor bunu dosyaya işlemeden önce doğrular>
Cursor: <repo path listesi + kabul kriterleri>
```

Cloud sabah açılınca aynı dosyaya veya `AGENT_RAPORU.md` §A’ya **kısa** strateji notu eklenebilir.

---

## İki yapay zeka + sen — dürüst değerlendirme

- **İyi taraflar:** Hızlı iterasyon, `fees`/SEO/demo etiketi gibi **tutarlılık**; tur bazlı rapor (`AGENT_RAPORU.md`) ile **iz sürülebilirlik**.
- **Riskler:** Sandbox (Kimi) ile repo (Cursor) **ayrı dünyalar**; blokörler (**Git, K12**) olunca takvim **durur**; “yapıldı” demek için **build + dosya kanıtı** şart.

**Kabaca kod:** `src` altında `.ts`/`.tsx` satır sayısı ~**15.7k** (satır ≠ iş; ölçü kabaca). İnsan tek başına benzer demo kapsamı: çoğu ekipte **birkaç hafta–birkaç ay** (tasarım, hukuk metni, entegrasyon kararı, review ile); paralel ajanlar takvimi sıkıştırır ama **ürün kararları** (K12, ödeme, KVKK) yine insanda.

---

## Sonraki adım (sabah)

1. **Git + GitHub (K13) + Supabase (K12)** → `AGENT_RAPORU.md` §D’ye yapıştır.  
2. Cursor’da `supabase link` + `db push` + ilk commit.  
3. Cloud’a **kısa** tur: RLS/Edge gözden geçirme.  
4. Kimi + Cursor **tek komut** ile devam.
