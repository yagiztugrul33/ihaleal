import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Upload, MapPin, X, FileText, Scale, Landmark, Gavel, ImageIcon, Settings2, ClipboardCheck, Rocket, ShieldCheck, TrendingUp, Eye, Home } from "lucide-react";
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
import { clientLogError } from "@/lib/clientLog";
import { PropertyAnalysisReportViewer } from "@/components/PropertyAnalysisReportViewer";
import { uploadListingPhotos, UploadUnavailableError } from "@/lib/uploadFile";
import { LocationPicker, type LocationValue } from "@/components/location/LocationPicker";
import { CATEGORY_UI_TO_DB } from "@/lib/listingCategories";

type ListingImageEntry = { file: File; preview: string };

const FEATURE_OPTIONS = ["Asansör", "Otopark", "Balkon", "Site içi", "Deniz manzarası", "Güvenlik"];

export default function CreateAuction() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const marketReportInputRef = useRef<HTMLInputElement>(null);
  const expertiseInputRef = useRef<HTMLInputElement>(null);
  const [imageEntries, setImageEntries] = useState<ListingImageEntry[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  // Harita pin koordinatları (LocationPicker'dan gelir, opsiyonel)
  const [pinLat, setPinLat] = useState<number | undefined>(undefined);
  const [pinLng, setPinLng] = useState<number | undefined>(undefined);
  // EİDS yetki/malik akışı (1 Kasım 2024'ten beri yasal zorunlu)
  const [noTitleDeed, setNoTitleDeed] = useState(false); // Tapum yok (kat irtifakı yok/TOKİ/gecekondu)
  const [foreignOwner, setForeignOwner] = useState(false); // Yabancı uyruklu malik
  const [adaParcel, setAdaParcel] = useState(""); // Ada/parsel (opsiyonel)
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
      const preview = URL.createObjectURL(file);
      setImageEntries((prev) => [...prev, { file, preview }]);
    });
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageEntries((prev) => {
      const target = prev[index];
      if (target?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, idx) => idx !== index);
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
    if (imageEntries.length === 0) {
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
      images_count: imageEntries.length,
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

    const categorySlug = CATEGORY_UI_TO_DB[category] ?? "real_estate_residential";

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
      clientLogError("CreateAuction.listings.insert", listingError);
      window.alert("İlan oluşturulamadı: " + msg);
      setError("İlan oluşturulamadı: " + msg);
      setSubmitLoading(false);
      return;
    }

    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadListingPhotos(
        imageEntries.map((entry) => entry.file),
        user.id,
        listing.id,
      );
    } catch (uploadErr) {
      const uploadMsg =
        uploadErr instanceof UploadUnavailableError
          ? uploadErr.message
          : uploadErr instanceof Error
            ? uploadErr.message
            : "Görsel yüklenemedi";
      clientLogError("CreateAuction.listingPhotos.upload", uploadErr);
      setError(`İlan oluşturuldu ancak görseller yüklenemedi: ${uploadMsg}`);
      setSubmitLoading(false);
      return;
    }

    const bodyWithImages = {
      ...baseBody,
      images: imageUrls,
      images_count: imageUrls.length,
    };

    const { error: imagesUpdateError } = await supabase
      .from("listings")
      .update({ body: bodyWithImages as unknown as Record<string, unknown> })
      .eq("id", listing.id);

    if (imagesUpdateError) {
      clientLogError("CreateAuction.listings.updateImages", imagesUpdateError);
      setError("Görseller yüklendi ancak ilan kaydına yazılamadı.");
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
      clientLogError("CreateAuction.authorizations.insert", authorizationError);
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
      clientLogError("CreateAuction.auctions.insert", auctionError);
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
      clientLogError("CreateAuction.saveReportToDb", repErr);
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

  // Anonim ziyaretçi VE/VEYA Supabase configure değil (lokal/dev) durumu —
  // tek zengin landing göster. "env eksik" yanıltıcı mesaj kaldırıldı;
  // canlıda Supabase configured, anonimliğin asıl çözümü "giriş yap"tır.
  if (!user) {
    const wizardSteps = [
      { num: 1, icon: Home, title: "Mülk Bilgileri", desc: "Tip, konum, m², oda sayısı, özellikler" },
      { num: 2, icon: ImageIcon, title: "Görseller", desc: "Foto + (opsiyonel) 360° tur" },
      { num: 3, icon: Settings2, title: "İhale Ayarları", desc: "Tip (açık/kapalı), başlangıç fiyatı, süre" },
      { num: 4, icon: ClipboardCheck, title: "Belgeler", desc: "Tapu, ekspertiz raporu (opsiyonel)" },
      { num: 5, icon: Rocket, title: "Önizleme + Yayınla", desc: "AI analiz + moderasyon kuyruğu" },
    ];
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Ana sayfa
          </Button>

          {/* h1 + intro */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] mb-4">
              <Gavel className="h-3.5 w-3.5" /> İhale Aç
            </div>
            <h1 className="text-3xl md:text-4xl font-normal text-white mb-3">5 Adımda İhale Yayınla</h1>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Gayrimenkulünüz için açık artırma, kapalı teklif veya sadece ilan modunda yayın açın.
              AI değerleme + emsal analiz + escrow güvenli ödeme — hepsi tek platformda.
            </p>
          </div>

          {/* 5 Adım kartı */}
          <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {wizardSteps.map((step, i) => (
              <div
                key={step.num}
                className="relative rounded-[20px] border border-white/10 bg-slate-900/50 p-4 hover:border-[var(--cizgi)] transition-colors"
              >
                <div className="absolute -top-3 -start-3 w-7 h-7 rounded-full bg-[var(--zemin-yumusak)] text-slate-950 font-normal text-xs flex items-center justify-center">
                  {step.num}
                </div>
                <step.icon className="w-6 h-6 text-[var(--metin-ikincil)] mb-2 mt-1" />
                <h3 className="font-normal text-white text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                {i < wizardSteps.length - 1 ? (
                  <div className="hidden lg:block absolute top-1/2 -end-2 w-4 h-0.5 bg-[var(--zemin-yumusak)]" />
                ) : null}
              </div>
            ))}
          </div>

          {/* CTA panel */}
          <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-8 text-center">
            <h2 className="text-xl md:text-2xl font-normal text-white mb-3">
              İhale açmak için hesap gerekir
            </h2>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              Hesap; KYC + tapu sahipliği doğrulamasını içerir (anti-dolandırıcılık). Hesabınız varsa giriş yapın;
              yoksa <strong className="text-white">2 dakikada</strong> hesap oluşturabilirsiniz.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/giris?next=/ihale-ac")}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] !bg-[var(--zemin-yumusak)] px-6 py-2.5 text-sm font-normal text-slate-950 transition-all hover:!bg-[var(--zemin-yumusak)]"
              >
                <Gavel className="w-4 h-4" /> Giriş Yap
              </button>
              <Button onClick={() => navigate("/kayit?next=/ihale-ac")} variant="outline" className="border-[var(--cizgi)] text-[var(--metin-ikincil)] hover:bg-[var(--zemin-yumusak)] gap-2">
                <PlusCircle className="w-4 h-4" /> Hesap Oluştur
              </Button>
            </div>
            {!isSupabaseConfigured() ? (
              <p className="mt-6 text-xs text-slate-500">
                <em>Lokal geliştirme: Supabase yapılandırması yokluğunda gerçek kayıt yapılamaz; canlı ortamda tam akış aktiftir.</em>
              </p>
            ) : null}
          </div>

          {/* Neden ihale + avantaj */}
          <div className="mt-10 grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-[20px] border border-white/10 bg-slate-900/40 p-5">
              <TrendingUp className="w-6 h-6 text-[var(--metin-ikincil)] mb-2" />
              <h3 className="font-normal text-white mb-1">Şeffaf Fiyat Keşfi</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Açık artırma ile gerçek piyasa değeri anlık ortaya çıkar; pazarlık çekişmesi yok.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-slate-900/40 p-5">
              <ShieldCheck className="w-6 h-6 text-[var(--metin-ikincil)] mb-2" />
              <h3 className="font-normal text-white mb-1">Escrow Güvencesi</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Kapora ve ödeme platformda saklanır; satış kapanmadan transfer olmaz.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-slate-900/40 p-5">
              <Eye className="w-6 h-6 text-[var(--metin-ikincil)] mb-2" />
              <h3 className="font-normal text-white mb-1">AI Değerleme + Emsal</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Yayına almadan önce AVM ile değer aralığı + bölgeden emsal otomatik raporlanır.
              </p>
            </div>
          </div>

          {/* Yardımcı linkler */}
          <div className="mt-8 text-center text-xs text-slate-500 flex flex-wrap gap-3 justify-center">
            <button type="button" className="hover:text-[var(--metin-ikincil)]" onClick={() => navigate("/komisyon-modeli")}>Komisyon modeli</button>
            <span>·</span>
            <button type="button" className="hover:text-[var(--metin-ikincil)]" onClick={() => navigate("/ihale-kosullari")}>İhale koşulları</button>
            <span>·</span>
            <button type="button" className="hover:text-[var(--metin-ikincil)]" onClick={() => navigate("/sat-basla")}>Satıcı rehberi</button>
            <span>·</span>
            <button type="button" className="hover:text-[var(--metin-ikincil)]" onClick={() => navigate("/destek")}>Destek</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" data-demo="true">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>
        <h1 className="text-3xl font-normal text-white mb-2">Gayrimenkul ilanı oluştur</h1>
        <p className="text-slate-400 mb-4">
          Üç yoldan birini seçin: <strong className="text-slate-300">sadece ilan</strong> (kartta ihaleal.com görünür — yetkili platform; doğrudan iletişim yok), <strong className="text-slate-300">teklif al</strong> veya{" "}
          <strong className="text-slate-300">ihale</strong>.
          Kayıt Supabase&apos;e yazılır; yönetici onayından sonra yayına alınır. Referans fiyat <code className="text-[var(--metin-ikincil)] text-xs">fees.ts</code> ile uyarılır.
        </p>

        {/* 5-adım yayın akışı (görsel timeline — form tek sayfa kalır, bu sadece bağlam). */}
        <div className="mb-6 rounded-[20px] border border-white/10 bg-slate-900/40 p-4">
          <p className="text-[11px] font-normal uppercase tracking-wider text-[var(--metin-ikincil)] mb-3">Yayın akışı — 5 adım</p>
          <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            {[
              { icon: Home, label: "Mülk" },
              { icon: ImageIcon, label: "Görseller" },
              { icon: Settings2, label: "İhale Ayarları" },
              { icon: ClipboardCheck, label: "Belgeler" },
              { icon: Rocket, label: "Yayınla" },
            ].map((s, i) => (
              <li key={s.label} className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-slate-200">
                  <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] text-[10px] font-normal">{i + 1}</span>
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </span>
                {i < 4 ? <span className="text-slate-600 hidden sm:inline">→</span> : null}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm text-slate-500 mb-8">
          Taslak:{" "}
          <button type="button" className="text-[var(--metin-ikincil)] hover:underline" onClick={() => navigate("/komisyon-modeli")}>
            komisyon modeli
          </button>
          {" · "}
          <button type="button" className="text-[var(--metin-ikincil)] hover:underline" onClick={() => navigate("/ihale-kosullari")}>
            ihale koşulları
          </button>
          {" · "}
          <button type="button" className="text-[var(--metin-ikincil)] hover:underline" onClick={() => navigate("/sat-basla")}>
            satıcı modu
          </button>
        </p>
        {success && (
          <div className="p-4 rounded-[20px] bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[var(--metin-ikincil)] mb-6">
            İlan moderasyon kuyruğuna alındı. İhale sayfasına yönlendiriliyorsunuz...
          </div>
        )}
        {aiPhaseLabel ? (
          <div className="p-4 rounded-[20px] bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[var(--metin-ikincil)] mb-6 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--cizgi)] border-t-transparent rounded-full animate-spin shrink-0" />
            {aiPhaseLabel}
          </div>
        ) : null}
        {error && <div className="p-4 rounded-[20px] bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[var(--metin-ikincil)] mb-6">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white">Görseller</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageEntries.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-[20px] overflow-hidden">
                    <img src={img.preview} alt="" loading="lazy" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 end-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[20px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-[var(--cizgi)] hover:bg-[var(--zemin-yumusak)] transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-500" />
                  <span className="text-xs text-slate-500">Görsel Ekle</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white">Temel Bilgiler</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-sm text-slate-400 mb-1.5 block">İlan Başlığı *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="örn: Levent'te Prestijli Plaza Katı" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Kategori (gayrimenkul türü)</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-[3px] bg-slate-950 border border-slate-200 text-white text-sm">
                    <option>Konut</option>
                    <option>Ticari</option>
                    <option>Arsa</option>
                    <option>Villa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İşlem türü</label>
                  <select value={dealType} onChange={(e) => setDealType(e.target.value as "sale" | "rent")} className="w-full px-3 py-2 rounded-[3px] bg-slate-950 border border-slate-200 text-white text-sm">
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
                  className="w-full px-3 py-2 rounded-[3px] bg-slate-950 border border-slate-200 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[var(--cizgi)]"
                  placeholder="Gayrimenkulünüzün detaylı açıklaması..."
                />
                <p className="text-[11px] text-slate-600 mt-1">{description.length}/2000</p>
              </div>
              {/* EİDS — Taşınmaz numarası + yetki/malik akışı (yasal zorunlu) */}
              <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-normal text-[var(--metin-ikincil)]">Taşınmaz No / Tapu Bilgisi (EİDS)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      1 Kasım 2024'ten beri ilanlarda <strong className="text-[var(--metin-ikincil)]">Elektronik İlan Doğrulama Sistemi (EİDS)</strong>
                      yetki/malik doğrulaması yasal zorunluluktur. Taşınmaz numaranızı e-Devlet
                      <span className="font-mono text-[var(--metin-ikincil)]"> Tapu Bilgileri Sorgulama</span> hizmetinden veya yeni tapu senedinizden bulabilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400 block">Taşınmaz numarası</label>
                  <Input
                    value={titleDeed}
                    onChange={(e) => setTitleDeed(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="Örn: 1234567 (e-Devlet Tapu Bilgileri Sorgulama)"
                    disabled={noTitleDeed}
                    required={!noTitleDeed && !foreignOwner}
                  />
                  <p className="text-[10px] text-slate-500">Bu numara EİDS doğrulaması içindir. Resmî entegrasyon Ticaret Bakanlığı başvurusu sonrası aktiftir.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-[3px] border border-slate-700 hover:border-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={noTitleDeed}
                      onChange={(e) => setNoTitleDeed(e.target.checked)}
                    />
                    <span><strong className="text-slate-200">Tapum yok</strong> — Kat irtifakı yok / TOKİ / gecekondu / hisseli (özel durum: avukat onayı şart)</span>
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-[3px] border border-slate-700 hover:border-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={foreignOwner}
                      onChange={(e) => setForeignOwner(e.target.checked)}
                    />
                    <span><strong className="text-slate-200">Yabancı uyruklu malik</strong> — T.C. vatandaşı değil (ek belge gerekli)</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1.5">Ada / Parsel (opsiyonel)</label>
                  <Input
                    value={adaParcel}
                    onChange={(e) => setAdaParcel(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="Örn: 1234 ada 56 parsel"
                  />
                </div>

                <p className="text-[10px] text-slate-500 italic border-t border-[var(--cizgi)] pt-2">
                  <strong>Dürüst not:</strong> EİDS otomatik doğrulama için Ticaret Bakanlığı yetkili kuruluş başvurusu (Master aksiyonu) gerekir.
                  Şu an beyan modelidir — yanlış beyan halinde hesap kısıtı + cezai şart sözleşmede.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zemin-yumusak)] border-[var(--cizgi)]">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white">Nasıl satacak / kiralayacaksınız?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Her üç modda da ilanda <strong className="text-slate-300">ihaleal.com</strong> yetkili görünür; taraf telefonu yok.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {(["listing_only", "sealed_offers", "auction"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex flex-col gap-2 p-4 rounded-[20px] border cursor-pointer transition-colors ${
                      marketingMode === mode ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)]" : "border-slate-200 bg-white/[0.02]"
                    }`}
                  >
                    <input type="radio" name="marketingMode" className="sr-only" checked={marketingMode === mode} onChange={() => setMarketingMode(mode)} />
                    <span className="text-sm font-normal text-white">{MARKETING_MODE_LABELS[mode].headline}</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed">{MARKETING_MODE_LABELS[mode].hint}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--metin-ikincil)]" /> Konum
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                81 il dropdown'undan seçin; haritada pin'i tam konumun üzerine sürükleyin. Mahalle/sokak için harita yeterlidir
                (kesin koordinat). Ücretsiz OpenStreetMap kullanılır.
              </p>
              <LocationPicker
                value={{
                  province: city,
                  district,
                  lat: pinLat,
                  lng: pinLng,
                  formattedAddress: neighborhood || (district ? `${district}, ${city}` : city),
                }}
                onChange={(loc: LocationValue) => {
                  if (loc.province !== undefined) setCity(loc.province ?? "");
                  if (loc.district !== city) setDistrict(loc.district ?? "");
                  setPinLat(loc.lat);
                  setPinLng(loc.lng);
                }}
                showMap
                showSearch
              />
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Mahalle / cadde / sokak (opsiyonel)</label>
                <Input
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="bg-slate-950 border-slate-200 text-white"
                  placeholder="Mahalle adı veya cadde — harita pin'i ile birlikte"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white">Teknik detaylar</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">m² (brüt)</label>
                  <Input value={sizeM2} onChange={(e) => setSizeM2(e.target.value)} className="bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Oda</label>
                  <Input value={rooms} onChange={(e) => setRooms(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="örn: 3+1" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Banyo</label>
                  <Input type="number" min={0} value={bathCount} onChange={(e) => setBathCount(e.target.value)} className="bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Yapım yılı</label>
                  <Input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className="bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Bulunduğu kat</label>
                  <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} className="bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Toplam kat</label>
                  <Input type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} className="bg-slate-950 border-slate-200 text-white" />
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
                        featuresSelected.includes(f) ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]" : "border-slate-200 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white">Fiyat ve süre</h3>
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
                  <Input type="number" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} className="bg-slate-950 border-slate-200 text-white" placeholder="örn: 2500000" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Referans / rezerv (₺)</label>
                  <Input
                    type="number"
                    value={referenceValueTRY}
                    onChange={(e) => setReferenceValueTRY(e.target.value)}
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="İsteğe bağlı — uyarı için"
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Doldurursanız uyarı denetimi ve rezerv fiyatı olarak kaydedilir.</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">İhale Süresi</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 rounded-[3px] bg-slate-950 border border-slate-200 text-white text-sm">
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
                    className="bg-slate-950 border-slate-200 text-white"
                    placeholder="Örn: başlangıçtan %30–40 yüksek — ilan erken kapanabilir"
                  />
                  <p className="text-[11px] text-slate-600 mt-1">Doldurursanız rapor onayı sonrası uyarı gösterilir ve kayda yazılır.</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Minimum Artış</label>
                  <select className="w-full px-3 py-2 rounded-[3px] bg-slate-950 border border-slate-200 text-white text-sm">
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

          <Card className="bg-[var(--zemin-yumusak)] border-[var(--cizgi)]">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--metin-ikincil)]" />
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
                    <input type="checkbox" checked={expertiseRequired} onChange={(e) => setExpertiseRequired(e.target.checked)} className="rounded-[3px] border-white/20" />
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
                <input type="checkbox" checked={officialDocumentsForBuyer} onChange={(e) => setOfficialDocumentsForBuyer(e.target.checked)} className="mt-1 rounded-[3px] border-white/20" />
                <span>
                  <Landmark className="w-4 h-4 text-[var(--metin-ikincil)] inline me-1 align-text-bottom" />
                  Belediye / imar planı özeti alıcıya gösterilecek.
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="bg-[var(--zemin-yumusak)] border-[var(--cizgi)]">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-normal text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[var(--metin-ikincil)]" />
                Taahhüt limitleri
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt alt limit (₺)</label>
                  <Input value={commitmentFloorTRY} onChange={(e) => setCommitmentFloorTRY(e.target.value)} className="bg-slate-950 border-slate-200 text-white" disabled={!bindingCommitmentAccepted} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt üst limit (₺)</label>
                  <Input value={commitmentCeilingTRY} onChange={(e) => setCommitmentCeilingTRY(e.target.value)} className="bg-slate-950 border-slate-200 text-white" disabled={!bindingCommitmentAccepted} />
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={bindingCommitmentAccepted} onChange={(e) => setBindingCommitmentAccepted(e.target.checked)} className="mt-1 rounded-[3px] border-white/20" />
                <span>Taahhüt metnini okudum (kayıt amaçlı; hukuki taahhüt değildir).</span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" disabled={submitLoading} className="w-full [background:var(--gradient-cta)] hover:brightness-110 text-white font-normal h-12 text-base disabled:opacity-60">
            <PlusCircle className="w-5 h-5 me-2" />
            {submitLoading ? (aiPhaseLabel || "Kaydediliyor...") : "İlanı kaydet ve yayınla"}
          </Button>
        </form>

        <Dialog open={sellerReportModalOpen} onOpenChange={setSellerReportModalOpen}>
          <DialogContent className="bg-white border-[var(--cizgi)] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-normal">Satıcı AI analiz özeti</DialogTitle>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Yayına çıkmadan önce raporu inceleyin. Onaylamadan ilan moderasyon kuyruğuna gönderilmez (taslak kalır).
              </p>
            </DialogHeader>
            {sellerReportRow ? (
              <div className="space-y-3">
                {(sellerReportRow.overall_risk_score != null && sellerReportRow.overall_risk_score > 7) ||
                (Array.isArray(sellerReportRow.overall_red_flags) && sellerReportRow.overall_red_flags.length > 0) ? (
                  <div className="p-3 rounded-[20px] bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] text-[var(--metin-ikincil)] text-sm">
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
          <DialogContent className="bg-white border-[var(--cizgi)] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Hemen Al fiyatı</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bu fiyatla ilan <strong className="text-[var(--metin-ikincil)]">erken kapanabilir</strong> (alıcı Hemen Al kullanırsa). Stratejinizi gözden geçirin.
            </p>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => setBuyNowWarnOpen(false)}>
                Geri
              </Button>
              <Button type="button" className="[background:var(--gradient-cta)] text-white" onClick={() => void finalizeSellerApprove()}>
                Anladım — onayla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
