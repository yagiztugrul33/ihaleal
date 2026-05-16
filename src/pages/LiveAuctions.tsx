import { Link } from "react-router-dom";
import { Auctions } from "@/sections/Auctions";

/** Tam sayfa "Canlı İhaleler" — Navbar ile uyumlu; içerik `Auctions` bölümünü kullanır. */
export default function LiveAuctions() {
  return (
    <div className="min-h-screen pt-16" style={{ background: "var(--color-bg)" }}>
      <section className="hero-warm py-16 md:py-22">
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-6 flex justify-center">
            <span className="badge-corp">Canlı İhaleler</span>
          </div>

          <h1
            className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-display)" }}
          >
            Gerçek piyasa,
            <br />
            <span style={{ color: "var(--color-primary)" }}>gerçek fiyat.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg md:text-xl"
            style={{ color: "var(--color-text-muted)" }}
          >
            İhaleal Endeks&apos;i ile teklif yoğunluğunu, bölge fiyat aralığını ve AI destekli
            yatırım sinyallerini tek ekranda görün. Şeffaf canlı artırma, doğrulanmış ilan, anti-snipe
            koruması.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="#auctions" className="btn-primary">
              Canlı İhaleleri Gör
            </a>
            <Link to="/nasil-calisir" className="btn-ghost">
              Nasıl Çalışır?
            </Link>
          </div>

          <p
            className="mx-auto mt-12 max-w-xl text-xs leading-relaxed sm:text-sm"
            style={{ color: "var(--color-text-light)" }}
          >
            * Gösterilen veriler bilgilendirme amaçlıdır. Yatırım kararları için profesyonel
            danışmanlık alınız.
          </p>
        </div>
      </section>

      <Auctions hideIntro layout="page" />
    </div>
  );
}
