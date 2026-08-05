/**
 * Marka işareti — açık zemine oturan sade varyant.
 *
 * NEDEN YENİ BİR İŞARET:
 * Eski lockup `/ihaleal-logo-lockup.png` koyu lacivert bir dikdörtgen zemine
 * gömülüydü; açık-minimal sayfada tek "koyu ada" olarak duruyordu (Playwright
 * ekran görüntüsüyle tespit edildi — DOM/CSS taraması bir PNG'nin içine bakamaz).
 * Şeffaf zeminli emblem `/ihaleal_com_logo.png` de çözüm değildi: 3D metalik
 * altın işleme açık zeminde okunmuyor, 1024x682 px / 116 KB boyutu 56 px'lik bir
 * kullanım için 18 kat fazla, ayrıca görselin sağ alt köşesinde bir filigran var.
 *
 * MARKA KİMLİĞİ KORUNDU: aynı üç sembol — kalkan (güvence), ev (gayrimenkul),
 * tokmak (ihale) — sadeleştirilmiş tek renk çizgiyle yeniden kuruldu.
 * Gradyan yok, 3D yok, gölge yok.
 *
 * `currentColor` kullanılır: açık zeminde lacivert, koyu bağlamda beyaz —
 * ayrı bir "light varyant" dosyası gerekmez, renk bağlamdan gelir.
 */
export function MarkaIsareti({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-marka-isareti
    >
      {/* Kalkan — güvence */}
      <path d="M32 5.5 L54 13 V30.5 C54 43 44.5 53 32 58 C19.5 53 10 43 10 30.5 V13 Z" />
      {/* Ev çatısı — gayrimenkul */}
      <path d="M22 29.5 L32 20.5 L42 29.5" />
      {/* Tokmak başı ve sapı — ihale */}
      <path d="M26.5 38.5 L34.5 34" strokeWidth={5.2} />
      <path d="M34 39.5 L41 46" />
      {/* Kürsü tablası */}
      <path d="M24 49.5 H36" />
    </svg>
  );
}
