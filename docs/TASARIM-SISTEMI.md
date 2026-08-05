# ihaleal — Açık & Minimal Tasarım Sistemi

Tek kaynak: **`src/styles/tema.css`**. Bu belge onun okunabilir özetidir; değer
değiştirmek gerekiyorsa **önce token dosyası** değişir, sayfa değil.

Yapı patatesci ile aynıdır; **tek fark marka rengidir** (ihaleal: lacivert `#1E40AF`).

---

## 1. Palet

### Zemin

| Token | Değer | Nerede |
|---|---|---|
| `--zemin` | `#ffffff` | sayfa zemini, kart yüzeyi |
| `--zemin-yumusak` | `#f7f8f7` | bölüm ayrımı, ikinci düzey yüzey |
| `--zemin-gri` | `#eef1ee` | ikon çerçevesi, iskelet (skeleton) |

**Koyu panel ve gradyan duvarı yoktur.** Bölümler kırık beyaz + 1px çizgiyle ayrılır.

### Metin

| Token | Değer | Kontrast (beyaz zemin) |
|---|---|---|
| `--metin` | `#1e2a24` | 14.88:1 |
| `--metin-ikincil` | `#5f6b64` | 5.56:1 |

`--zemin-gri` üzerinde de AA korunur: 12.99:1 ve 4.89:1.

### Vurgu — TEK renk

| Token | Değer | Kontrast |
|---|---|---|
| `--vurgu` | `#1e40af` | 8.72:1 (beyazla, her iki yönde) |
| `--vurgu-koyu` | `#1e3a8a` | hover |
| `--vurgu-yumusak` | `#eef2fb` | aktif durum zemini, bilgi bandı |

Vurgu **yalnız** şunlarda kullanılır: birincil CTA · bildirim · aktif durum · odak halkası.
Kart ikonları, ürün ikonları ve etiketler **nötr**dür. Çoklu vurgu / renk cümbüşü yasaktır.

### Fonksiyonel durum (tek vurgu kuralının istisnası)

| Token | Değer | Kontrast (beyaz) |
|---|---|---|
| `--durum-basari` | `#15803d` | 4.54:1 |
| `--durum-uyari` | `#9a6700` | 4.53:1 |
| `--durum-hata` | `#b42318` | 5.86:1 |

Her birinin çok açık bir zemin eşi vardır: `--durum-*-zemin`.

### Çizgi, gölge, köşe, boşluk

| Token | Değer |
|---|---|
| `--cizgi` | `#e8ede9` — **1px**, ağır border/çift çizgi yok |
| `--golge-kucuk` | `0 1px 2px rgba(30,42,36,.04)` |
| `--golge-buyuk` | `0 8px 24px rgba(30,42,36,.06)` |
| `--kose` | `14px` |
| `--kose-kucuk` | `10px` |
| `--bosluk` | `8px` — tüm boşluklar bu ızgaranın katı |

Gölge yalnız iki değerdir. Renkli parıltı gölgesi yoktur.

---

## 2. Yüzey sözleşmesi

Aynı bileşen hem beyaz hem lacivert zeminde durabildiği için, metin rengi **yüzeyden
miras alınır**. Her yüzey kuralı şu değişkenleri set eder:

| Değişken | Açık yüzeyde | Dolu (vurgu/durum) yüzeyde |
|---|---|---|
| `--uzerine` | `--metin` | `#ffffff` |
| `--uzerine-ikincil` | `--metin-ikincil` | `rgba(255,255,255,.9)` |
| `--uzerine-vurgu` | `--vurgu` | `#ffffff` |
| `--uzerine-basari` | `--durum-basari` | `#ffffff` |
| `--uzerine-uyari` | `--durum-uyari` | `#ffffff` |
| `--uzerine-hata` | `--durum-hata` | `#ffffff` |

Vurgu zeminli bir kart/bant yazarken `.vurgu-yuzey` sınıfını kullanın; sözleşme kendiliğinden
devreye girer, içindeki metin ve rozetler doğru renge döner.

```jsx
<section className="py-20 vurgu-yuzey">
  <h2>Demo görüşmesi planlayalım.</h2>
  <p style={{ color: "var(--uzerine-ikincil)" }}>30 dakikalık görüşme.</p>
</section>
```

---

## 3. Beş bileşen kuralı

1. **Buton** — birincil: dolu `--vurgu`, beyaz yazı, `--kose-kucuk`, gölge yok.
   İkincil: beyaz zemin + 1px `--cizgi`. Hayalet: zeminsiz, `--uzerine-ikincil`.
   Hover yalnız `translateY(-1px)` + renk; boyut değişmez (CLS=0).
2. **Kart** — beyaz zemin, 1px `--cizgi`, `--golge-kucuk`, `--kose`.
   Hover'da `--golge-buyuk` + 2px kalkma. Çerçeve içinde çerçeve yok.
3. **Giriş alanı** — beyaz zemin, 1px `--cizgi`, `--kose-kucuk`.
   Placeholder `--metin-ikincil`, tam opak. Odakta 2px `--vurgu` halka.
4. **Bölüm** — zemin `--zemin` ya da `--zemin-yumusak`; ayrım rengi değil **boşluk ve
   1px çizgi** ile yapılır. Hiyerarşi: başlık → özet → detay.
5. **Etiket / rozet** — nötr: `--zemin-yumusak` + `--metin-ikincil`.
   Yalnız durum bildiriyorsa `--durum-*` ve eşi olan `--durum-*-zemin`.

---

## 4. Tipografi ve hareket

- Aile: **Inter** (gövde) / **Plus Jakarta Sans** (başlık). Ölçek `--text-*`
  tokenlarında; en büyük başlık `clamp(2rem, 4.5vw, 3rem)` — ölçülü tutulur.
- Satır yüksekliği: başlık 1.15, gövde 1.65.
- Hareket **yalnız** `transform` ve `opacity` üzerinden; 150–220 ms;
  `prefers-reduced-motion` her iki katmanda da saygı görür.
- İskelet (skeleton) kayan gradyan değil, nefes alan `opacity`'dir.

---

## 5. Erişilebilirlik eşiği

- Metin **4.5:1**, büyük metin/ikon **3:1** — istisna yok.
- Dokunma hedefi en az **44×44 px**.
- `:focus-visible` global: 2px `--vurgu` halka, 2px offset.
- Her sayfa **375px**'te yatay taşma **0** vermek zorundadır.

Ölçüm: `node scripts/tasarim-olcum.mjs` (Playwright/Edge, gerçek DOM + hesaplanmış stil).
Sonuç `public/tasarim-olcum.json`'a yazılır; iddia değil, ölçüm.

---

## 6. Uyum katmanı (geçici)

Koyu tema, ağaçtaki 250+ bileşene Tailwind utility'si olarak yayılmıştı.
`src/styles/global-acik.css` bu utility'leri tek noktadan tokenlara bağlar.

- **Üretilmiş dosyadır, elle düzenlenmez.** Yeniden üret: `npm run tema:uyum`
  (üretici: `scripts/gen-tema-uyum.mjs`).
- Yalnız kaynakta gerçekten geçen sınıflar için kural yazar (perf).
- **Yeni kod bu katmana yaslanmamalıdır**: yeni bileşende `bg-slate-900` / `text-white`
  yerine doğrudan token kullanın. Katman eski kodu taşımak içindir; sayfalar gerçekten
  temizlendikçe küçülür ve sonunda silinir.
