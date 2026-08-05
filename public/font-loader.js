/**
 * Web fontlarini RENDER'I BLOKLAMADAN yukler.
 *
 * Neden: index.html'deki Google Fonts <link rel="stylesheet"> render-blocking'ti.
 * Yerel Lighthouse olcumu (mobil, medyan): font stylesheet'i tamamen cikarilinca
 * Perf 74 -> 80, FCP 4214 -> 3070 ms, LCP 4448 -> 3718 ms. Yani ilk boyama
 * fontlarin inmesini bekliyordu.
 *
 * Desen: <link ... media="print" data-font-swap> ile isaretlenen stylesheet'ler
 * tarayici tarafindan render'i bloklamadan alinir; indikten sonra burada
 * media="all" yapilir ve font devreye girer. Inline `onload` yerine harici betik
 * kullanilir cunku CSP `script-src 'self'` inline handler'a izin vermiyor.
 *
 * Duzen kaymasi (CLS): index.html'deki kritik CSS "Inter Fallback" /
 * "Plus Jakarta Sans Fallback" @font-face metriklerini (size-adjust,
 * ascent-override...) src/styles/tokens.css ile AYNI degerlerle tanimlar; ilk
 * boyama metrik uyumlu yedekle cizilir, swap aninda kayma olusmaz.
 */
(function () {
  function activateAll() {
    try {
      var links = document.querySelectorAll("link[data-font-swap]");
      for (var i = 0; i < links.length; i++) {
        links[i].media = "all";
      }
    } catch (e) {
      /* sessiz — font gelmezse metrik uyumlu yedek font kullanilir */
    }
  }

  // ONEMLI: aktivasyon `load` sonrasina birakilir.
  // media="print" iken tarayici @font-face esleme yapmaz, yani woff2 dosyalari
  // (~183 KB) HIC istenmez. media "all" olur olmaz istenirler. Bunu erken
  // yapmak (defer betiginin calistigi an) fontlari kritik JS ile ayni bant
  // genisligine sokuyordu: olcumde FCP duzeliyor ama LCP hic degismiyordu
  // (4448 -> 4456 ms). `load` sonrasina alinca fontlar ilk boyama ve LCP
  // penceresinden tamamen cikar; metin o ana kadar metrik uyumlu yedekle cizilir.
  if (document.readyState === "complete") {
    activateAll();
  } else {
    window.addEventListener("load", activateAll, { once: true });
  }
})();
