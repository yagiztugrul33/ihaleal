import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Upload, MapPin, X, FileText, Scale, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { stripForSession, dispatchAuthChanged, type SessionUser, type StoredUser } from "@/lib/auth";
import { FEE_TEXTS, calcSellerNet, listingPriceAnomalyMessage } from "@/lib/fees";
import type { PropertyMarketingMode } from "@/types/auction";
import { MARKETING_MODE_LABELS } from "@/lib/listingPolicy";
import { invalidateAuctionsCatalogCache } from "@/lib/auctionsSource";

function readSessionUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem("ihaleal_user") || "null");
  } catch {
    return null;
  }
}

const CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep"];
const DISTRICTS: Record<string, string[]> = {
  "İstanbul": ["Şişli", "Beşiktaş", "Kadıköy", "Ataşehir", "Üsküdar", "Beyoğlu", "Fatih"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca"],
};

export default function CreateAuction() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => readSessionUser());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const marketReportInputRef = useRef<HTMLInputElement>(null);
  const expertiseInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [referenceValueTRY, setReferenceValueTRY] = useState("");
  const [duration, setDuration] = useState("7");
  const [category, setCategory] = useState("Konut");
  const [dealType, setDealType] = useState<"sale" | "rent">("sale");
  const [marketingMode, setMarketingMode] = useState<PropertyMarketingMode>("auction");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [marketReportPdfName, setMarketReportPdfName] = useState("");
  const [expertisePdfName, setExpertisePdfName] = useState("");
  const [expertiseRequired, setExpertiseRequired] = useState(true);
  const [commitmentFloorTRY, setCommitmentFloorTRY] = useState("");
  const [commitmentCeilingTRY, setCommitmentCeilingTRY] = useState("");
  const [bindingCommitmentAccepted, setBindingCommitmentAccepted] = useState(false);
  const [officialDocumentsForBuyer, setOfficialDocumentsForBuyer] = useState(false);

  const feePreview = useMemo(() => {
    const n = parseInt(startingBid, 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return calcSellerNet(n);
  }, [startingBid]);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <PlusCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">İhale açmak için giriş yapmanız gerekiyor.</p>
          <Button onClick={() => navigate("/giris")} className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white">Giriş Yap</Button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !district || !startingBid) { setError("Tüm zorunlu alanları doldurun."); return; }
    if (images.length === 0) { setError("En az bir görsel yükleyin."); return; }
    if (expertiseRequired && !expertisePdfName.trim()) {
      setError(
        "SPK uzmanı ekspertiz zorunlu iken PDF seçilmedi: «Ekspertiz PDF» ile dosya seçin veya «SPK uzmanı ekspertiz raporu zorunlu» kutusunu kaldırın. (Demo: sunucuya yüklenmez, yalnızca dosya adı kaydedilir.)",
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
    const startNum = parseInt(startingBid, 10);
    if (!Number.isFinite(startNum) || startNum <= 0) { setError("Geçerli bir başlangıç fiyatı girin."); return; }
    const refTrim = referenceValueTRY.trim();
    if (refTrim) {
      const refNum = parseInt(refTrim.replace(/\s/g, ""), 10);
      const warn = listingPriceAnomalyMessage(startNum, refNum);
      if (warn) {
        setError(warn);
        return;
      }
    }
    const negotiationMode = marketingMode === "sealed_offers" ? "sealed_offer" : "auction";
    const priceEvent =
      marketingMode === "listing_only"
        ? "İlan yayını"
        : marketingMode === "sealed_offers"
          ? "Teklif dönemi başlangıç"
          : "İhale açılış";
    const newAuction = {
      id: Date.now().toString(),
      title,
      description,
      location: `${city}, ${district}`,
      district,
      city,
      currentBid: startNum,
      startingBid: startNum,
      referenceValueTRY: refTrim ? parseInt(refTrim.replace(/\s/g, ""), 10) || undefined : undefined,
      estimatedValue: startNum * 1.2,
      aiPredictedPrice: startNum * 1.15,
      investmentScore: 75,
      pricePerSqm: Math.round(parseInt(startingBid) / 100),
      bidderCount: 0,
      endDate: new Date(Date.now() + parseInt(duration) * 86400000).toISOString(),
      images,
      virtualTour: "",
      mapLat: 41.0082,
      mapLng: 28.9784,
      category,
      dealType,
      marketingMode,
      negotiationMode,
      contactViaPlatform: true,
      marketReportPdfName: marketReportPdfName.trim() || undefined,
      expertisePdfName: expertisePdfName.trim() || undefined,
      expertiseRequired,
      commitmentFloorTRY: bindingCommitmentAccepted
        ? parseInt(commitmentFloorTRY.replace(/\s/g, ""), 10) || undefined
        : undefined,
      commitmentCeilingTRY: bindingCommitmentAccepted
        ? parseInt(commitmentCeilingTRY.replace(/\s/g, ""), 10) || undefined
        : undefined,
      bindingCommitmentAccepted: bindingCommitmentAccepted || undefined,
      officialDocumentsForBuyer: officialDocumentsForBuyer || undefined,
      status: "upcoming",
      tags: [
        category,
        district,
        dealType === "rent" ? "Kiralık" : "Satılık",
        MARKETING_MODE_LABELS[marketingMode].badge,
      ],
      propertyDetails: { roomCount: "3+1", livingRoom: 1, bathroom: 1, grossSqm: 120, netSqm: 100, floor: "2. Kat", totalFloors: 5, buildingAge: "5-10", heating: "Doğalgaz", facade: "Güney", balcony: true, elevator: true, parking: true, furnished: false, usingStatus: "Boş", deedStatus: "Kat Mülkiyetli", swap: false, eligibility: "Krediye Uygun" },
      features: ["Asansör", "Otopark", "Balkon"],
      nearbyFacilities: [],
      priceHistory: [{ date: new Date().toISOString().split("T")[0], price: startNum, event: priceEvent }],
      areaStats: { avgPricePerSqm: 50000, priceChangeMonthly: 1.5, priceChangeYearly: 12, rentalYield: 5.5, demandIndex: 80, supplyCount: 15, avgDaysOnMarket: 30 },
      agent: {
        name: "ihaleal.com",
        company: "Yetkili aracılık — iletişim platform üzerinden",
        phone: "",
        rating: 0,
        reviewCount: 0,
        image: "",
      },
    };
    const auctions = JSON.parse(localStorage.getItem("ihaleal_auctions") || "[]");
    auctions.unshift(newAuction);
    localStorage.setItem("ihaleal_auctions", JSON.stringify(auctions));
    invalidateAuctionsCatalogCache();
    const users = JSON.parse(localStorage.getItem("ihaleal_users") || "[]") as StoredUser[];
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], auctionsCreated: (users[idx].auctionsCreated || 0) + 1 };
      localStorage.setItem("ihaleal_users", JSON.stringify(users));
      localStorage.setItem("ihaleal_user", JSON.stringify(stripForSession(users[idx])));
      dispatchAuthChanged();
    }
    setSuccess(true);
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Geri</Button>
        <h1 className="text-3xl font-bold text-white mb-2">Gayrimenkul ilanı oluştur</h1>
        <p className="text-slate-400 mb-3">
          Üç yoldan birini seçin: <strong className="text-slate-300">sadece ilan</strong> (kartta ihaleal.com — RE/MAX danışman kartı gibi), <strong className="text-slate-300">teklif al</strong> veya <strong className="text-slate-300">ihale</strong>.
          Referans fiyat <code className="text-teal-400/90 text-xs">fees.ts</code> ile uyarılır. Komisyon ve cezai şartlar üretimde sözleşmede (hedef: ilan ücreti yok).
        </p>
        <p className="text-sm text-slate-500 mb-8">
          Taslak:{" "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/komisyon-modeli")}>komisyon modeli</button>
          {" · "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/ihale-kosullari")}>ihale koşulları</button>
          {" · "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/sat-basla")}>satıcı modu</button>
        </p>
        {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">İhale başarıyla oluşturuldu! Ana sayfaya yönlendiriliyor...</div>}
        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-6">
          <Card className="bg-slate-900/50 border-white/5"><CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Görseller</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors">
                <Upload className="w-6 h-6 text-slate-500" /><span className="text-xs text-slate-500">Görsel Ekle</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
          </CardContent></Card>

          <Card className="bg-slate-900/50 border-white/5"><CardContent className="p-6 space-y-4">
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
            <div><label className="text-sm text-slate-400 mb-1.5 block">Açıklama *</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Gayrimenkulünüzün detaylı açıklaması..." /></div>
          </CardContent></Card>

          <Card className="bg-violet-500/5 border-violet-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Nasıl satacak / kiralayacaksınız?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Her üç modda da ilanda <strong className="text-slate-300">ihaleal.com</strong> yetkili görünür; taraf telefonu yok. Teklif ve ihalelerde sahte veya keyfi davranışa karşı sözleşmede cezai şart ve hesap kısıtları hedeflenir (avukat metni).
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {(["listing_only", "sealed_offers", "auction"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition-colors ${marketingMode === mode ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <input type="radio" name="marketingMode" className="sr-only" checked={marketingMode === mode} onChange={() => setMarketingMode(mode)} />
                    <span className="text-sm font-semibold text-white">{MARKETING_MODE_LABELS[mode].headline}</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed">{MARKETING_MODE_LABELS[mode].hint}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5"><CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" /> Konum</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="text-sm text-slate-400 mb-1.5 block">İl</label><select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(""); }} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm">{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">İlçe *</label><select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm"><option value="">Seçin</option>{(DISTRICTS[city] || []).map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Mahalle</label><Input className="bg-slate-950 border-white/10 text-white" placeholder="Mahalle adı" /></div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/5 h-48 bg-slate-900 flex items-center justify-center">
              <div className="text-center"><MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" /><p className="text-sm text-slate-400">Harita entegrasyonu yakında</p><p className="text-xs text-slate-600 mt-1">Google Maps API ile otomatik konum</p></div>
            </div>
          </CardContent></Card>

          <Card className="bg-slate-900/50 border-white/5"><CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Fiyat ve süre</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {FEE_TEXTS.sellerSummary()} · {FEE_TEXTS.refundWindow()} · {FEE_TEXTS.payoutHold()}
              {feePreview ? (
                <span className="block mt-2 text-slate-400">
                  Tahmini satıcı neti (tek kaynak <code className="text-teal-400/90">fees.ts</code>): ₺
                  {feePreview.net.toLocaleString("tr-TR")} (komisyon ₺{feePreview.commission.toLocaleString("tr-TR")} + KDV ₺
                  {feePreview.vatOnCommission.toLocaleString("tr-TR")})
                </span>
              ) : null}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><label className="text-sm text-slate-400 mb-1.5 block">Başlangıç Fiyatı (₺) *</label><Input type="number" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="örn: 2500000" /></div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Referans / ekspertiz (₺)</label>
                <Input
                  type="number"
                  value={referenceValueTRY}
                  onChange={(e) => setReferenceValueTRY(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white"
                  placeholder="İsteğe bağlı — örn: 5_000_000"
                />
                <p className="text-[11px] text-slate-600 mt-1">Doldurursanız başlangıç, referansın yaklaşık %35 üstündeyse kayıt engellenir (demo denetim).</p>
              </div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">İhale Süresi</label><select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm"><option value="3">3 Gün</option><option value="7">7 Gün</option><option value="14">14 Gün</option><option value="30">30 Gün</option></select></div>
              <div><label className="text-sm text-slate-400 mb-1.5 block">Minimum Artış</label><select className="w-full px-3 py-2 rounded-md bg-slate-950 border border-white/10 text-white text-sm"><option>₺10.000</option><option>₺50.000</option><option>₺100.000</option><option>₺250.000</option><option>₺500.000</option></select></div>
            </div>
          </CardContent></Card>

          <Card className="bg-teal-500/5 border-teal-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Raporlar ve ekspertiz (üretim çizgisi)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Endeksa veya benzeri bölge / fiyat raporu PDF’i platformda analiz butonunda kullanılır; üçüncü taraf telifine uyum kullanıcı sorumluluğundadır. Demo ortamda yalnızca dosya adı saklanır.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Piyasa raporu (PDF — Endeksa vb.)</label>
                  <input ref={marketReportInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; setMarketReportPdfName(f?.name || ""); }} />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="border-white/15 text-slate-200 shrink-0" onClick={() => marketReportInputRef.current?.click()}>PDF seç</Button>
                    <span className="text-xs text-slate-500 self-center truncate">{marketReportPdfName || "—"}</span>
                  </div>
                </div>
                <div>
                  <label
                    className="text-sm text-slate-400 mb-1.5 flex items-center gap-2 cursor-help w-fit"
                    title="Varsayılan açık: üretim hedefiyle uyum. Kapatırsanız PDF zorunluluğu kalkar; açık bırakırsanız ilan kaydı için ekspertiz PDF dosya adı gerekir (demo: yalnızca dosya adı saklanır)."
                  >
                    <input type="checkbox" checked={expertiseRequired} onChange={(e) => setExpertiseRequired(e.target.checked)} className="rounded border-white/20" />
                    SPK uzmanı ekspertiz raporu zorunlu
                  </label>
                  <p className="text-[11px] text-slate-600 mb-1">
                    Varsayılan açık (hedef çizgi). Kapatırsanız PDF zorunluluğu kalkar; imleci kutunun üzerine getirerek de ipucunu görebilirsiniz.
                  </p>
                  <input ref={expertiseInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; setExpertisePdfName(f?.name || ""); }} />
                  <div className="flex gap-2 mt-1">
                    <Button type="button" variant="outline" className="border-white/15 text-slate-200 shrink-0" onClick={() => expertiseInputRef.current?.click()}>Ekspertiz PDF</Button>
                    <span className="text-xs text-slate-500 self-center truncate">{expertisePdfName || "—"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Şerh, ipotek, haciz beyanı raporda yer almalıdır (hedef).</p>
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={officialDocumentsForBuyer} onChange={(e) => setOfficialDocumentsForBuyer(e.target.checked)} className="mt-1 rounded border-white/20" />
                <span>
                  <Landmark className="w-4 h-4 text-sky-400 inline mr-1 align-text-bottom" />
                  Belediye / imar planı / diğer resmi karar özeti alıcı veya kiracıya ayrı butonla gösterilecek (tapu öncesi şeffaflık).
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Taahhüt limitleri (sözleşme taslağı)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Satıcı veya kiraya veren alt / üst limit belirler; anlaşılan işlem tutarı üzerinden komisyon alınır. Üst limite ulaşıldığında işlemi tamamlama ve aksi halde cezai şartlar üretimde sözleşmede; alıcı ve kiracı için simetrik yükümlülükler aynı pakette netleşir (avukat onayı).
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt alt limit (₺)</label>
                  <Input value={commitmentFloorTRY} onChange={(e) => setCommitmentFloorTRY(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="İsteğe bağlı — taahhüt işaretlenirse zorunlu" disabled={!bindingCommitmentAccepted} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Taahhüt üst limit (₺)</label>
                  <Input value={commitmentCeilingTRY} onChange={(e) => setCommitmentCeilingTRY(e.target.value)} className="bg-slate-950 border-white/10 text-white" placeholder="Limite ulaşıldığında işlem yükümlülüğü" disabled={!bindingCommitmentAccepted} />
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" checked={bindingCommitmentAccepted} onChange={(e) => setBindingCommitmentAccepted(e.target.checked)} className="mt-1 rounded border-white/20" />
                <span>
                  Taahhüt metnini okudum: üst limite ulaşıldığında satış veya kira sözleşmesini platform çizgisinde tamamlama yükümlülüğü ve ihlalde cezai şart (detay sözleşmede; bu kutu hukuki taahhüt değildir — kayıt amaçlı).
                </span>
              </label>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-12 text-base">
            <PlusCircle className="w-5 h-5 mr-2" /> İlanı kaydet ve yayınla
          </Button>
        </form>
      </div>
    </div>
  );
}
