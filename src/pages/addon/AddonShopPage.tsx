import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, FileText, Flame, Star, Eye, BookOpen,
  CheckCircle2, AlertTriangle, Info, Sparkles, ScrollText, Shield,
  TrendingUp, Award, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONE_OFF_PRICES, ONE_OFF_LABELS, formatTry, type OneOffSku } from "@/lib/pricingTiers";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AddonItem {
  sku: OneOffSku;
  icon: React.ComponentType<{ className?: string }>;
  category: "rapor" | "doping" | "vitrin" | "ilan";
  shortDesc: string;
  detailDesc: string;
  highlight?: string;
  popular?: boolean;
}

const ITEMS: AddonItem[] = [
  {
    sku: "valuation_report",
    icon: FileText,
    category: "rapor",
    shortDesc: "Mülk değerleme PDF raporu",
    detailDesc:
      "SPK ekspertiz formatında değerleme. M² rayiç + bölge endeksi + emsal karşılaştırma + 5 yıllık fiyat geçmişi. 10 sayfa, Türkçe.",
    popular: true,
  },
  {
    sku: "ges_report",
    icon: Layers,
    category: "rapor",
    shortDesc: "GES (Güneş Enerji Santralı) analiz",
    detailDesc:
      "Çatı / arazi / otopark GES potansiyeli. Güneşlenme + üretim kapasitesi + ROI 5/10/20 yıl. AI öneri + 12 sayfa PDF.",
    highlight: "8 bölüm",
  },
  {
    sku: "legal_report",
    icon: ScrollText,
    category: "rapor",
    shortDesc: "Hukuki risk değerlendirme",
    detailDesc:
      "Tapu / ipotek / hac / şerh / imar uyumsuzluk taraması. Avukat onaylı format. KKA + iBuyer ön sorgu için ideal.",
  },
  {
    sku: "doping_single",
    icon: Flame,
    category: "doping",
    shortDesc: "Tek seferlik doping (24 saat)",
    detailDesc:
      "İlanı 24 saat boyunca arama+liste sonuçlarında ÜST sıraya çıkarır. Eşit doping skorunda Pro üye öncelikli.",
    popular: true,
  },
  {
    sku: "vitrin_single",
    icon: Star,
    category: "vitrin",
    shortDesc: "Vitrin (1 hafta)",
    detailDesc:
      "İlan anasayfada + ilgili bölge sayfasında 7 gün boyunca ÖNE çıkan kart olarak görünür. Vitrin slot sınırlı.",
  },
  {
    sku: "featured_auction",
    icon: Award,
    category: "vitrin",
    shortDesc: "Öne çıkan ihale (3 gün)",
    detailDesc:
      "İhale 3 gün boyunca /ihaleler Bloomberg terminalinde TOP MOVERS bölümünde ÖNCELİKLİ — bidder hareketini katlar.",
    highlight: "Pro+",
  },
  {
    sku: "extra_listing",
    icon: Eye,
    category: "ilan",
    shortDesc: "Ek ilan açma (paket dışı)",
    detailDesc:
      "Bireysel pakette 1/yıl limit aşıldıysa ek ilan satın al. Pro/Kurumsal'da gerek yok (zaten 50/sınırsız).",
  },
];

const CATEGORY_LABELS: Record<AddonItem["category"], string> = {
  rapor: "PDF Raporlar",
  doping: "İlan Doping",
  vitrin: "Vitrin / Öne Çıkar",
  ilan: "Ek İlan Kontör",
};

interface CartLine {
  sku: OneOffSku;
  qty: number;
}

export default function AddonShopPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState<AddonItem["category"] | "all">("all");
  const [expandedSku, setExpandedSku] = useState<OneOffSku | null>(null);
  // Çoklu kur — tahsilat ₺, gösterim seçili kurda referans
  const { currency, formatFromTry } = useCurrency();
  const showFx = currency !== "TRY";

  const filteredItems = useMemo(
    () => activeCategory === "all" ? ITEMS : ITEMS.filter((i) => i.category === activeCategory),
    [activeCategory],
  );

  const cartTotal = useMemo(
    () => cart.reduce((acc, l) => acc + (ONE_OFF_PRICES[l.sku] * l.qty), 0),
    [cart],
  );

  const addToCart = (sku: OneOffSku) => {
    setCart((c) => {
      const existing = c.find((l) => l.sku === sku);
      if (existing) {
        return c.map((l) => l.sku === sku ? { ...l, qty: l.qty + 1 } : l);
      }
      return [...c, { sku, qty: 1 }];
    });
  };

  const removeFromCart = (sku: OneOffSku) => {
    setCart((c) => {
      const existing = c.find((l) => l.sku === sku);
      if (!existing || existing.qty <= 1) return c.filter((l) => l.sku !== sku);
      return c.map((l) => l.sku === sku ? { ...l, qty: l.qty - 1 } : l);
    });
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const skus = cart.map((l) => `${l.sku}x${l.qty}`).join(",");
    navigate(`/odeme/baslat?addon=${encodeURIComponent(skus)}&total=${cartTotal}`);
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <h1 className="text-3xl font-normal flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-[var(--metin-ikincil)]" />
            Ek Hizmet Mağazası
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl">
            Paketinize ek olarak tek satın alabileceğiniz raporlar, doping, vitrin ve ek ilan kontörü.
            Bir kez al, ihtiyacın olduğunda kullan.
          </p>
        </div>

        {/* KATMAN 1 — Eğitici */}
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-normal text-white">Ek hizmet nedir, ne zaman gerekir?</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Aylık paket dışında <strong className="text-white">tek seferlik</strong> hizmetler. Bir mülk için
            detaylı rapor istiyorsan veya bir ilanın görünürlüğünü artırmak istiyorsan paketini değiştirmeden
            burada alabilirsin.
          </p>
          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-white mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PDF Raporlar
              </p>
              <p className="text-slate-300">Değerleme + GES + Hukuki — tek mülk için.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-white mb-1 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" /> Doping
              </p>
              <p className="text-slate-300">İlanın 24 saat liste üstüne çıkar.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-white mb-1 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" /> Vitrin
              </p>
              <p className="text-slate-300">Anasayfa + bölge 7 gün öne çıkan.</p>
            </div>
            <div className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-3">
              <p className="font-normal text-white mb-1 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Ek İlan
              </p>
              <p className="text-slate-300">Bireysel limit aşıldıysa ek kontör.</p>
            </div>
          </div>
        </div>

        {/* Kategori filtre */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-normal border ${activeCategory === "all" ? "bg-[var(--metin)] border-[var(--metin)] text-[var(--zemin)]" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
            aria-pressed={activeCategory === "all"}
          >
            Hepsi
          </button>
          {(Object.keys(CATEGORY_LABELS) as Array<AddonItem["category"]>).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-normal border ${activeCategory === cat ? "bg-[var(--metin)] border-[var(--metin)] text-[var(--zemin)]" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
              aria-pressed={activeCategory === cat}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Grid + Sepet */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Item grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const inCart = cart.find((l) => l.sku === item.sku)?.qty ?? 0;
              const isOpen = expandedSku === item.sku;
              return (
                <div
                  key={item.sku}
                  className={"rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 flex flex-col"}
                >
                  {item.popular && (
                    <span className="inline-flex items-center gap-1 self-start mb-2 px-2 py-0.5 rounded-full bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[10px] font-normal text-[var(--metin-ikincil)]">
                      <Sparkles className="h-2.5 w-2.5" /> Popüler
                    </span>
                  )}
                  {item.highlight && !item.popular && (
                    <span className="inline-flex items-center gap-1 self-start mb-2 px-2 py-0.5 rounded-full bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[10px] font-normal text-[var(--metin-ikincil)]">
                      {item.highlight}
                    </span>
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-[10px] bg-slate-800/60 p-2">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-normal text-white">{ONE_OFF_LABELS[item.sku]}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.shortDesc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedSku(isOpen ? null : item.sku)}
                    className="text-xs text-white hover:underline mb-3 flex items-center gap-1 self-start"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? "Detay gizle" : "Detay göster"}
                  </button>

                  {isOpen && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 pb-3 border-b border-slate-700">
                      {item.detailDesc}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div>
                      <p className="text-2xl font-normal text-white">{formatTry(ONE_OFF_PRICES[item.sku])}</p>
                      {showFx && (
                        <p className="text-[10px] text-slate-400">≈ {formatFromTry(ONE_OFF_PRICES[item.sku])} <span className="text-slate-500">(tahsilat ₺)</span></p>
                      )}
                      <p className="text-[10px] text-slate-500">Tek satın</p>
                    </div>
                    {inCart > 0 ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.sku)}
                          className="w-8 h-8 rounded-[3px] bg-slate-700 hover:bg-slate-600 text-white"
                          aria-label="Sepetten çıkar"
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-normal text-white min-w-[2rem] text-center">{inCart}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(item.sku)}
                          className="w-8 h-8 rounded-[3px] bg-[var(--metin)] hover:bg-white text-[var(--zemin)]"
                          aria-label="Sepete ekle"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.sku)}
                        className="bg-[var(--metin)] hover:bg-white text-[var(--zemin)]"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 me-1" />
                        Sepete ekle
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sepet (sağ taraf, sticky) */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-base font-normal text-white flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-[var(--metin-ikincil)]" /> Sepet
              </h3>

              {cart.length === 0 ? (
                <div className="empty-state text-xs">
                  <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Sepetin boş. Sol taraftan hizmet ekle.
                </div>
              ) : (
                <>
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {cart.map((line) => (
                      <li key={line.sku} className="flex items-start justify-between gap-2 text-xs border-b border-slate-700 pb-2 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-normal truncate">{ONE_OFF_LABELS[line.sku]}</p>
                          <p className="text-slate-500 text-[10px]">{formatTry(ONE_OFF_PRICES[line.sku])} × {line.qty}</p>
                        </div>
                        <p className="text-white font-normal">{formatTry(ONE_OFF_PRICES[line.sku] * line.qty)}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-[var(--cizgi)] pt-3 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-white font-normal">Toplam</span>
                      <span className="text-2xl font-normal text-white">{formatTry(cartTotal)}</span>
                    </div>
                    {showFx && (
                      <p className="text-[10px] text-slate-400 text-end">
                        ≈ {formatFromTry(cartTotal)} <span className="text-slate-500">(tahsilat ₺)</span>
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={checkout}
                    className="w-full bg-[var(--metin)] hover:bg-white text-[var(--zemin)] font-normal"
                  >
                    Ödemeye Geç (demo)
                  </Button>
                </>
              )}

              <p className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-700">
                <Shield className="inline h-2.5 w-2.5" /> 14 gün cayma + KVKK + 6493 uyum
              </p>
            </div>
          </div>
        </div>

        {/* KATMAN 4 — Güven + Uyarı */}
        <div className="rounded-[20px] border p-4 flex items-start gap-3 mt-6" style={{ borderColor: "var(--durum-uyari)", backgroundColor: "var(--durum-uyari-zemin)" }}>
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--durum-uyari)" }} />
          <div className="text-xs space-y-1.5">
            <p className="font-normal" style={{ color: "var(--durum-uyari)" }}>Demo Ödeme — Mock Akışı</p>
            <p style={{ color: "var(--durum-uyari)" }}>
              Sepet "Ödemeye Geç" butonu mock akışına yönlendirir. Gerçek ödeme entegrasyonu (iyzico / PayTR) Master hesap açınca eklenecek.
            </p>
            <p className="pt-1 border-t" style={{ color: "var(--durum-uyari)", borderColor: "var(--durum-uyari)" }}>
              Yasal: TKHK 14 gün cayma + KVKK + 6493 Ödeme + VUK 213 fatura. PDF raporlar SPK ekspertiz formatında (lisanslı eksper imzalı).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
