import { useMemo, useState } from "react";
import { Calculator, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MEMBERSHIP_FEES,
  SERVICE_FEES,
  SERVICE_FEE_LABELS,
  calcCommissionBreakdown,
  VAT_RATE,
  REALTOR_B2B_RATE,
  SELLER_COMMISSION_RATE,
} from "@/lib/fees";
import { distributeLandEquityCommission } from "@/lib/masterFinancialEngine";
import {
  splitRentalCommissionMatrah,
  kdvOnCommissionMatrah,
  eProvisyon1PercentTry,
  RENTAL_COMMISSION_VAT_RATE,
  type RentalSplitScenario,
} from "@/lib/rentalCommissionEngine";

type ServiceKey = keyof typeof SERVICE_FEES;

export default function CommissionCalculator() {
  const [saleStr, setSaleStr] = useState("5000000");
  const [rentStr, setRentStr] = useState("35000");
  const [rentTransferStr, setRentTransferStr] = useState("50000");
  const [rentScenario, setRentScenario] = useState<RentalSplitScenario>("dual_realtor");
  const [sellerMembershipPaid, setSellerMembershipPaid] = useState(true);
  const [svc, setSvc] = useState<Record<ServiceKey, boolean>>({
    photo: false,
    drone: false,
    legal: false,
    expertise: false,
    bid_entry: false,
    virtual_tour: false,
    video: false,
    tapu_prep: false,
  });

  const saleAmount = Math.max(0, Number(String(saleStr).replace(/\D/g, "")) || 0);
  const serviceSum = useMemo(() => {
    let s = 0;
    (Object.keys(svc) as ServiceKey[]).forEach((k) => {
      if (svc[k]) s += SERVICE_FEES[k];
    });
    return s;
  }, [svc]);

  const mahsupMembership = sellerMembershipPaid ? MEMBERSHIP_FEES.seller_yearly : 0;
  const b = useMemo(
    () => calcCommissionBreakdown(saleAmount, mahsupMembership, serviceSum, REALTOR_B2B_RATE),
    [saleAmount, mahsupMembership, serviceSum],
  );

  const rentAmount = Math.max(0, Number(String(rentStr).replace(/\D/g, "")) || 0);
  const rentTransferAmount = Math.max(0, Number(String(rentTransferStr).replace(/\D/g, "")) || 0);

  const landPool = useMemo(() => {
    const v = saleAmount > 0 ? saleAmount : 1;
    try {
      return distributeLandEquityCommission({ expertOrParcelValueTry: v });
    } catch {
      return null;
    }
  }, [saleAmount]);

  const rentalSplit = useMemo(() => {
    if (rentAmount <= 0) return null;
    try {
      return splitRentalCommissionMatrah({
        oneMonthlyRentTryBeforeVat: rentAmount,
        scenario: rentScenario,
      });
    } catch {
      return null;
    }
  }, [rentAmount, rentScenario]);

  const rentalEProvNormal = useMemo(() => {
    if (rentAmount <= 0) return null;
    try {
      return eProvisyon1PercentTry({ kind: "normal_rent", monthlyRentTry: rentAmount });
    } catch {
      return null;
    }
  }, [rentAmount]);

  const rentalEProvDevren = useMemo(() => {
    if (rentAmount <= 0) return null;
    try {
      return eProvisyon1PercentTry({
        kind: "devren",
        monthlyRentTry: rentAmount,
        transferFeeTry: rentTransferAmount,
      });
    } catch {
      return null;
    }
  }, [rentAmount, rentTransferAmount]);

  function toggleService(k: ServiceKey) {
    setSvc((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-8 flex items-start gap-3">
            <div className="rounded-xl bg-teal-500/15 p-3 text-teal-400">
              <Calculator className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Komisyon hesaplayıcı</h1>
              <p className="mt-2 text-sm text-slate-400">
                Üst blok yalnızca satış işlem matrahı içindir (%{(SELLER_COMMISSION_RATE * 100).toFixed(0)} + KDV; mahsup
                üyelik ve hizmetler). Kiralık komisyonu ayrı kartta; matrah 1 aylık kira + KDV (satılıkla karıştırılmaz).
              </p>
            </div>
          </div>

          <Card className="mb-6 border-sky-500/25 bg-sky-950/30">
            <CardContent className="flex gap-3 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden />
              <div>
                <h2 className="text-sm font-semibold text-white">Güvenli ödeme havuzu (escrow)</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Hedef mimaride teklif tutarları, işlem koşulları sağlanana kadar üçüncü taraf havuzda tutulur; mahsup ve komisyon kesintileri sözleşmeye uygun şekilde otomatik dağıtılır.
                  Bu ekran yalnızca komisyon matematığını gösterir; havuz hesabı ve ödeme sağlayıcı entegrasyonu üretimde tanımlanır.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/50">
            <CardContent className="space-y-6 p-6">
              <div>
                <Label className="text-slate-300">Satış / işlem tutarı (₺)</Label>
                <Input
                  className="mt-2 bg-slate-950 border-white/10 text-white"
                  value={saleStr}
                  onChange={(e) => setSaleStr(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 p-4">
                <Checkbox
                  checked={sellerMembershipPaid}
                  onCheckedChange={(v) => setSellerMembershipPaid(v === true)}
                  id="sm-y"
                  aria-label="Satıcı yıllık ücreti mahsuba dahil"
                />
                <div>
                  <label htmlFor="sm-y" className="cursor-pointer text-sm font-medium text-white">
                    Yıllık satıcı ücreti ödenmiş say ({MEMBERSHIP_FEES.seller_yearly.toLocaleString("tr-TR")} ₺ / yıl)
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Alıcı yıllık ücreti ({MEMBERSHIP_FEES.buyer_yearly.toLocaleString("tr-TR")} ₺) ayrı kalemdir; bu işlem mahsubuna dahil edilmez.
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">Hizmet bedeli mahsuba dahil et</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(SERVICE_FEES) as ServiceKey[]).map((k) => (
                    <label key={k} className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/5 p-3 hover:bg-white/5">
                      <Checkbox checked={svc[k]} onCheckedChange={() => toggleService(k)} />
                      <span className="text-sm text-slate-400">
                        <span className="text-slate-200">{SERVICE_FEE_LABELS[k]}</span>
                        <span className="block text-xs text-slate-500">{SERVICE_FEES[k].toLocaleString("tr-TR")} ₺</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-white/10 bg-slate-950/60">
            <CardContent className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-white">Mahsup akışı (görsel özet)</h2>
              <div className="rounded-xl border border-dashed border-teal-500/25 bg-[#060912] p-4 font-mono text-[11px] leading-relaxed text-slate-300 sm:text-xs">
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                    Satıcı komisyon matrahı (%{(SELLER_COMMISSION_RATE * 100).toFixed(0)}) + KDV ({(VAT_RATE * 100).toFixed(0)}%)
                  </div>
                  <div className="text-center text-teal-400">−</div>
                  <div className="rounded-lg bg-teal-500/10 px-3 py-2 text-center text-teal-100">
                    Mahsup: yıllık satıcı üyeliği + seçilen hizmet bedelleri
                  </div>
                  <div className="text-center text-teal-400">−</div>
                  <div className="rounded-lg bg-violet-500/10 px-3 py-2 text-center text-violet-100">
                    Ortak emlakçı B2B (işlem üzerinden %{(REALTOR_B2B_RATE * 100).toFixed(0)})
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-3 text-center text-slate-500">
                    ≈ Tahmini platform net (sağdaki tablo ile uyumlu)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-teal-500/20 bg-teal-950/20">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-white">Tahmini dağılım</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <dt>Satıcı işlem komisyonu (matrah)</dt>
                  <dd className="font-medium text-white">₺{Math.round(b.sellerCommission).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>KDV ({(VAT_RATE * 100).toFixed(0)}%, komisyon üzerinden)</dt>
                  <dd className="font-medium text-white">₺{Math.round(b.totalVAT).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>Ortak emlakçı B2B (matrah %{(REALTOR_B2B_RATE * 100).toFixed(0)})</dt>
                  <dd className="font-medium text-white">₺{Math.round(b.agentShare).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-slate-400">
                  <dt>Mahsup (üyelik + hizmet)</dt>
                  <dd className="text-teal-300">−₺{Math.round(b.offsetTotal).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <dt className="font-medium">Tahmini platform net matrah (mahsup + B2B sonrası)</dt>
                  <dd className={`font-bold ${b.platformNet < 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    ₺{Math.round(b.platformNet).toLocaleString("tr-TR")}
                  </dd>
                </div>
              </dl>
              {b.platformNet < 0 ? (
                <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-200/90">
                  Negatif çıkan durumlarda üretim faturalama politikası sıfır altına düşmemeyi veya taşımayı netleştirir.
                </p>
              ) : null}
              <p className="text-[11px] leading-relaxed text-slate-500">
                Bu ekran bilgilendirme içindir; kesin tutarlar sözleşme ve fatura ile ilişkilidir.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-[#0F172A]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-amber-100">Kiralık ve devren (v.Final — Madde 41-46)</h2>
              <p className="text-xs text-slate-400">
                <code className="text-amber-200/90">rentalCommissionEngine.ts</code> — hizmet bedeli matrahı{" "}
                <strong className="text-amber-100">1 tam aylık kira + KDV</strong>. Devir bedeli üzerinden komisyon
                kesilmez; %1 e-provizyon ayrı hesaplanır (Madde 66-68, 81-83).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rent-matrah" className="text-xs text-slate-400">
                    1 aylık kira (KDV matrahı, TL)
                  </Label>
                  <Input
                    id="rent-matrah"
                    inputMode="numeric"
                    value={rentStr}
                    onChange={(e) => setRentStr(e.target.value)}
                    className="border-white/10 bg-black/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent-devir" className="text-xs text-slate-400">
                    Devir bedeli (yalnız e-provizyon örneği, TL)
                  </Label>
                  <Input
                    id="rent-devir"
                    inputMode="numeric"
                    value={rentTransferStr}
                    onChange={(e) => setRentTransferStr(e.target.value)}
                    className="border-white/10 bg-black/30 text-white"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["c2c", "C2C (platform %100)"],
                    ["single_realtor", "Tek emlakçı (%50-%50)"],
                    ["dual_realtor", "Çift emlakçı (%25 + %37.5 + %37.5)"],
                    ["b2c_cross", "B2C çapraz (%50-%50)"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRentScenario(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      rentScenario === key ? "bg-amber-500/25 text-amber-100" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {rentalSplit ? (
                <dl className="space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                  <div className="text-[11px] text-slate-500">{rentalSplit.lawRef}</div>
                  <div className="flex justify-between">
                    <dt>İhaleal matrah</dt>
                    <dd className="font-medium text-white">₺{rentalSplit.ihalealMatrahTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  {typeof rentalSplit.listingRealtorMatrahTry === "number" ? (
                    <div className="flex justify-between">
                      <dt>İlan / portföy emlakçısı matrah</dt>
                      <dd className="font-medium text-white">
                        ₺{rentalSplit.listingRealtorMatrahTry.toLocaleString("tr-TR")}
                      </dd>
                    </div>
                  ) : null}
                  {typeof rentalSplit.buyerRealtorMatrahTry === "number" ? (
                    <div className="flex justify-between">
                      <dt>Alıcı tarafı emlakçı matrah</dt>
                      <dd className="font-medium text-white">
                        ₺{rentalSplit.buyerRealtorMatrahTry.toLocaleString("tr-TR")}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-white/10 pt-2 text-slate-400">
                    <dt>KDV (komisyon matrahı üzerinden %{(RENTAL_COMMISSION_VAT_RATE * 100).toFixed(0)})</dt>
                    <dd className="font-medium text-white">
                      ₺{kdvOnCommissionMatrah(rentAmount).toLocaleString("tr-TR")}
                    </dd>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Emlakçı hak edişleri Net-30 blokesi ve IBAN eşleşmesi iş kurallarında uygulanır (Madde 48-55).
                  </p>
                </dl>
              ) : (
                <p className="text-xs text-amber-200/80">Geçerli bir aylık kira tutarı girin.</p>
              )}
              {rentalEProvNormal != null && rentalEProvDevren != null ? (
                <div className="rounded-lg border border-white/10 p-3 text-xs text-slate-400">
                  <div className="font-medium text-slate-300">%1 e-provizyon (bloke)</div>
                  <div className="mt-1 flex justify-between">
                    <span>Normal kiralık</span>
                    <span className="text-white">₺{rentalEProvNormal.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Devren (kira + devir toplamı × %1)</span>
                    <span className="text-white">₺{rentalEProvDevren.toLocaleString("tr-TR")}</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-[#0F172A]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-emerald-100">Kat karşılığı arsa (v2.3 — %8 + KDV)</h2>
              <p className="text-xs text-slate-400">
                <code className="text-emerald-200/90">commission/engine.ts</code> üzerinden{" "}
                <code className="text-emerald-200/90">masterFinancialEngine.ts</code> — üstteki{" "}
                <strong className="text-emerald-100">arsa rayiç matrahı</strong> üzerinden toplam %8 (KDV hariç)
                hizmet havuzu; İhaleal / emlakçı payı havuz içinde bölünür. Müteahhit en az %4, arsa sahibi noterde
                kabul ederse +%4 (aksi halde müteahhit kalan %4 dahil tüm %8 yükünü üstlenir — örnekte arsa sahibi
                noter kabulü yok).
              </p>
              <p className="text-xs text-slate-500">
                Arsa rayiç değeri olarak üstteki işlem tutarı kullanılır (varsayılan: tek emlakçı senaryosu).
              </p>
              {landPool ? (
                <dl className="space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>İhaleal payı (havuzdan)</dt>
                    <dd className="font-medium text-white">₺{landPool.platformTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Emlakçı payı (havuzdan)</dt>
                    <dd className="font-medium text-white">₺{landPool.agentPoolTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <dt>Müteahhit yükü (matrah)</dt>
                    <dd className="font-medium text-white">₺{landPool.contractorTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <dt>Arsa sahibi yükü (matrah)</dt>
                    <dd className="font-medium text-white">₺{landPool.ownerTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-slate-400">
                    <dt>KDV (havuz matrahı üzerinden %{(RENTAL_COMMISSION_VAT_RATE * 100).toFixed(0)})</dt>
                    <dd className="font-medium text-white">₺{landPool.totalKdvTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <dt>Toplam %8 havuz (KDV hariç)</dt>
                    <dd>₺{landPool.totalServicePoolTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <dt>Genel toplam (KDV dahil)</dt>
                    <dd>₺{landPool.totalWithKdvTry.toLocaleString("tr-TR")}</dd>
                  </div>
                </dl>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
