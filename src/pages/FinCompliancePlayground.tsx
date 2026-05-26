import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { KKA_HUB_PATH } from "@/lib/kkaHub";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceDisclaimerBanner } from "@/components/tax/TaxDisclaimerBanner";
import {
  invoiceComposer,
  InvoiceBlockedError,
  TakasbankReconciliationService,
  stubTakasbankClient,
  type RevenueTemplate,
  type TaxProfile,
} from "@/lib/finance";
import { complianceNlpService } from "@/lib/compliance";
import { calculateRealFxReturn } from "@/lib/calculators/realFxReturnEngine";
import { calculateInvestmentReturns } from "@/lib/calculators/investmentReturnsEngine";

const DEMO_TEMPLATE: RevenueTemplate = {
  sku: "IHALEAL-DEMO-001",
  descriptionTr: "Platform hizmet bedeli (demo)",
  descriptionEn: "Platform service fee (demo)",
  defaultVatRate: 0.2,
  eligibleForTeknokent: false,
  forbiddenTermCheck: true,
  approvedBy: "demo",
  approvedAt: "2026-01-01",
};

const DEMO_TAX_PROFILE: TaxProfile = {
  id: "tp-demo",
  name: "Demo mukellef",
  isTeknokentExempt: false,
};

export default function FinCompliancePlayground() {
  const [invoiceJson, setInvoiceJson] = useState<string>("");
  const [invoiceErr, setInvoiceErr] = useState<string>("");
  const [chatText, setChatText] = useState("Merhaba, dusuk gosterelim mi?");
  const [nlpResult, setNlpResult] = useState<string>("");
  const [tbResult, setTbResult] = useState<string>("");
  const referenceReal = useMemo(
    () =>
      calculateRealFxReturn({
        initialTry: 1_000_000,
        finalTry: 1_350_000,
        annualInflationPct: 41.1,
        startUsdTry: 32.4,
        endUsdTry: 38.7,
      }),
    [],
  );
  const multiplierTr = useMemo(
    () =>
      calculateInvestmentReturns({
        propertyPriceTry: 6_000_000,
        monthlyRentTry: 28_000,
        annualExpensesTry: 42_000,
        annualAppreciationPct: 12,
        holdingYears: 5,
        city: "tr",
      }),
    [],
  );
  const multiplierIstanbul = useMemo(
    () =>
      calculateInvestmentReturns({
        propertyPriceTry: 6_000_000,
        monthlyRentTry: 28_000,
        annualExpensesTry: 42_000,
        annualAppreciationPct: 12,
        holdingYears: 5,
        city: "istanbul",
      }),
    [],
  );

  const runInvoice = () => {
    setInvoiceErr("");
    try {
      const ubl = invoiceComposer.compose({
        invoiceId: "INV-DEMO-1",
        issueDate: "2026-05-04",
        template: DEMO_TEMPLATE,
        taxProfile: DEMO_TAX_PROFILE,
        customer: {
          vkn: "1234567890",
          fullName: "Demo Alici A.S.",
          address: "Test cad.",
          city: "Istanbul",
          district: "Kadikoy",
          email: "demo@example.com",
        },
        lineItems: [
          {
            sku: DEMO_TEMPLATE.sku,
            descriptionRef: "Platform kullanim ucreti",
            quantity: 1,
            unitPrice: 1000,
            vatRate: 0.2,
            vatAmount: 200,
            lineTotal: 1200,
          },
        ],
        legalEntityVkn: "0987654321",
        legalEntityName: "IhaleAL Demo A.S.",
      });
      setInvoiceJson(JSON.stringify(ubl, null, 2));
    } catch (e) {
      if (e instanceof InvoiceBlockedError) {
        setInvoiceErr(e.message);
      } else {
        setInvoiceErr(e instanceof Error ? e.message : "Hata");
      }
      setInvoiceJson("");
    }
  };

  const runNlp = async () => {
    const sig = await complianceNlpService.scoreChatMessage(chatText, {
      messageId: "m1",
      threadId: "t1",
      senderId: "u1",
    });
    setNlpResult(JSON.stringify(sig, null, 2));
  };

  const runTakasbank = async () => {
    const svc = new TakasbankReconciliationService(stubTakasbankClient);
    const txId = "ihaleal-demo-500";
    svc.createRecord({ transactionId: txId, actualBiddingValue: 500000, epsilon: 100 });
    const res = await svc.verify(txId);
    setTbResult(JSON.stringify(res, null, 2));
  };

  return (
    <div className="container max-w-4xl py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Finans ve uyumluluk cekirdegi</h1>
          <p className="text-sm text-muted-foreground">
            InvoiceComposer, ComplianceNlpService, Takasbank stub. İlgili ürün sayfası:{" "}
            <Link to={KKA_HUB_PATH} className="text-primary underline-offset-2 hover:underline">
              Kat karşılığı (KKA)
            </Link>
            , hukuk taslağı: <code className="text-xs">docs/hukuk/FINANCE_TAX_BILLING_CORE_RULES_TASLAK.md</code>.
          </p>
        </div>
      </div>

      <InvoiceDisclaimerBanner />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hesaplama referans tutarlılığı (2026)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            KFE Nisan 2026 örneği: nominal +%35 getiri, enflasyon +%41,1 ise reel getiri{" "}
            <strong>%{referenceReal.realReturnPct.toFixed(2)}</strong> olur.
          </p>
          <p className="text-muted-foreground">
            Kira çarpanı benchmark: Türkiye <strong>{multiplierTr.referenceMultiplierMonths}</strong> ay, İstanbul{" "}
            <strong>{multiplierIstanbul.referenceMultiplierMonths}</strong> ay.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">e-Fatura UBL (ornek)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" onClick={runInvoice}>
            Ornek fatura uret
          </Button>
          {invoiceErr && <p className="text-sm text-destructive">{invoiceErr}</p>}
          {invoiceJson && (
            <pre className="text-xs overflow-auto max-h-64 rounded-lg border p-3 bg-muted/40">{invoiceJson}</pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sohbet risk skoru (NLP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Mesaj</Label>
            <Textarea value={chatText} onChange={(e) => setChatText(e.target.value)} rows={3} />
          </div>
          <Button type="button" variant="secondary" onClick={() => void runNlp()}>
            Skorla
          </Button>
          {nlpResult && (
            <pre className="text-xs overflow-auto max-h-48 rounded-lg border p-3 bg-muted/40">{nlpResult}</pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Takasbank mutabakat (stub)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" variant="outline" onClick={() => void runTakasbank()}>
            Stub reconcile calistir
          </Button>
          {tbResult && (
            <pre className="text-xs overflow-auto max-h-48 rounded-lg border p-3 bg-muted/40">{tbResult}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
