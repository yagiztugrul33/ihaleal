// global-acik.css uretici — Tailwind utility uyum katmani.
// Amac: koyu temaya gore yazilmis 250+ dosyayi tek tek degistirmeden
// acik & minimal tasarim sistemine baglamak.
import fs from 'node:fs';
import path from 'node:path';

// ── Kullanilan utility jetonlarini topla ────────────────────────────────────
// Perf: agacta HIC gecmeyen sinif icin kural uretmek, render-blocking CSS'i
// bosuna buyutuyor. Yalnizca kaynakta gecen jetonlar icin kural uretilir.
const KOK = process.argv[3] || 'src';
const KULLANILAN = new Set();
(function tara(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { tara(p); continue; }
    // Uretilen dosyanin kendisi taranmaz (kendi kendini besleyip sisirmesin)
    if (e.name === 'global-acik.css') continue;
    if (!/\.(tsx?|jsx?|html|css)$/.test(e.name)) continue;
    const s = fs.readFileSync(p, 'utf8');
    for (const m of s.matchAll(/\b(bg|text|border|ring|divide|shadow|from|via|to)-([a-z]+)-(\d{2,3})\b/g)) {
      KULLANILAN.add(`${m[1]}-${m[2]}-${m[3]}`);
      // gradyan duraklari (from-/via-/to-) ilgili bg kuralina denk gelsin
      if (['from', 'via', 'to'].includes(m[1])) KULLANILAN.add(`bg-${m[2]}-${m[3]}`);
    }
  }
})(KOK);
// index.html de Tailwind content listesinde — oradaki jetonlar da sayilir.
try {
  const ih = fs.readFileSync('index.html', 'utf8');
  for (const m of ih.matchAll(/\b(bg|text|border|ring|divide|shadow|from|via|to)-([a-z]+)-(\d{2,3})\b/g)) {
    KULLANILAN.add(`${m[1]}-${m[2]}-${m[3]}`);
    if (['from', 'via', 'to'].includes(m[1])) KULLANILAN.add(`bg-${m[2]}-${m[3]}`);
  }
} catch { /* index.html yoksa gec */ }
const kullanilir = (t) => !/-\d{2,3}$/.test(t) || KULLANILAN.has(t);

// TAM SINIF eslesmesi. Tailwind sinif adlari bosluklarla ayrildigi icin
// [class~="x"] tam jetonu yakalar: "bg-blue-50" ile "bg-blue-500" karismaz,
// "hover:bg-blue-500" gibi varyantlar da eslesmez (farkli jeton).
// Opaklik varyantlari ("bg-blue-500/10") ayri ele alinir.
const tam = (t) => [`[class~="${t}"]`];
const opak = (t) => [`[class*=" ${t}/"]`, `[class^="${t}/"]`];

const j = (arr) => arr.join(',\n');
const S = (tokens) => j(tokens.filter(kullanilir).flatMap(tam));
const SO = (tokens) => j(tokens.filter(kullanilir).flatMap(opak));

const NOTR = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
const VURGU_AILE = ['blue', 'indigo', 'sky', 'cyan', 'violet', 'purple', 'fuchsia', 'pink', 'teal'];
const BASARI = ['emerald', 'green', 'lime'];
const UYARI = ['amber', 'yellow', 'orange'];
const HATA = ['red', 'rose'];
const RENKLI = [...VURGU_AILE, ...BASARI, ...UYARI, ...HATA];
const TUM = [...NOTR, ...RENKLI];

const ACIK_TON = [50, 100, 200];
const ORTA_TON = [300, 400, 500, 600, 700, 800];
const KOYU_TON = [700, 800, 900, 950];
const TUM_TON = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const x = (pfx, aile, tonlar) => aile.flatMap((a) => tonlar.map((s) => `${pfx}-${a}-${s}`));

const out = [];
const B = (s) => out.push(s);

B(`/* ══════════════════════════════════════════════════════════════════════════
   ihaleal — AÇIK TEMA UYUM KATMANI  (global-acik.css)
   ÜRETİLMİŞ DOSYA — elle düzenlemeyin (üretici: tasarım turu betiği).
   ──────────────────────────────────────────────────────────────────────────
   Bu dosya global-dark.css'in yerini alır. Eski koyu tema, ağaçtaki 250+
   bileşene "text-white", "bg-slate-900", "bg-gradient-to-br" gibi utility'ler
   olarak yayılmıştı. Dosya dosya değiştirmek yerine bu utility'ler burada tek
   noktadan tasarım sistemi tokenlarına bağlanır (bkz. src/styles/tema.css).

   YÜZEY SÖZLEŞMESİ
     Her yüzey kuralı --uzerine ve --uzerine-ikincil değişkenlerini set eder.
     Bu değişkenler MİRAS ALINIR; "text-white" gibi utility'ler rengini
     buradan okur. Böylece beyaz metin açık yüzeyde koyu nötre döner, dolu
     (vurgu/durum) yüzeyde beyaz kalır — tek kural, iki bağlam.

   EŞLEŞME BİÇİMİ
     [class~="bg-blue-500"] tam jeton eşleşmesidir: "bg-blue-50" ile
     karışmaz, "hover:bg-blue-500" varyantını da etkilemez.
     Opaklık varyantları ("bg-blue-500/10") ayrı ve daha açık tona bağlanır.

   Erişilebilirlik / dokunma hedefi / hareket kuralları global-dark.css'ten
   AYNEN taşındı; yalnız odak halkası vurgu rengine çevrildi.
   ══════════════════════════════════════════════════════════════════════════ */

:root {
  --uzerine: var(--metin);
  --uzerine-ikincil: var(--metin-ikincil);
  --uzerine-vurgu: var(--vurgu);
  --uzerine-basari: var(--durum-basari);
  --uzerine-uyari: var(--durum-uyari);
  --uzerine-hata: var(--durum-hata);
}
`);

// Acik yuzey: tum "uzerine" degiskenleri koyu/renkli varsayilana doner.
const ACIK_YUZEY = `  --uzerine: var(--metin);
  --uzerine-ikincil: var(--metin-ikincil);
  --uzerine-vurgu: var(--vurgu);
  --uzerine-basari: var(--durum-basari);
  --uzerine-uyari: var(--durum-uyari);
  --uzerine-hata: var(--durum-hata);`;

// Dolu yuzey: uzerindeki her sey beyaza doner (renkli metin okunmaz olurdu).
const DOLU_YUZEY = `  --uzerine: #ffffff;
  --uzerine-ikincil: rgba(255, 255, 255, 0.9);
  --uzerine-vurgu: #ffffff;
  --uzerine-basari: #ffffff;
  --uzerine-uyari: #ffffff;
  --uzerine-hata: #ffffff;`;

B(`/* ── 1. Dokunma hedefi (WCAG AA 44x44) ─────────────────────────────────── */
button:not([class*="size-icon"]):not([class*="h-6"]):not([class*="h-7"]):not([class*="h-8"]):not([class*="h-9"]):not([class*="h-10"]):not([class*="h-11"]):not([class*="h-12"]):not([class*="size-9"]):not([class*="size-10"]):not([class*="size-11"]):not([class*="size-12"]):not([data-skip-min]),
a[role="button"]:not([data-skip-min]),
[role="button"]:not([data-skip-min]) {
  min-height: 44px;
}

/* ── 2. Klavye odağı — açık zeminde belirgin vurgu halkası ─────────────── */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
summary:focus-visible,
[role="button"]:focus-visible,
[role="tab"]:focus-visible,
[tabindex="0"]:focus-visible {
  outline: 2px solid var(--vurgu);
  outline-offset: 2px;
  border-radius: 6px;
}
`);

B(`/* ── 3. Gradyan duvarı kaldırıldı ──────────────────────────────────────── */
[class*="bg-gradient-to-"]:not([class*="bg-clip-text"]),
[class*="bg-[radial-gradient"],
[class*="bg-[linear-gradient"],
[class*="bg-[conic-gradient"] {
  background-image: none !important;
}

/* Gradyanlı metin → düz vurgu rengi (okunur: 8.72:1) */
[class*="bg-clip-text"] {
  background-image: none !important;
  -webkit-text-fill-color: var(--vurgu) !important;
  color: var(--vurgu) !important;
}
`);

B(`/* ── 4. Koyu paneller → açık yüzey (koyu panel YOK) ────────────────────── */
${S([...x('bg', NOTR, KOYU_TON), ...x('bg', RENKLI, [900, 950]), 'bg-black'])},
${SO([...x('bg', NOTR, KOYU_TON), ...x('bg', RENKLI, [900, 950]), 'bg-black'])},
[class*="bg-[#0"],
[class*="bg-[#1"],
[class*="bg-[rgba(0"],
[class*="bg-[rgba(2,"],
[class*="bg-[rgba(8,"],
[class*="bg-[rgba(10,"],
[class*="bg-[rgba(11,"],
[class*="bg-[rgba(15,"],
[class*="bg-[rgba(30,"] {
  background-color: var(--zemin-yumusak) !important;
  color: var(--metin);
${ACIK_YUZEY}
}

/* Beyaz şeffaflık katmanları (koyu tema kalıntısı) → açık yüzey */
${SO(['bg-white'])},
[class*="bg-white/["] {
  background-color: var(--zemin-yumusak) !important;
${ACIK_YUZEY}
}
`);

B(`/* ── 5. Dolu yüzeyler: TEK vurgu + fonksiyonel durum ───────────────────── */
${S(x('bg', VURGU_AILE, ORTA_TON))} {
  background-color: var(--vurgu) !important;
  color: #ffffff;
${DOLU_YUZEY}
}

${S(x('bg', BASARI, ORTA_TON))} {
  background-color: var(--durum-basari) !important;
  color: #ffffff;
${DOLU_YUZEY}
}

${S(x('bg', UYARI, ORTA_TON))} {
  background-color: var(--durum-uyari) !important;
  color: #ffffff;
${DOLU_YUZEY}
}

${S(x('bg', HATA, ORTA_TON))} {
  background-color: var(--durum-hata) !important;
  color: #ffffff;
${DOLU_YUZEY}
}
`);

B(`/* ── 6. Açık tonlar ve şeffaf renk katmanları: renk cümbüşü yok ────────── */
${S([...x('bg', NOTR, ACIK_TON), 'bg-white', 'bg-background', 'bg-card'])},
${SO(x('bg', NOTR, [300, 400, 500, 600]))} {
  color: var(--metin);
${ACIK_YUZEY}
}

${S(x('bg', VURGU_AILE, ACIK_TON))},
${SO(x('bg', VURGU_AILE, TUM_TON))} {
  background-color: var(--vurgu-yumusak) !important;
  color: var(--metin);
${ACIK_YUZEY}
}

${S(x('bg', BASARI, ACIK_TON))},
${SO(x('bg', BASARI, TUM_TON))} {
  background-color: var(--durum-basari-zemin) !important;
  color: var(--metin);
${ACIK_YUZEY}
}

${S(x('bg', UYARI, ACIK_TON))},
${SO(x('bg', UYARI, TUM_TON))} {
  background-color: var(--durum-uyari-zemin) !important;
  color: var(--metin);
${ACIK_YUZEY}
}

${S(x('bg', HATA, ACIK_TON))},
${SO(x('bg', HATA, TUM_TON))} {
  background-color: var(--durum-hata-zemin) !important;
  color: var(--metin);
${ACIK_YUZEY}
}
`);

B(`/* ── 7. Metin: yüzey sözleşmesine bağlandı ─────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  color: var(--uzerine);
}

${S(['text-white'])},
${SO(['text-white'])} {
  color: var(--uzerine) !important;
}

${S(x('text', NOTR, [50, 100, 200, 300, 400, 500, 600]))},
${SO(x('text', NOTR, [50, 100, 200, 300, 400, 500, 600]))} {
  color: var(--uzerine-ikincil) !important;
}

${S([...x('text', NOTR, [700, 800, 900, 950]), 'text-black'])},
${SO([...x('text', NOTR, [700, 800, 900, 950]), 'text-black'])} {
  color: var(--uzerine) !important;
}

/* Renkli metin de yüzey sözleşmesinden okur: dolu yüzeyde beyaza döner. */
${S(x('text', VURGU_AILE, TUM_TON))},
${SO(x('text', VURGU_AILE, TUM_TON))} {
  color: var(--uzerine-vurgu) !important;
}

${S(x('text', BASARI, TUM_TON))},
${SO(x('text', BASARI, TUM_TON))} {
  color: var(--uzerine-basari) !important;
}

${S(x('text', UYARI, TUM_TON))},
${SO(x('text', UYARI, TUM_TON))} {
  color: var(--uzerine-uyari) !important;
}

${S(x('text', HATA, TUM_TON))},
${SO(x('text', HATA, TUM_TON))} {
  color: var(--uzerine-hata) !important;
}
`);

B(`/* ── 8. Kenarlık: 1px, tek ton, ağır çizgi yok ─────────────────────────── */
${S([...x('border', TUM, TUM_TON), 'border-white', 'border-black'])},
${SO([...x('border', TUM, TUM_TON), 'border-white', 'border-black'])} {
  border-color: var(--cizgi) !important;
}

${S(x('divide', TUM, TUM_TON))} > * + *,
${SO(x('divide', TUM, TUM_TON))} > * + * {
  border-color: var(--cizgi) !important;
}

${S(x('ring', TUM, TUM_TON))},
${SO(x('ring', TUM, TUM_TON))} {
  --tw-ring-color: var(--cizgi) !important;
}
`);

B(`/* ── 9. Yapısal bileşenler ─────────────────────────────────────────────── */
nav, header {
  background: var(--zemin) !important;
  background-image: none !important;
  backdrop-filter: none;
  border-bottom: 1px solid var(--cizgi);
  --uzerine: var(--metin);
  --uzerine-ikincil: var(--metin-ikincil);
}

footer {
  background: var(--zemin-yumusak) !important;
  background-image: none !important;
  color: var(--metin-ikincil) !important;
  border-top: 1px solid var(--cizgi);
  --uzerine: var(--metin);
  --uzerine-ikincil: var(--metin-ikincil);
}

input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]),
textarea,
select {
  background: var(--zemin) !important;
  color: var(--metin) !important;
  border: 1px solid var(--cizgi) !important;
  border-radius: var(--kose-kucuk);
}

input::placeholder,
textarea::placeholder {
  color: var(--metin-ikincil) !important;
  opacity: 1;
}

table, th, td {
  background: transparent !important;
  color: var(--metin) !important;
  border-color: var(--cizgi) !important;
}

thead th {
  background: var(--zemin-yumusak) !important;
  color: var(--metin-ikincil) !important;
}

[role="dialog"], .modal {
  background: var(--zemin) !important;
  color: var(--metin) !important;
  border: 1px solid var(--cizgi);
  box-shadow: var(--golge-buyuk);
}

/* Düz metin içi bağlantı — vurgu rengi. Butonlaşmış bağlantılar hariç. */
a:not([class*="btn"]):not([class*="button"]):not([data-slot="button"]):not([class*="text-white"]):not(nav a):not(header a):not(footer a) {
  color: var(--vurgu);
}

/* Kart: ağır çerçeve + koyu dolgu yerine 1px çizgi ve neredeyse görünmez gölge */
.card,
[class*="rounded"][class*="shadow"]:not([data-slot="button"]):not(button):not(a):not([role="button"]) {
  border-color: var(--cizgi);
  box-shadow: var(--golge-kucuk);
}

button.bg-white,
button.bg-gray-100,
.btn-default {
  background: var(--vurgu) !important;
  color: #ffffff !important;
${DOLU_YUZEY}
}

/* Vurgu dolgulu bileşenler (tema sınıfları + shadcn + CTA değişkeni) —
   yüzey sözleşmesi: üzerindeki metin beyaz kalır. */
.btn-primary,
.btn-accent,
[class~="bg-primary"],
[class~="bg-destructive"],
[class*="background:var(--gradient-cta)"],
[class*="background:var(--color-primary)"],
[class*="bg-[var(--vurgu)"] {
${DOLU_YUZEY}
}

/* !important YOK: vurgu yüzeyi üzerindeki ters (beyaz zemin/lacivert yazı)
   satır içi biçim bu kuralı geçebilsin. */
.btn-accent {
  background: var(--vurgu);
  color: #ffffff;
  border: 1px solid var(--cizgi);
  border-radius: var(--kose-kucuk);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}
`);

B(`/* ── 10. Gölge: iki değere indirildi ───────────────────────────────────── */
${S(['shadow-sm', 'shadow-xs', 'shadow', 'shadow-md', 'shadow-inner'])} {
  box-shadow: var(--golge-kucuk) !important;
}

${S(['shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-lux', 'shadow-lux-lg'])} {
  box-shadow: var(--golge-buyuk) !important;
}

/* Renkli parıltı gölgeleri (koyu tema kalıntısı) kaldırıldı */
${S([...x('shadow', TUM, TUM_TON), 'shadow-black'])},
${SO([...x('shadow', TUM, TUM_TON), 'shadow-black'])} {
  box-shadow: var(--golge-buyuk) !important;
}
`);

B(`/* ── 11. Boş durum ─────────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--metin-ikincil);
  border: 1px dashed var(--cizgi);
  border-radius: var(--kose);
  background: var(--zemin-yumusak);
}

.empty-state svg {
  width: 32px;
  height: 32px;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

/* ── 12. Hareket: yalnız transform + opacity ───────────────────────────── */
button:not([data-skip-transition]),
a:not([data-skip-transition]),
[role="button"]:not([data-skip-transition]) {
  transition: transform var(--gecis-hizli) ease-out, opacity var(--gecis-hizli) ease-out,
    background-color var(--gecis-hizli) ease-out, border-color var(--gecis-hizli) ease-out,
    color var(--gecis-hizli) ease-out, box-shadow var(--gecis) ease-out;
}

button:not([data-skip-transition]):not(:disabled):hover,
a[role="button"]:not([data-skip-transition]):hover,
[role="button"]:not([data-skip-transition]):not(:disabled):hover {
  transform: translateY(-1px);
}

button:not([data-skip-transition]):not(:disabled):active,
a[role="button"]:not([data-skip-transition]):active,
[role="button"]:not([data-skip-transition]):not(:disabled):active {
  transform: translateY(0);
  transition-duration: 0.05s;
}

button:disabled,
[role="button"][aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.card-luxury,
[class*="rounded-2xl"][class*="border"]:not(button):not(a):not([role="button"]) {
  transition: border-color var(--gecis) ease-out, box-shadow var(--gecis) ease-out;
}

@media (prefers-reduced-motion: reduce) {
  button:not([data-skip-transition]),
  a:not([data-skip-transition]),
  [role="button"]:not([data-skip-transition]),
  .card-luxury,
  [class*="rounded-2xl"][class*="border"]:not(button):not(a):not([role="button"]) {
    transition: none !important;
    transform: none !important;
  }
}

img.hover-zoom,
.group:hover img.group-hover\\:scale-105 {
  transition: transform 0.3s ease-out;
}

/* ── 13. Skeleton — açık zemin ─────────────────────────────────────────── */
.skeleton-shimmer,
[class~="animate-pulse"] {
  background-color: var(--zemin-gri) !important;
  background-image: none !important;
}
`);

// ── Temizlik ────────────────────────────────────────────────────────────────
// Kullanilmayan jetonlar elendiginde secici listesinde bos parca / sarkan
// virgul kalabilir. Bos secicili kurallar tamamen atilir (gecersiz CSS olmasin).
// Virgule bolerken TIRNAK ve KOSELI PARANTEZ icini atlar:
// [class*="bg-[rgba(15," ] gibi seciciler bolunmemeli.
function seciciBol(s) {
  const parcalar = [];
  let buf = '', tirnak = null, derinlik = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (tirnak) {
      buf += c;
      if (c === tirnak && s[i - 1] !== '\\') tirnak = null;
      continue;
    }
    if (c === '"' || c === "'") { tirnak = c; buf += c; continue; }
    if (c === '[' || c === '(') { derinlik++; buf += c; continue; }
    if (c === ']' || c === ')') { derinlik--; buf += c; continue; }
    if (c === ',' && derinlik === 0) { parcalar.push(buf); buf = ''; continue; }
    buf += c;
  }
  parcalar.push(buf);
  return parcalar;
}

function temizle(css) {
  return css.replace(/([^{}]*)\{([^{}]*)\}/g, (tam, sec, govde) => {
    // Yorumlari ayir, secici listesine karistirma
    const yorumlar = (sec.match(/\/\*[\s\S]*?\*\//g) || []).join('\n');
    const secSade = sec.replace(/\/\*[\s\S]*?\*\//g, '');
    const gercek = seciciBol(secSade)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (gercek.length === 0) return yorumlar ? yorumlar + '\n' : '';
    return `${yorumlar ? yorumlar + '\n' : ''}${gercek.join(',\n')} {${govde}}`;
  });
}

const cikti = temizle(out.join('\n'));
fs.writeFileSync(process.argv[2], cikti, 'utf8');
console.log('yazildi', process.argv[2], cikti.length, 'bayt', '| kullanilan jeton:', KULLANILAN.size);
