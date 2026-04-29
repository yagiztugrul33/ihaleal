import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Upload, MapPin, X, FileText, Scale, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FEE_TEXTS, calcSellerNet, listingPriceAnomalyMessage, MEMBERSHIP_DURATION_DAYS } from "@/lib/fees";
import type { PropertyMarketingMode } from "@/types/auction";
import { MARKETING_MODE_LABELS } from "@/lib/listingPolicy";
import { invalidateAuctionsCatalogCache } from "@/lib/auctionsSource";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateMockReport, saveReportToDb, type PropertyAnalysisReportRecord } from "@/lib/aiAnalysis";
import { PropertyAnalysisReportViewer } from "@/components/PropertyAnalysisReportViewer";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep"];
const DISTRICTS: Record<string, string[]> = {
  İstanbul: ["Şişli", "Beşiktaş", "Kadıköy", "Ataşehir", "Üsküdar", "Beyoğlu", "Fatih"],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak"],
  İzmir: ["Konak", "Karşıyaka", "Bornova", "Buca"],
};

/** Gayrimenkul türü UI → DB category slug */
const CATEGORY_TO_DB: Record<string, string> = {
  Konut: "real_estate_residential",
  Ticari: "real_estate_commercial",
  Arsa: "real_estate_land",
  Villa: "real_estate_residential",
};

const FEATURE_OPTIONS = ["Asansör", "Otopark", "Balkon", "Site içi", "Deniz manzarası", "Güvenlik"];

export default function CreateAuction() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const marketReportInputRef = useRef<HTMLInputElement>(null);
  const expertiseInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [referenceValueTRY, setReferenceValueTRY] = useState("");
  const [duration, setDuration] = useState("7");
  const [category, setCategory] = useState("Konut");
  const [dealType, setDealType] = useState<"sale" | "rent">("sale");
  const [marketingMode, setMarketingMode] = useState<PropertyMarketingMode>("auction");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [marketReportPdfName, setMarketReportPdfName] = useState("");
  const [expertisePdfName, setExpertisePdfName] = useState("");
  const [expertiseRequired, setExpertiseRequired] = useState(true);
  const [commitmentFloorTRY, setCommitmentFloorTRY] = useState("");
  const [commitmentCeilingTRY, setCommitmentCeilingTRY] = useState("");
  const [bindingCommitmentAccepted, setBindingCommitmentAccepted] = useState(false);
  const [officialDocumentsForBuyer, setOfficialDocumentsForBuyer] = useState(false);
  const [titleDeed, setTitleDeed] = useState("");
  const [buyNowPriceTry, setBuyNowPriceTry] = useState("");
  const [sellerReportModalOpen, setSellerReportModalOpen] = useState(false);
  const [buyNowWarnOpen, setBuyNowWarnOpen] = useState(false);
  const [sellerReportRow, setSellerReportRow] = useState<PropertyAnalysisReportRecord | null>(null);
  const [pendingCtx, setPendingCtx] = useState<{ listingId: string; auctionId: string } | null>(null);
  const [aiPhaseLabel, setAiPhaseLabel] = useState("");

  const [sizeM2, setSizeM2] = useState("120");
  const [rooms, setRooms] = useState("3+1");
  const [bathCount, setBathCount] = useState("1");
  const [floor, setFloor] = useState("2");
  const [totalFloors, setTotalFloors] = useState("5");
  const [yearBuilt, setYearBuilt] = useState("2018");
  const [featuresSelected, setFeaturesSelected] = useState<string[]>(() => [...FEATURE_OPTIONS.slice(0, 3)]);

  const feePreview = useMemo(() => {
    const n = parseInt(startingBid, 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return calcSellerNet(n);
  }, [startingBid]);

  const toggleFeature = (f: string) => {
    setFeaturesSelected((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("Önce giriş yapmalısınız.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırması yok (.env.local).");
      return;
    }
    if (!title.trim() || !description.trim() || !district || !startingBid) {
      setError("Tüm zorunlu alanları doldurun.");
      return;
    }
    if (description.trim().length > 2000) {
      setError("Açıklama en fazla 2000 karakter olabilir.");
      return;
    }
    if (images.length === 0) {
      setError("En az bir görsel yükleyin.");
      return;
    }
    if (expertiseRequired && !expertisePdfName.trim()) {
      setError(
        "SPK uzmanı ekspertiz zorunlu iken PDF seçilmedi: «Ekspertiz PDF» ile dosya seçin veya «SPK uzmanı ekspertiz raporu zorunlu» kutusunu kaldırın.",
      );
      return;
    }
    if (bindingCommitmentAccepted) {
      const lo = parseInt(commitmentFloorTRY.replace(/\s/g, ""), 10);
      const hi = parseInt(commitmentCeilingTRY.replace(/\s/g, ""), 10);
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo <= 0 || hi <= 0 || hi <= lo) {
        setError("Taahhüt için geçerli alt ve üst limit girin (üst > alt).");
        return;
      }
    }
    const startNum = parseFloat(String(startingBid).replace(/\s/g, ""));
    if (!Number.isFinite(startNum) || startNum <= 0) {
      setError("Geçerli bir başlangıç fiyatı girin.");
      return;
    }
    const refTrim = referenceValueTRY.trim();
    if (refTrim) {
      const refNum = parseFloat(refTrim.replace(/\s/g, ""));
      const warn = listingPriceAnomalyMessage(Math.round(startNum), Math.round(refNum));
      if (warn) {
        setError(warn);
        return;
      }
    }

    if (!titleDeed.trim()) {
      setError("Tapu numarası veya tapu referansı girin.");
      return;
    }

    const reserveParsed = refTrim ? parseFloat(refTrim.replace(/\s/g, "")) : null;
    const negotiationMode = marketingMode === "sealed_offers" ? "sealed_offer" : "auction";
    const priceEvent =
      marketingMode === "listing_only"
        ? "İlan yayını"
        : marketingMode === "sealed_offers"
          ? "Teklif dönemi başlangıç"
          : "İhale açılış";

    const startsAt = new Date();
    const endsAt = new Date(Date.now() + parseInt(duration, 10) * 86400000);
    const desc = description.trim().slice(0, 2000);

    const baseBody = {
      description: desc,
      neighborhood: neighborhood.trim() || undefined,
      size_m2: parseInt(sizeM2, 10) || undefined,
      rooms,
      bath_count: parseInt(bathCount, 10) || undefined,
      floor: parseInt(floor, 10) || undefined,
      total_floors: parseInt(totalFloors, 10) || undefined,
      year_built: parseInt(yearBuilt, 10) || undefined,
      features: featuresSelected,
      deal_type: dealType,
      marketing_mode: marketingMode,
      negotiation_mode: negotiationMode,
      images_count: images.length,
      market_report_pdf: marketReportPdfName.trim() || undefined,
      expertise_pdf: expertisePdfName.trim() || undefined,
      expertise_required: expertiseRequired,
      commitment_floor_try: bindingCommitmentAccepted ? parseInt(commitmentFloorTRY.replace(/\s/g, ""), 10) || undefined : undefined,
      commitment_ceiling_try: bindingCommitmentAccepted ? parseInt(commitmentCeilingTRY.replace(/\s/g, ""), 10) || undefined : undefined,
      binding_commitment: bindingCommitmentAccepted || undefined,
      official_documents_for_buyer: officialDocumentsForBuyer || undefined,
      reference_value_try: refTrim ? parseFloat(refTrim.replace(/\s/g, "")) || undefined : undefined,
      price_history: [{ date: new Date().toISOString().split("T")[0], price: Math.round(startNum), event: priceEvent }],
      legacy_preview: {
        estimated_value_hint: Math.round(startNum * 1.2),
        ai_predicted_hint: Math.round(startNum * 1.15),
      },
    };

    setSubmitLoading(true);

    const { data: membershipRow } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "seller_yearly")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!membershipRow) {
      setError("Aktif satıcı üyeliğiniz yok. Önce yıllık üyelik alın.");
      setSubmitLoading(false);
      navigate("/uyelik/yillik");
      return;
    }

    const categorySlug = CATEGORY_TO_DB[category] ?? "real_estate_residential";

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        title: title.trim(),
        body: baseBody as unknown as Record<string, unknown>,
        category: categorySlug,
        city,
        district,
        start_price_try: startNum,
        reserve_price_try: reserveParsed !== null && Number.isFinite(reserveParsed) ? reserveParsed : null,
        status: "draft",
        buy_now_price_try: null,
        is_demo: false,
      })
      .select()
      .single();

    if (listingError || !listing) {
      const msg = listingError?.message ?? "bilinmeyen hata";
      console.error("[CreateAuction] listings.insert", listingError);
      window.alert("İlan oluşturulamadı: " + msg);
      setError("İlan oluşturulamadı: " + msg);
      setSubmitLoading(false);
      return;
    }

    const authExpires = new Date(Date.now() + MEMBERSHIP_DURATION_DAYS * 86400000).toISOString();
    const { error: authorizationError } = await supabase.from("authorizations").insert({
      property_title_deed: titleDeed.trim(),
      owner_id: user.id,
      listing_id: listing.id,
      signed_at: new Date().toISOString(),
      expires_at: authExpires,
      signed_via: "e_devlet",
      status: "pending",
    });
    if (authorizationError) {
      console.error("[CreateAuction] authorizations.insert", authorizationError);
      window.alert("Yetki kaydı oluşturulamadı: " + authorizationError.message);
      setError("Yetki kaydı oluşturulamadı: " + authorizationError.message);
      setSubmitLoading(false);
      return;
    }

    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .insert({
        listing_id: listing.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "scheduled",
      })
      .select()
      .single();

    if (auctionError || !auction) {
      const msg = auctionError?.message ?? "bilinmeyen hata";
      console.error("[CreateAuction] auctions.insert", auctionError);
      window.alert("İhale oluşturulamadı: " + msg);
      setError("İhale oluşturulamadı: " + msg);
      setSubmitLoading(false);
      return;
    }

    invalidateAuctionsCatalogCache();
    setAiPhaseLabel("AI analiz hazırlanıyor...");
    const mock = generateMockReport({
      listingId: listing.id,
      titleHint: title.trim(),
      cityHint: city,
      districtHint: district,
      startPriceTry: startNum,
    });
    const { data: savedReport, error: repErr } = await saveReportToDb(supabase, listing.id, mock);
    setAiPhaseLabel("");
    if (repErr || !savedReport) {
      console.error("[CreateAuction] saveReportToDb", repErr);
      window.alert(
        "AI raporu kaydedilemedi (Supabase migration / tablo eksik olabilir). İlan taslak olarak kayıtlıdır.",
      );
      setSubmitLoading(false);
      return;
    }
    setSellerReportRow(savedReport);
    setPendingCtx({ listingId: listing.id, auctionId: auction.id });
    setSellerReportModalOpen(true);
    setSubmitLoading(false);
  };

  const finalizeSellerApprove = async () => {
    if (!pendingCtx || !user) return;
    const trimmed = buyNowPriceTry.trim();
    const bn = trimmed ? parseFloat(trimmed.replace(/\s/g, "")) : NaN;
    const bnOk = trimmed && Number.isFinite(bn) && bn > 0 ? bn : null;
    const { error } = await supabase
      .from("listings")
      .update({
        status: "review",
        seller_report_approved_at: new Date().toISOString(),
        buy_now_price_try: bnOk,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pendingCtx.listingId)
      .eq("seller_id", user.id);
    if (error) {
      window.alert("Onay kaydedilemedi: " + error.message);
      return;
    }
    setBuyNowWarnOpen(false);
    setSellerReportModalOpen(false);
    setSuccess(true);
    setTimeout(() => navigate(`/ihale/${pendingCtx.auctionId}`), 600);
  };

  const handleApproveSellerReport = () => {
    const trimmed = buyNowPriceTry.trim();
    const bn = trimmed ? parseFloat(trimmed.replace(/\s/g, "")) : NaN;
    if (trimmed && Number.isFinite(bn) && bn > 0) {
      setBuyNowWarnOpen(true);
      return;
    }
    void finalizeSellerApprove();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-slate-400">Yükleniyor...</p>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <PlusCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">İlan kaydı için Supabase ortam değişkenleri (.env.local) gerekli.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <PlusCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">İhale açmak için giriş yapmanız gerekiyor.</p>
          <Button onClick={() => navigate("/giris")} className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Gayrimenkul ilanı oluştur</h1>
        <p className="text-slate-400 mb-3">
          Üç yoldan birini seçin: <strong className="text-slate-300">sadece ilan</strong> (kartta ihaleal.com — RE/MAX danışman kartı gibi), <strong className="text-slate-300">teklif al</strong> veya{" "}
          <strong className="text-slate-300">ihale</strong>.
          Kayıt Supabase&apos;e yazılır; yönetici onayından sonra yayına alınır. Referans fiyat <code className="text-teal-400/90 text-xs">fees.ts</code> ile uyarılır.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Taslak:{" "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/komisyon-modeli")}>
            komisyon modeli
          </button>
          {" · "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/ihale-kosullari")}>
            ihale koşulları
          </button>
          {" · "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/sat-basla")}>
            satıcı modu
          </button>
        </p>
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
            İlan moderasyon kuyruğuna alındı. İhale sayfasına yönlendiriliyorsunuz...
          </div>
        )}
        {aiPhaseLabel ? (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-200 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
            {aiPhaseLabel}
          </div>
        ) : null}
        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-6">
          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Görseller</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-500" />
                  <span className="text-xs text-slate-500">Görsel Ekle</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Temel Bilgiler</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-sm text-slate-400 mb-1.5 block">İlan Başlığı *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="örn: Levent'te Prestijli Plaza Katı" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Kategori (gayrimenkul türü)</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">
                    <option>Konut</option>
                    <option>Ticari</option>
                    <option>Arsa</option>
                    <option>Villa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İşlem türü</label>
                  <select value={dealType} onChange={(e) => setDealType(e.target.value as "sale" | "rent")} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">
                    <option value="sale">Satılık</option>
                    <option value="rent">Kiralık</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Açıklama * (en fazla 2000 karakter)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Gayrimenkulünüzün detaylı açıklaması..."
                />
                <p className="text-[11px] text-slate-600 mt-1">{description.length}/2000</p>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Tapu numarası / referans *</label>
                <Input
                  value={titleDeed}
                  onChange={(e) => setTitleDeed(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white"
                  placeholder="Yetki kaydı ve doğrulama için"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-500/5 border-violet-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Nasıl satacak / kiralayacaksınız?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Her üç modda da ilanda <strong className="text-slate-300">ihaleal.com</strong> yetkili görünür; taraf telefonu yok.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {(["listing_only", "sealed_offers", "auction"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${
                      marketingMode === mode ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <input type="radio" name="marketingMode" className="sr-only" checked={marketingMode === mode} onChange={() => setMarketingMode(mode)} />
                    <span className="text-sm font-semibold text-white">{MARKETING_MODE_LABELS[mode].headline}</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed">{MARKETING_MODE_LABELS[mode].hint}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Konum
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İl</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setDistrict("");
                    }}
                    className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İlçe *</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">
                    <option value="">Seçin</option>
                    {(DISTRICTS[city] || []).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Mahalle</label>
                  <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="Mahalle adı" />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/5 h-48 bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Harita entegrasyonu yakında</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Teknik detaylar</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">m² (brüt)</label>
                  <Input value={sizeM2} onChange={(e) => setSizeM2(e.target.value)} className="bg-slate-950 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Oda</label>
                  <Input value={rooms} onChange={(e) => setRooms(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="örn: 3+1" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Banyo</label>
                  <Input type="number" min={0} value={bathCount} onChange={(e) => setBathCount(e.target.value)} className="bg-slate-950 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Yapım yılı</label>
                  <Input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className="bg-slate-950 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Bulunduğu kat</label>
                  <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} className="bg-slate-950 border-white/10 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Toplam kat</label>
                  <Input type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} className="bg-slate-950 border-white/10 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Özellikler (çoklu)</p>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        featuresSelected.includes(f) ? "border-teal-500/50 bg-teal-500/15 text-teal-100" : "border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Fiyat ve süre</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {FEE_TEXTS.sellerSummary()} · {FEE_TEXTS.refundWindow()} · {FEE_TEXTS.payoutHold()}
                {feePreview ? (
                  <span className="block mt-2 text-slate-400">
                    Tahmini satıcı neti: ₺{feePreview.net.toLocaleString("tr-TR")} (komisyon ₺{feePreview.commission.toLocaleString("tr-TR")} + KDV ₺
                    {feePreview.vatOnCommission.toLocaleString("tr-TR")})
                  </span>
                ) : null}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Başlangıç Fiyatı (₺) *</label>
                  <Input type="number" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="örn: 2500000" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Referans / rezerv (₺)</label>
                  <Input
                    type="number"
                    value={referenceValueTRY}
                    onChange={(e) => setReferenceValueTRY(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white"
                    placeholder="İsteğe bağlı — uyarı için"
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Doldurursanız uyarı denetimi ve rezerv fiyatı olarak kaydedilir.</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İhale Süresi</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">
                    <option value="3">3 Gün</option>
                    <option value="7">7 Gün</option>
                    <option value="14">14 Gün</option>
                    <option value="30">30 Gün</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Hemen Al fiyatı (₺, isteğe bağlı)</label>
                  <Input
                    type="number"
                    value={buyNowPriceTry}
                    onChange={(e) => setBuyNowPriceTry(e.target.value)}
                    className="bg-slate-950 border-white/10 text-white"
                    placeholder="Örn: başlangıçtan %30–40 yüksek — ilan erken kapanabilir"
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Doldurursanız rapor onayı sonrası uyarı gösterilir ve kayda yazılır.</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Minimum Artış</label>
                  <select className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">
                    <option>₺10.000</option>
                    <option>₺50.000</option>
                    <option>₺100.000</option>
                    <option>₺250.000</option>
                    <option>₺500.000</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-teal-500/5 border-teal-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Raporlar ve ekspertiz
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">Demo ortamda yalnızca dosya adı saklanır.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Piyasa raporu (PDF)</label>
                  <input ref={marketReportInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setMarketReportPdfName(e.target.files?.[0]?.name || "")} />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="border-white/15 text-slate-200 shrink-0" onClick={() => marketReportInputRef.current?.click()}>
                      PDF seç
                    </Button>
                    <span className="text-xs text-slate-500 self-center truncate">{marketReportPdfName || "—"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 flex items-center gap-2 cursor-help w-fit">
                    <input type="checkbox" checked={expertiseRequired} onChange={(e) => setExpertiseRequired(e.target.checked)} className="rounded border-white/20" />
                    SPK uzmanı ekspertiz raporu zorunlu
                  </label>
                  <input ref={expertiseInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => setExpertisePdfName(e.target.files?.[0]?.name || "")} />
                  <div className="flex gap-2 mt-1">
                    <Button type="button" variant="outline" className="border-white/15 text-slate-200 shrink-0" onClick={() => expertiseInputRef.current?.click()}>
                      Ekspertiz PDF
                    </Button>
                    <span className="text-xs text-slate-500 self-center truncate">{expertisePdfName || "—"}</span>
                  </div>
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={officialDocumentsForBuyer} onChange={(e) => setOfficialDocumentsForBuyer(e.target.checked)} className="mt-1 rounded border-white/20" />
                <span>
                  <Landmark className="w-4 h-4 text-sky-400 inline mr-1 align-text-bottom" />
                  Belediye / imar planı özeti alıcıya gösterilecek.
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Taahhüt limitleri
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt alt limit (₺)</label>
                  <Input value={commitmentFloorTRY} onChange={(e) => setCommitmentFloorTRY(e.target.value)} className="bg-slate-950 border-white/10 text-white" disabled={!bindingCommitmentAccepted} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt üst limit (₺)</label>
                  <Input value={commitmentCeilingTRY} onChange={(e) => setCommitmentCeilingTRY(e.target.value)} className="bg-slate-950 border-white/10 text-white" disabled={!bindingCommitmentAccepted} />
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={bindingCommitmentAccepted} onChange={(e) => setBindingCommitmentAccepted(e.target.checked)} className="mt-1 rounded border-white/20" />
                <span>Taahhüt metnini okudum (kayıt amaçlı; hukuki taahhüt değildir).</span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" disabled={submitLoading} className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-12 text-base disabled:opacity-60">
            <PlusCircle className="w-5 h-5 mr-2" />
            {submitLoading ? (aiPhaseLabel || "Kaydediliyor...") : "İlanı kaydet ve yayınla"}
          </Button>
        </form>

        <Dialog open={sellerReportModalOpen} onOpenChange={setSellerReportModalOpen}>
          <DialogContent className="bg-[#0c1629] border-cyan-400/25 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Satıcı AI analiz özeti</DialogTitle>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Yayına çıkmadan önce raporu inceleyin. Onaylamadan ilan moderasyon kuyruğuna gönderilmez (taslak kalır).
              </p>
            </DialogHeader>
            {sellerReportRow ? (
              <div className="space-y-3">
                {(sellerReportRow.overall_risk_score != null && sellerReportRow.overall_risk_score > 7) ||
                (Array.isArray(sellerReportRow.overall_red_flags) && sellerReportRow.overall_red_flags.length > 0) ? (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/35 text-red-100 text-sm">
                    Bu fiyatla satılma şansı düşük olabilir — fiyatı düşürmenizi öneririz (mock bilgilendirme). Kırmızı bayraklar raporda listelenmiştir.
                  </div>
                ) : null}
                <PropertyAnalysisReportViewer
                  report={sellerReportRow}
                  mockBanner
                  showApproveButton
                  onApprove={handleApproveSellerReport}
                />
              </div>
            ) : null}
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setSellerReportModalOpen(false)}>
                Şimdilik kapat (taslak)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={buyNowWarnOpen} onOpenChange={setBuyNowWarnOpen}>
          <DialogContent className="bg-[#0c1629] border-amber-400/25 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Hemen Al fiyatı</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bu fiyatla ilan <strong className="text-amber-200">erken kapanabilir</strong> (alıcı Hemen Al kullanırsa). Stratejinizi gözden geçirin.
            </p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setBuyNowWarnOpen(false)}>
                Geri
              </Button>
              <Button type="button" className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white" onClick={() => void finalizeSellerApprove()}>
                Anladım — onayla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
