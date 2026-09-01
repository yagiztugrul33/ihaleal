import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MEMBERSHIP_FEES,
  SERVICE_FEES,
  SERVICE_FEE_DYNAMIC,
  calcCommissionBreakdown,
  calcBidBond,
  VAT_RATE,
  REALTOR_B2B_RATE,
  SELLER_COMMISSION_RATE,
  COMMISSION_RATE,
  BID_BOND_RATE,
  WITHDRAWAL_PENALTY_RATE,
} from "@/lib/fees";
import { distributeLandEquityCommission } from "@/lib/masterFinancialEngine";
import { LAND_SHARE_TOTAL_EX_VAT_RATE } from "@/lib/commission/engine";
import {
  splitRentalCommissionMatrah,
  kdvOnCommissionMatrah,
  eProvisyon1PercentTry,
  RENTAL_COMMISSION_VAT_RATE,
  type RentalSplitScenario,
} from "@/lib/rentalCommissionEngine";
import { KKA_HUB_PATH } from "@/lib/kkaHub";
import { useLocale } from "@/contexts/LocaleContext";

type ServiceKey = keyof typeof SERVICE_FEES;

export default function CommissionCalculator() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const cc = t.commissionCalc;
  const [saleStr, setSaleStr] = useState("5000000");
  const [rentStr, setRentStr] = useState("35000");
  const [loanPrincipalStr, setLoanPrincipalStr] = useState("3000000");
  const [loanMonthsStr, setLoanMonthsStr] = useState("120");
  const [loanRateStr, setLoanRateStr] = useState("2.89");
  const [yieldPriceStr, setYieldPriceStr] = useState("6000000");
  const [yieldRentStr, setYieldRentStr] = useState("32000");
  const [titleFeeBaseStr, setTitleFeeBaseStr] = useState("5000000");
  const [gainBuyStr, setGainBuyStr] = useState("3000000");
  const [gainSellStr, setGainSellStr] = useState("5000000");
  const [gainYearsStr, setGainYearsStr] = useState("3");
  const [monthlyAidatStr, setMonthlyAidatStr] = useState("3500");
  const [monthlyOpsStr, setMonthlyOpsStr] = useState("2200");
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
      if (!svc[k]) return;
      // Dinamik fee (bid_entry): satış bedeli üzerinden BID_BOND_RATE (%5 bloke/teminat)
      if (k === "bid_entry") {
        s += calcBidBond(saleAmount);
      } else {
        s += SERVICE_FEES[k];
      }
    });
    return s;
  }, [svc, saleAmount]);

  const mahsupMembership = sellerMembershipPaid ? MEMBERSHIP_FEES.seller_yearly : 0;
  const b = useMemo(
    () => calcCommissionBreakdown(saleAmount, mahsupMembership, serviceSum, REALTOR_B2B_RATE),
    [saleAmount, mahsupMembership, serviceSum],
  );
  const buyerCommission = saleAmount * COMMISSION_RATE;
  const sellerCommission = saleAmount * SELLER_COMMISSION_RATE;
  const buyerCommissionVat = buyerCommission * VAT_RATE;
  const sellerCommissionVat = sellerCommission * VAT_RATE;
  const bidBond = saleAmount * BID_BOND_RATE;
  const withdrawalPenalty = saleAmount * WITHDRAWAL_PENALTY_RATE;
  const commissionTotalWithVat = buyerCommission + sellerCommission + buyerCommissionVat + sellerCommissionVat;

  const rentAmount = Math.max(0, Number(String(rentStr).replace(/\D/g, "")) || 0);
  const loanPrincipal = Math.max(0, Number(String(loanPrincipalStr).replace(/\D/g, "")) || 0);
  const loanMonths = Math.max(1, Number(String(loanMonthsStr).replace(/\D/g, "")) || 1);
  const loanRate = Math.max(0, Number(String(loanRateStr).replace(",", ".")) || 0);
  const monthlyRate = loanRate / 100;
  const monthlyInstallment =
    monthlyRate > 0
      ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / (Math.pow(1 + monthlyRate, loanMonths) - 1)
      : loanPrincipal / loanMonths;
  const yieldPrice = Math.max(1, Number(String(yieldPriceStr).replace(/\D/g, "")) || 1);
  const yieldRent = Math.max(0, Number(String(yieldRentStr).replace(/\D/g, "")) || 0);
  const annualYieldPct = (yieldRent * 12 * 100) / yieldPrice;
  const amortizationYears = yieldRent > 0 ? yieldPrice / (yieldRent * 12) : 0;
  const titleFeeBase = Math.max(0, Number(String(titleFeeBaseStr).replace(/\D/g, "")) || 0);
  const titleFee = titleFeeBase * 0.04;
  const gainBuy = Math.max(0, Number(String(gainBuyStr).replace(/\D/g, "")) || 0);
  const gainSell = Math.max(0, Number(String(gainSellStr).replace(/\D/g, "")) || 0);
  const gainYears = Math.max(0, Number(String(gainYearsStr).replace(/\D/g, "")) || 0);
  const capitalGain = Math.max(0, gainSell - gainBuy);
  const estimatedCapitalGainTax = gainYears >= 5 ? 0 : capitalGain * 0.15;
  const monthlyAidat = Math.max(0, Number(String(monthlyAidatStr).replace(/\D/g, "")) || 0);
  const monthlyOps = Math.max(0, Number(String(monthlyOpsStr).replace(/\D/g, "")) || 0);
  const annualOpsTotal = (monthlyAidat + monthlyOps) * 12;
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
            <div className="rounded-[20px] bg-[var(--zemin-yumusak)] p-3 text-[var(--metin-ikincil)]">
              <Calculator className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-normal text-white">{cc.pageTitle}</h1>
              <p className="mt-2 text-sm text-slate-400">
                {cc.pageIntro}
              </p>
            </div>
          </div>
          <section className="mb-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">{cc.step1Title}</p>
              <p className="mt-1 text-xs text-slate-300">{cc.step1Desc}</p>
            </article>
            <article className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">{cc.step2Title}</p>
              <p className="mt-1 text-xs text-slate-300">{cc.step2Desc}</p>
            </article>
            <article className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
              <p className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">{cc.step3Title}</p>
              <p className="mt-1 text-xs text-slate-300">{cc.step3Desc}</p>
            </article>
          </section>

          <Card className="mb-6 border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
            <CardContent className="flex gap-3 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--metin-ikincil)]" aria-hidden />
              <div>
                <h2 className="text-sm font-normal text-white">{cc.escrowTitle}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {cc.escrowBody}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-lg font-normal text-white">{cc.basicTitle}</h2>
              <p className="text-xs text-slate-300">
                {cc.basicRateDesc
                  .replace("{seller}", (SELLER_COMMISSION_RATE * 100).toFixed(0))
                  .replace("{buyer}", (COMMISSION_RATE * 100).toFixed(0))
                  .replace("{vat}", (VAT_RATE * 100).toFixed(0))
                  .replace("{bond}", (BID_BOND_RATE * 100).toFixed(0))
                  .replace("{penalty}", (WITHDRAWAL_PENALTY_RATE * 100).toFixed(0))}
              </p>
              <dl className="grid gap-2 text-sm md:grid-cols-2">
                <div className="flex justify-between text-slate-300"><dt>{cc.rowSellerCommission}</dt><dd dir="ltr">₺{Math.round(sellerCommission).toLocaleString("tr-TR")}</dd></div>
                <div className="flex justify-between text-slate-300"><dt>{cc.rowSellerCommissionVat}</dt><dd dir="ltr">₺{Math.round(sellerCommissionVat).toLocaleString("tr-TR")}</dd></div>
                <div className="flex justify-between text-slate-300"><dt>{cc.rowBuyerCommission}</dt><dd dir="ltr">₺{Math.round(buyerCommission).toLocaleString("tr-TR")}</dd></div>
                <div className="flex justify-between text-slate-300"><dt>{cc.rowBuyerCommissionVat}</dt><dd dir="ltr">₺{Math.round(buyerCommissionVat).toLocaleString("tr-TR")}</dd></div>
                <div className="flex justify-between text-[var(--metin-ikincil)]"><dt>{cc.rowBidBond.replace("{bond}", (BID_BOND_RATE * 100).toFixed(0))}</dt><dd data-testid="commission-bid-bond" dir="ltr">₺{Math.round(bidBond).toLocaleString("tr-TR")}</dd></div>
                <div className="flex justify-between text-[var(--metin-ikincil)]"><dt>{cc.rowWithdrawalPenalty}</dt><dd data-testid="commission-withdrawal-penalty" dir="ltr">₺{Math.round(withdrawalPenalty).toLocaleString("tr-TR")}</dd></div>
              </dl>
              <p className="text-[11px] text-slate-500">
                {cc.basicHonestyNote}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6 border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
            <CardContent className="p-5 space-y-2">
              <h2 className="text-lg font-normal text-[var(--metin-ikincil)]">{cc.exampleTitle}</h2>
              <p className="text-sm text-slate-300" data-testid="commission-total-with-vat">
                {cc.exampleBody
                  .replace("{amount}", saleAmount.toLocaleString("tr-TR"))
                  .replace("{total}", Math.round(commissionTotalWithVat).toLocaleString("tr-TR"))
                  .replace("{bond}", Math.round(bidBond).toLocaleString("tr-TR"))
                  .replace("{penalty}", Math.round(withdrawalPenalty).toLocaleString("tr-TR"))}
              </p>
              <p className="text-[11px] text-slate-500">
                {cc.exampleNote}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-900/50">
            <CardContent className="space-y-6 p-6">
              <div>
                <Label className="text-slate-300">{cc.inputSaleLabel}</Label>
                <Input
                  className="mt-2 bg-slate-950 border-slate-200 text-white"
                  value={saleStr}
                  onChange={(e) => setSaleStr(e.target.value)}
                  inputMode="numeric"
                  dir="ltr"
                />
              </div>
              <div className="flex items-start gap-3 rounded-[10px] border border-slate-200 p-4">
                <Checkbox
                  checked={sellerMembershipPaid}
                  onCheckedChange={(v) => setSellerMembershipPaid(v === true)}
                  id="sm-y"
                  aria-label={cc.inputMembershipAria}
                />
                <div>
                  <label htmlFor="sm-y" className="cursor-pointer text-sm font-normal text-white">
                    {cc.inputMembershipLabel.replace("{amount}", MEMBERSHIP_FEES.seller_yearly.toLocaleString("tr-TR"))}
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    {cc.inputMembershipSubNote.replace("{amount}", MEMBERSHIP_FEES.buyer_yearly.toLocaleString("tr-TR"))}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-normal text-slate-300">{cc.inputServiceFeesLabel}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(SERVICE_FEES) as ServiceKey[]).map((k) => (
                    <label key={k} className="flex cursor-pointer items-start gap-2 rounded-[10px] border border-slate-200/80 p-3 hover:bg-white/5">
                      <Checkbox checked={svc[k]} onCheckedChange={() => toggleService(k)} />
                      <span className="text-sm text-slate-400">
                        <span className="text-slate-200">{t.serviceFees.labels[k]}</span>
                        <span className="block text-xs text-slate-500">
                          {SERVICE_FEE_DYNAMIC[k]
                            ? `${t.serviceFees.dynamicBidEntry} ${cc.inputServiceMatrah.replace("{amount}", calcBidBond(saleAmount).toLocaleString("tr-TR"))}`
                            : `${SERVICE_FEES[k].toLocaleString("tr-TR")} ₺`}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-slate-200 bg-slate-950/60">
            <CardContent className="p-6">
              <h2 className="mb-4 text-sm font-normal text-white">{cc.mahsupTitle}</h2>
              <div className="rounded-[20px] border border-dashed border-[var(--cizgi)] bg-[#060912] p-4 font-mono text-[11px] leading-relaxed text-slate-300 sm:text-xs">
                <div className="flex flex-col gap-2">
                  <div className="rounded-[10px] bg-white/5 px-3 py-2 text-center">
                    {cc.mahsupBox1.replace("{seller}", (SELLER_COMMISSION_RATE * 100).toFixed(0)).replace("{vat}", (VAT_RATE * 100).toFixed(0))}
                  </div>
                  <div className="text-center text-[var(--metin-ikincil)]">−</div>
                  <div className="rounded-[10px] bg-[var(--zemin-yumusak)] px-3 py-2 text-center text-[var(--metin-ikincil)]">
                    {cc.mahsupBox2}
                  </div>
                  <div className="text-center text-[var(--metin-ikincil)]">−</div>
                  <div className="rounded-[10px] bg-[var(--zemin-yumusak)] px-3 py-2 text-center text-[var(--metin-ikincil)]">
                    {cc.mahsupBox3.replace("{b2b}", (REALTOR_B2B_RATE * 100).toFixed(0))}
                  </div>
                  <div className="mt-2 border-t border-slate-200 pt-3 text-center text-slate-500">
                    {cc.mahsupBox4}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-normal text-white">{cc.distTitle}</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <dt>{cc.distSellerCommMatrah}</dt>
                  <dd className="font-normal text-white" dir="ltr">₺{Math.round(b.sellerCommission).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>{cc.distKdv.replace("{vat}", (VAT_RATE * 100).toFixed(0))}</dt>
                  <dd className="font-normal text-white" dir="ltr">₺{Math.round(b.totalVAT).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>{cc.distB2b.replace("{b2b}", (REALTOR_B2B_RATE * 100).toFixed(0))}</dt>
                  <dd className="font-normal text-white" dir="ltr">₺{Math.round(b.agentShare).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-400">
                  <dt>{cc.distMahsup}</dt>
                  <dd className="text-[var(--metin-ikincil)]" dir="ltr">−₺{Math.round(b.offsetTotal).toLocaleString("tr-TR")}</dd>
                </div>
                <div className="flex justify-between text-slate-300">
                  <dt className="font-normal">{cc.distPlatformNet}</dt>
                  <dd className={`font-normal ${b.platformNet < 0 ? "text-[var(--metin-ikincil)]" : "text-[var(--metin-ikincil)]"}`} dir="ltr">
                    ₺{Math.round(b.platformNet).toLocaleString("tr-TR")}
                  </dd>
                </div>
              </dl>
              {b.platformNet < 0 ? (
                <p className="rounded-[10px] bg-[var(--zemin-yumusak)] p-3 text-xs text-[var(--metin-ikincil)]">
                  {cc.distNegativeNote}
                </p>
              ) : null}
              <p className="text-[11px] leading-relaxed text-slate-500">
                {cc.distHonestyNote}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[var(--cizgi)] bg-[#0F172A]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-normal text-[var(--metin-ikincil)]">Kiralık ve devren (v.Final — Madde 41-46)</h2>
              <p className="text-xs text-slate-400">
                <code className="text-[var(--metin-ikincil)]">rentalCommissionEngine.ts</code> — hizmet bedeli matrahı{" "}
                <strong className="text-[var(--metin-ikincil)]">1 tam aylık kira + KDV</strong>. Devir bedeli üzerinden komisyon
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
                    className="border-slate-200 bg-black/30 text-white"
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
                    className="border-slate-200 bg-black/30 text-white"
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
                    className={`rounded-[3px] px-3 py-1.5 text-xs font-normal ${
                      rentScenario === key ? "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]" : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {rentalSplit ? (
                <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-300">
                  <div className="text-[11px] text-slate-500">{rentalSplit.lawRef}</div>
                  <div className="flex justify-between">
                    <dt>İhaleal matrah</dt>
                    <dd className="font-normal text-white">₺{rentalSplit.ihalealMatrahTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  {typeof rentalSplit.listingRealtorMatrahTry === "number" ? (
                    <div className="flex justify-between">
                      <dt>İlan / portföy emlakçısı matrah</dt>
                      <dd className="font-normal text-white">
                        ₺{rentalSplit.listingRealtorMatrahTry.toLocaleString("tr-TR")}
                      </dd>
                    </div>
                  ) : null}
                  {typeof rentalSplit.buyerRealtorMatrahTry === "number" ? (
                    <div className="flex justify-between">
                      <dt>Alıcı tarafı emlakçı matrah</dt>
                      <dd className="font-normal text-white">
                        ₺{rentalSplit.buyerRealtorMatrahTry.toLocaleString("tr-TR")}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-400">
                    <dt>KDV (komisyon matrahı üzerinden %{(RENTAL_COMMISSION_VAT_RATE * 100).toFixed(0)})</dt>
                    <dd className="font-normal text-white">
                      ₺{kdvOnCommissionMatrah(rentAmount).toLocaleString("tr-TR")}
                    </dd>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Emlakçı hak edişleri Net-30 blokesi ve IBAN eşleşmesi iş kurallarında uygulanır (Madde 48-55).
                  </p>
                </dl>
              ) : (
                <p className="text-xs text-[var(--metin-ikincil)]">Geçerli bir aylık kira tutarı girin.</p>
              )}
              {rentalEProvNormal != null && rentalEProvDevren != null ? (
                <div className="rounded-[10px] border border-slate-200 p-3 text-xs text-slate-400">
                  <div className="font-normal text-slate-300">%1 e-provizyon (bloke)</div>
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

          <Card className="border-[var(--cizgi)] bg-[#0F172A]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-normal text-[var(--metin-ikincil)]">
                {`Kat karşılığı arsa (v2.3 — %${(LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0)} + KDV)`}
              </h2>
              <p className="text-xs text-slate-400 mb-2">
                <button
                  type="button"
                  onClick={() => navigate(KKA_HUB_PATH)}
                  className="text-[var(--metin-ikincil)] hover:text-[var(--metin-ikincil)] hover:underline font-normal"
                >
                  Tam modül: hak ediş senaryosu ve havuz seçenekleri → {KKA_HUB_PATH}
                </button>
              </p>
              <p className="text-xs text-slate-400">
                <code className="text-[var(--metin-ikincil)]">commission/engine.ts</code> üzerinden{" "}
                <code className="text-[var(--metin-ikincil)]">masterFinancialEngine.ts</code> — üstteki{" "}
                <strong className="text-[var(--metin-ikincil)]">arsa rayiç matrahı</strong> üzerinden toplam{" "}
                {(LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0)}% (KDV hariç) hizmet havuzu; İhaleal / emlakçı payı
                havuz içinde bölünür. Müteahhit en az {((LAND_SHARE_TOTAL_EX_VAT_RATE / 2) * 100).toFixed(0)}%, arsa
                sahibi noterde kabul ederse +{((LAND_SHARE_TOTAL_EX_VAT_RATE / 2) * 100).toFixed(0)}% (aksi halde
                müteahhit kalan yükü de dahil tüm {(LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0)}% yükünü üstlenir
                — örnekte arsa sahibi noter kabulü yok).
              </p>
              <p className="text-xs text-slate-500">
                Arsa rayiç değeri olarak üstteki işlem tutarı kullanılır (varsayılan: tek emlakçı senaryosu).
              </p>
              {landPool ? (
                <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <dt>İhaleal payı (havuzdan)</dt>
                    <dd className="font-normal text-white">₺{landPool.platformTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Emlakçı payı (havuzdan)</dt>
                    <dd className="font-normal text-white">₺{landPool.agentPoolTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <dt>Müteahhit yükü (matrah)</dt>
                    <dd className="font-normal text-white">₺{landPool.contractorTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <dt>Arsa sahibi yükü (matrah)</dt>
                    <dd className="font-normal text-white">₺{landPool.ownerTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-400">
                    <dt>KDV (havuz matrahı üzerinden %{(RENTAL_COMMISSION_VAT_RATE * 100).toFixed(0)})</dt>
                    <dd className="font-normal text-white">₺{landPool.totalKdvTry.toLocaleString("tr-TR")}</dd>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <dt>Toplam {(LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0)}% havuz (KDV hariç)</dt>
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

          <Card className="border-[var(--cizgi)] bg-[#071326]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-normal text-[var(--metin-ikincil)]">Araçlar / Hesaplayıcılar (yatırımcı)</h2>
              <p className="text-xs text-slate-400">
                Bu blok teklif/ödeme çekirdeğine dokunmadan sadece ön karar desteği sağlar (mock hesap).
              </p>
              <div className="grid gap-4">
                <div className="rounded-[20px] border border-slate-700/70 p-3">
                  <p className="mb-2 text-xs font-normal text-[var(--metin-ikincil)]">Kredi hesaplayıcı</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input value={loanPrincipalStr} onChange={(e) => setLoanPrincipalStr(e.target.value)} inputMode="numeric" />
                    <Input value={loanMonthsStr} onChange={(e) => setLoanMonthsStr(e.target.value)} inputMode="numeric" />
                    <Input value={loanRateStr} onChange={(e) => setLoanRateStr(e.target.value)} inputMode="decimal" />
                  </div>
                  <p className="mt-2 text-sm text-white">Aylık taksit (tahmini): ₺{Math.round(monthlyInstallment).toLocaleString("tr-TR")}</p>
                </div>
                <div className="rounded-[20px] border border-slate-700/70 p-3">
                  <p className="mb-2 text-xs font-normal text-[var(--metin-ikincil)]">Kira getirisi</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={yieldPriceStr} onChange={(e) => setYieldPriceStr(e.target.value)} inputMode="numeric" />
                    <Input value={yieldRentStr} onChange={(e) => setYieldRentStr(e.target.value)} inputMode="numeric" />
                  </div>
                  <p className="mt-2 text-sm text-white">
                    Yıllık brüt getiri: %{annualYieldPct.toFixed(2)} · Amortisman: {amortizationYears.toFixed(1)} yıl
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-700/70 p-3">
                  <p className="mb-2 text-xs font-normal text-[var(--metin-ikincil)]">Tapu harcı (%4)</p>
                  <Input value={titleFeeBaseStr} onChange={(e) => setTitleFeeBaseStr(e.target.value)} inputMode="numeric" />
                  <p className="mt-2 text-sm text-white">Tahmini tapu harcı: ₺{Math.round(titleFee).toLocaleString("tr-TR")}</p>
                </div>
                <div className="rounded-[20px] border border-slate-700/70 p-3">
                  <p className="mb-2 text-xs font-normal text-[var(--metin-ikincil)]">Değer artışı vergisi</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input value={gainBuyStr} onChange={(e) => setGainBuyStr(e.target.value)} inputMode="numeric" />
                    <Input value={gainSellStr} onChange={(e) => setGainSellStr(e.target.value)} inputMode="numeric" />
                    <Input value={gainYearsStr} onChange={(e) => setGainYearsStr(e.target.value)} inputMode="numeric" />
                  </div>
                  <p className="mt-2 text-sm text-white">
                    Tahmini vergi: ₺{Math.round(estimatedCapitalGainTax).toLocaleString("tr-TR")}
                    {gainYears >= 5 ? " (5 yıl+ istisna varsayımı)" : ""}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-700/70 p-3">
                  <p className="mb-2 text-xs font-normal text-[var(--metin-ikincil)]">Aidat / gider etkisi</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={monthlyAidatStr} onChange={(e) => setMonthlyAidatStr(e.target.value)} inputMode="numeric" />
                    <Input value={monthlyOpsStr} onChange={(e) => setMonthlyOpsStr(e.target.value)} inputMode="numeric" />
                  </div>
                  <p className="mt-2 text-sm text-white">
                    Yıllık toplam aidat+gider: ₺{annualOpsTotal.toLocaleString("tr-TR")} (Aylık ₺{(monthlyAidat + monthlyOps).toLocaleString("tr-TR")})
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
