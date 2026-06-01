/**
 * Vercel preview deployment'lar için robots noindex enjekte eder.
 * Sadece ihaleal.com / www.ihaleal.com DEĞİL ise çalışır.
 *
 * Önceden index.html'de inline script idi — CSP `script-src 'self'` ile
 * uyumlu olması için harici .js dosyaya taşındı. Master 2026-06-01.
 */
(function () {
  try {
    var h = location.hostname;
    if (h && h !== "ihaleal.com" && h !== "www.ihaleal.com") {
      var m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
  } catch (e) {
    /* sessiz */
  }
})();
