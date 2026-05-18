import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Home as HomeIcon,
  Landmark,
  MapPin,
  Search,
  Warehouse,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cinematicEase, staggerContainer, staggerItem } from "@/lib/motion/presets";

const STATS = [
  { label: "Toplam Açık Artırma", value: "12,458", delta: "+12.5%", icon: "📊" },
  { label: "Başarılı Satışlar", value: "3,127", delta: "+8.3%", icon: "✅" },
  { label: "Aktif Yatırımcılar", value: "10,843", delta: "+15.2%", icon: "👥" },
  { label: "Memnuniyet Oranı", value: "%98", delta: "+2.1%", icon: "⭐" },
];

const TRUST_ITEMS = [
  { title: "Kurumsal Güvenlik", text: "256-bit SSL ve Uçtan Uca Koruma", icon: "🛡️" },
  { title: "10,000+ Yatırımcı", text: "Aktif ve Doğrulanmış Profil", icon: "👥" },
  { title: "4.9 / 5 Skor", text: "Kullanıcı Memnuniyeti", icon: "⭐" },
  { title: "7/24 Destek", text: "Uzman Yatırım Danışmanlığı", icon: "🎧" },
];

const STEPS = [
  {
    no: "01",
    title: "Keşfet & Analiz Et",
    text: "Doğrulanmış gayrimenkulleri ve yapay zeka destekli raporları inceleyin.",
    icon: "🔍",
  },
  {
    no: "02",
    title: "Doğrulama Yapın",
    text: "Güvenli teklif ortamı için KYC sürecinizi dakikalar içinde tamamlayın.",
    icon: "✅",
  },
  {
    no: "03",
    title: "Teklif Verin",
    text: "Gerçek zamanlı canlı açık artırmalara katılarak adil fiyata teklif sunun.",
    icon: "💰",
  },
  {
    no: "04",
    title: "Yatırımı Tamamlayın",
    text: "Açık artırmayı kazanın ve resmi süreçleri güvenle sonuçlandırın.",
    icon: "🏆",
  },
];

const AUCTIONS = [
  {
    title: "Premium Deniz Manzaralı Villa",
    location: "Bodrum, Muğla",
    bid: "₺45,000,000",
    delta: "+12.5%",
    time: "2sa 14dk kaldı",
    bids: "18 teklif",
    tone: "villa",
  },
  {
    title: "Merkezi İş Alanında Plaza Ofisi",
    location: "Çankaya, Ankara",
    bid: "₺28,500,000",
    delta: "+8.2%",
    time: "1g 05sa kaldı",
    bids: "12 teklif",
    tone: "office",
  },
  {
    title: "Lüks Rezidans Dairesi",
    location: "Levent, İstanbul",
    bid: "₺19,250,000",
    delta: "+15.7%",
    time: "5sa 45dk kaldı",
    bids: "24 teklif",
    tone: "apartment",
  },
  {
    title: "Kentsel Dönüşüm Ticari Arsa",
    location: "Yenimahalle, Ankara",
    bid: "₺62,000,000",
    delta: "+10.3%",
    time: "3g 12sa kaldı",
    bids: "31 teklif",
    tone: "complex",
  },
];

const INVESTOR_ITEMS = [
  {
    title: "Banka Düzeyinde Güvenlik",
    text: "Yüksek standartlı veri koruma altyapısı.",
    icon: "🛡️",
  },
  {
    title: "Yapay Zeka Destekli Analiz",
    text: "Yatırım kararlarınızı rasyonel verilere dayandırın.",
    icon: "🤖",
  },
  {
    title: "Şeffaf Teklif Geçmişi",
    text: "Manipülasyondan uzak, tamamen açık ve izlenebilir süreç.",
    icon: "📄",
  },
  {
    title: "Küresel Erişim",
    text: "Dünyanın her yerinden ihalelere online katılım imkanı.",
    icon: "🌍",
  },
];

const CATEGORIES = [
  { name: "Villa", icon: HomeIcon, count: "842 ilan", href: "/ilanlar?tip=villa" },
  { name: "Daire", icon: Building2, count: "3.240 ilan", href: "/ilanlar?tip=daire" },
  { name: "Ofis", icon: Landmark, count: "1.105 ilan", href: "/ilanlar?tip=ofis" },
  { name: "Arsa", icon: MapPin, count: "620 ilan", href: "/ilanlar?tip=arsa" },
  { name: "Depo", icon: Warehouse, count: "188 ilan", href: "/ilanlar?tip=depo" },
  { name: "Komple Bina", icon: Building2, count: "94 ilan", href: "/ilanlar?tip=komple" },
];

const TESTIMONIALS = [
  {
    name: "Ayşe Korkmaz",
    role: "Kurumsal Yatırımcı",
    quote:
      "ihaleal.com üzerindeki şeffaf teklif geçmişi ve AI analizleri sayesinde portföyümü güvenle büyüttüm.",
    stars: 5,
    avatar: "https://ui-avatars.com/api/?name=Ayse+Korkmaz&background=3b82f6&color=fff",
  },
  {
    name: "Mehmet Yıldız",
    role: "Gayrimenkul Geliştirici",
    quote:
      "Canlı müzayede altyapısı hızlı, kurumsal KYC süreci net. Bodrum villamızı hedef fiyata sattık.",
    stars: 5,
    avatar: "https://ui-avatars.com/api/?name=Mehmet+Yildiz&background=0ea5e9&color=fff",
  },
  {
    name: "Zeynep Arslan",
    role: "Bireysel Alıcı",
    quote:
      "İlk dijital müzayedemde bile adım adım yönlendirildim; süreç son derece profesyoneldi.",
    stars: 5,
    avatar: "https://ui-avatars.com/api/?name=Zeynep+Arslan&background=6366f1&color=fff",
  },
];

const CHART_HEIGHTS = ["32%", "45%", "38%", "54%", "47%", "61%", "86%"];

const HERO_POSTER = "/images/hero-cinematic.jpg";
const HERO_VIDEO = "/videos/ihaleal-tanitim.mp4";

export default function PremiumCinematicHome() {
  const { t } = useLocale();
  const h = t.home.hero;
  const reduced = useReducedMotion();
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroVisualRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const heroStyle = {
    "--villa-image": `url('${HERO_POSTER}')`,
  } as CSSProperties;

  const statViewProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: cinematicEase,
      };

  return (
    <div className="premium-home" data-testid="premium-cinematic-home">
      <div className="premium-home__noise" aria-hidden="true" />
      <div className="premium-home__grid" aria-hidden="true" />

      <section className="premium-search-strip" aria-label="Müzayede arama">
        <label className="premium-search premium-search--strip">
          <Search className="premium-search__icon" aria-hidden />
          <input type="search" placeholder="Müzayede veya bölge ara..." />
        </label>
      </section>

      <section className="premium-hero" aria-labelledby="premium-hero-title">
        <motion.div
          className="premium-hero__copy"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : "hidden"}
          animate={reduced ? undefined : "show"}
        >
          <motion.div className="premium-kicker" variants={reduced ? undefined : staggerItem}>
            <span aria-hidden="true">✦</span>
            {h.badge}
            <i aria-hidden="true" />
          </motion.div>
          <motion.h1 id="premium-hero-title" variants={reduced ? undefined : staggerItem}>
            <span>{h.titleLead}</span> {h.titleAccent}
          </motion.h1>
          <motion.p className="premium-hero__lead" variants={reduced ? undefined : staggerItem}>
            {h.subtitle}
          </motion.p>
          <motion.div className="premium-hero__ctas" variants={reduced ? undefined : staggerItem}>
            <a className="premium-btn premium-btn--primary" href="/ilanlar">
              {h.ctaExplore} <span aria-hidden="true">→</span>
            </a>
            <a className="premium-btn premium-btn--glass" href="#how-it-works">
              <span className="premium-play" aria-hidden="true">
                ▶
              </span>
              {h.ctaHow}
            </a>
          </motion.div>
          <motion.div
            className="premium-trust-row"
            aria-label="Güven Parametreleri"
            variants={reduced ? undefined : staggerItem}
          >
            {TRUST_ITEMS.map((item) => (
              <article key={item.title} className="premium-trust-row__item">
                <span aria-hidden="true">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </motion.div>

        <div
          ref={heroVisualRef}
          className="premium-hero__visual premium-hero__visual--cinematic"
          style={heroStyle}
          aria-label="Lüks Gayrimenkul Görsel Alanı"
        >
          <motion.div
            className="premium-hero__media"
            style={reduced ? undefined : { y: parallaxY }}
          >
            <video
              className="premium-hero__video"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>
          <div className="premium-data-rain" aria-hidden="true" />
          <article className="premium-live-card" aria-label="Canlı Veri Özeti">
            <div className="premium-live-card__top">
              <span>Aktif Teklifler</span>
              <b>● Canlı</b>
            </div>
            <strong>284</strong>
            <p>
              <span>+%18</span> geçen aya göre artış
            </p>
            <div className="premium-chart" aria-hidden="true">
              {CHART_HEIGHTS.map((height) => (
                <i key={height} style={{ height }} />
              ))}
            </div>
            <a href="/ilanlar">Canlı İzle →</a>
          </article>
        </div>

        <aside className="premium-stat-rail" aria-label="Platform İstatistikleri">
          {STATS.map((stat) => (
            <motion.article
              key={stat.label}
              className="premium-stat-card"
              {...statViewProps}
            >
              <span className="premium-stat-card__icon" aria-hidden="true">
                {stat.icon}
              </span>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
              <b>{stat.delta}</b>
            </motion.article>
          ))}
        </aside>
      </section>

      <section className="premium-categories" aria-labelledby="premium-categories-title">
        <h2 id="premium-categories-title">Kategorilere Göre Keşfet</h2>
        <div className="premium-categories__track">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <a key={cat.name} href={cat.href} className="premium-category-card">
                <span className="premium-category-card__icon" aria-hidden>
                  <Icon className="h-6 w-6" />
                </span>
                <strong>{cat.name}</strong>
                <span className="premium-category-card__count">{cat.count}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="premium-lower" aria-label="Süreç ve Listelemeler">
        <div className="premium-main-column">
          <section
            className="premium-process"
            id="how-it-works"
            aria-labelledby="premium-process-title"
          >
            <h2 id="premium-process-title">Sistem Nasıl İşler?</h2>
            <p>Güvenli bir gayrimenkul yatırımı için izlemeniz gereken 4 kolay adım.</p>
            <div className="premium-steps">
              {STEPS.map((step) => (
                <article key={step.no} className="premium-step">
                  <div className="premium-step__icon" aria-hidden="true">
                    {step.icon}
                  </div>
                  <div>
                    <span>{step.no}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="premium-auctions" aria-labelledby="premium-auctions-title">
            <div className="premium-section-head">
              <h2 id="premium-auctions-title">Öne Çıkan Canlı Müzayedeler</h2>
              <a href="/ilanlar">Tümünü Gör →</a>
            </div>
            <motion.div className="premium-auction-grid">
              {AUCTIONS.map((auction) => (
                <article key={auction.title} className="premium-auction-card">
                  <div
                    className={`premium-auction-card__image premium-auction-card__image--${auction.tone}`}
                  >
                    <span>● CANLI</span>
                  </div>
                  <div className="premium-auction-card__body">
                    <h3>{auction.title}</h3>
                    <p>📍 {auction.location}</p>
                    <div className="premium-auction-card__bid">
                      <div>
                        <small>Mevcut En Yüksek Teklif</small>
                        <strong>{auction.bid}</strong>
                      </div>
                      <b>{auction.delta}</b>
                    </div>
                    <div className="premium-auction-card__meta">
                      <span>{auction.time}</span>
                      <span>{auction.bids}</span>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </section>
        </div>

        <aside className="premium-investor-panel" aria-labelledby="premium-trust-title">
          <h2 id="premium-trust-title">Neden ihaleal Kurumsal Altyapısı?</h2>
          <div className="premium-investor-panel__list">
            {INVESTOR_ITEMS.map((item) => (
              <article key={item.title}>
                <span aria-hidden="true">{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="premium-compliance">
            <div>
              <strong>ISO</strong>
              <span>27001 Sertifikalı</span>
            </div>
            <div>
              <strong>SOC 2</strong>
              <span>Tip II Uyumlu</span>
            </div>
            <div>
              <strong>GDPR</strong>
              <span>%100 Uyumlu</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="premium-testimonials" aria-labelledby="premium-testimonials-title">
        <h2 id="premium-testimonials-title">Yatırımcılarımız Ne Diyor?</h2>
        <div className="premium-testimonials__grid">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} className="premium-testimonial-card">
              <img src={t.avatar} alt="" className="premium-testimonial-card__avatar" />
              <div className="premium-testimonial-card__stars" aria-label={`${t.stars} yıldız`}>
                {"★".repeat(t.stars)}
              </div>
              <blockquote>{t.quote}</blockquote>
              <footer>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-cta-band" aria-labelledby="premium-cta-title">
        <h2 id="premium-cta-title">Gayrimenkul Yatırımının Geleceğine Katılın</h2>
        <p>Kurumsal güvence, yapay zeka analizi ve canlı müzayede — tek platformda.</p>
        <div className="premium-cta-band__actions">
          <a className="premium-btn premium-btn--primary" href="/kayit">
            Hemen Başla
          </a>
          <a className="premium-btn premium-btn--glass" href="/iletisim">
            Demo Talep
          </a>
        </div>
      </section>
    </div>
  );
}
