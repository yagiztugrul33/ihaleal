import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CreditCard, Shield, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTaxRuntimeAuditLog,
  getTaxRuntimeConfig,
  updateTaxRuntimeConfig,
  type TaxRuntimeConfig,
  type TaxConfigAuditLog,
} from "@/lib/taxConfig";

const PREFS_KEY = "ihaleal_notification_prefs";

type NotifPrefs = {
  emailBid: boolean;
  emailEnding: boolean;
  emailPrice: boolean;
  pushBid: boolean;
  pushEnding: boolean;
  smsEnding: boolean;
  reminder1h: boolean;
  reminder24h: boolean;
};

const defaultPrefs: NotifPrefs = {
  emailBid: true,
  emailEnding: true,
  emailPrice: true,
  pushBid: true,
  pushEnding: false,
  smsEnding: false,
  reminder1h: true,
  reminder24h: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>(() => {
    try {
      const r = localStorage.getItem(PREFS_KEY);
      return r ? { ...defaultPrefs, ...JSON.parse(r) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });
  const [taxConfig, setTaxConfig] = useState<TaxRuntimeConfig>(() => getTaxRuntimeConfig());
  const [taxAudit, setTaxAudit] = useState<TaxConfigAuditLog[]>(() => getTaxRuntimeAuditLog());

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const patch = (p: Partial<NotifPrefs>) => setPrefs((prev) => ({ ...prev, ...p }));
  const canEditTaxConfig =
    Boolean(profile?.isAdmin) ||
    (user?.email ?? "").toLowerCase().includes("admin") ||
    (user?.email ?? "").toLowerCase().includes("musavir") ||
    (user?.email ?? "").toLowerCase().includes("expert");

  const updateRate = (key: keyof TaxRuntimeConfig, value: string) => {
    const numeric = Number(value.replace(",", "."));
    if (!Number.isFinite(numeric)) return;
    const normalized =
      key === "rentalExemptionTry2026" || key === "saleTaxFreeAfterYears"
        ? Math.round(numeric)
        : key.endsWith("Rate")
          ? numeric / 100
          : numeric;
    const actor = user?.email ?? "unknown-user";
    const next = updateTaxRuntimeConfig(
      { [key]: normalized } as Partial<TaxRuntimeConfig>,
      actor,
      "Mali müşavir onayı bekliyor (mock admin değişikliği).",
    );
    setTaxConfig(next);
    setTaxAudit(getTaxRuntimeAuditLog());
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message: `${key} güncellendi (mock).`, type: "success" } }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <h1 className="text-3xl font-bold text-white mb-2">Ayarlar</h1>
        <p className="text-slate-400 text-sm mb-8">Bildirim tercihleri yerel oturumda saklanır. Üyelik ücretleri iş modeli ile uyumludur.</p>

        <Card className="border-slate-200 bg-slate-900/45 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
              <Bell className="w-5 h-5 text-violet-400" />
              Bildirim tercihleri
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">E-posta</p>
                <div className="space-y-3">
                  <PrefRow label="Yeni teklif / ihale güncellemesi" checked={prefs.emailBid} onCheckedChange={(v) => patch({ emailBid: v })} />
                  <PrefRow label="İhale bitiş hatırlatması" checked={prefs.emailEnding} onCheckedChange={(v) => patch({ emailEnding: v })} />
                  <PrefRow label="Fiyat / teklif bandı değişimi" checked={prefs.emailPrice} onCheckedChange={(v) => patch({ emailPrice: v })} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Push</p>
                <div className="space-y-3">
                  <PrefRow label="Anlık teklif bildirimi" checked={prefs.pushBid} onCheckedChange={(v) => patch({ pushBid: v })} />
                  <PrefRow label="Bitiş uyarısı" checked={prefs.pushEnding} onCheckedChange={(v) => patch({ pushEnding: v })} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">SMS</p>
                <PrefRow label="Kritik hatırlatmalar" checked={prefs.smsEnding} onCheckedChange={(v) => patch({ smsEnding: v })} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">İhale sonu hatırlatma süresi</p>
                <div className="space-y-3">
                  <PrefRow label="1 saat önce" checked={prefs.reminder1h} onCheckedChange={(v) => patch({ reminder1h: v })} />
                  <PrefRow label="24 saat önce" checked={prefs.reminder24h} onCheckedChange={(v) => patch({ reminder24h: v })} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/45 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3 text-white font-semibold">
              <CreditCard className="w-5 h-5 text-teal-400" />
              Üyelik (bilgilendirme)
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Yıllık satıcı üyeliği <strong className="text-slate-200">5.000 TL</strong>, yıllık alıcı üyeliği{" "}
              <strong className="text-slate-200">1.000 TL</strong> hedef fiyatlandırması ile uyumludur. Aylık liste paketi veya ilan başına ücret modeli kullanılmaz.
            </p>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/uyelik/yillik">Yıllık üyelik sayfası</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/45">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3 text-white font-semibold">
              <Shield className="w-5 h-5 text-blue-400" />
              Güvenlik
            </div>
            <p className="text-sm text-slate-400 mb-4">
              İki adımlı doğrulama ve oturum geçmişi üretim ortamında hesap güvenliği ayarlarından yönetilir; burada yalnızca kısayollar gösterilir.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-white/15" asChild>
                <Link to="/guvenlik">Güvenlik merkezi</Link>
              </Button>
              <Button variant="outline" size="sm" className="border-white/15 gap-2" asChild>
                <Link to="/giris">
                  <Mail className="w-4 h-4" /> Oturum (giriş)
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="border-white/15 gap-2" type="button" onClick={() => navigate("/guvenlik")} title="Güvenlik yol haritası">
                <Smartphone className="w-4 h-4" /> MFA yol haritası
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/45 mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3 text-white font-semibold">
              <CreditCard className="w-5 h-5 text-amber-300" />
              Parametrik oran yönetimi (mock admin)
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Komisyon/KDV/stopaj/istisna oranları hardcode olmadan parametrelenir. Güncellemeler audit log ile tutulur.
              <span className="block mt-1 text-amber-200">Mali müşavir onayı bekliyor.</span>
            </p>
            {!canEditTaxConfig ? (
              <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Bu panel yalnızca admin/uzman rolü için düzenlenebilir. Siz görüntüleme modundasınız.
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              <RateInput label="Satıcı komisyon (%)" value={taxConfig.sellerCommissionRate * 100} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("sellerCommissionRate", v)} />
              <RateInput label="Alıcı komisyon (%)" value={taxConfig.buyerCommissionRate * 100} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("buyerCommissionRate", v)} />
              <RateInput label="KDV (%)" value={taxConfig.vatRate * 100} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("vatRate", v)} />
              <RateInput label="Stopaj (%)" value={taxConfig.withholdingRate * 100} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("withholdingRate", v)} />
              <RateInput label="Kira istisnası 2026 (TL)" value={taxConfig.rentalExemptionTry2026} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("rentalExemptionTry2026", v)} />
              <RateInput label="5 yıl+ satış vergisiz (yıl)" value={taxConfig.saleTaxFreeAfterYears} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("saleTaxFreeAfterYears", v)} />
              <RateInput label="Yeniden değerleme 2026 (%)" value={taxConfig.revaluationRate2026 * 100} disabled={!canEditTaxConfig} onCommit={(v) => updateRate("revaluationRate2026", v)} />
            </div>
            <p className="mt-4 text-xs text-slate-400">
              2026 referansları: kira istisnası <strong className="text-slate-200">58.000</strong>, 5 yıl+ satışta vergi istisnası,
              yeniden değerleme <strong className="text-slate-200">%49</strong> (parametrik; mali müşavir teyidi gerekir).
            </p>
            <p className="mt-1 text-xs text-amber-200">Bilgilendirme: satış kazancınız vergiye tabi olabilir, mali müşavire danışın.</p>
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-black/20 p-3">
              <p className="text-xs font-semibold text-white mb-2">Değişiklik kayıtları</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {taxAudit.length === 0 ? (
                  <p className="text-xs text-slate-500">Henüz değişiklik kaydı yok.</p>
                ) : (
                  taxAudit.slice(0, 8).map((row) => (
                    <p key={`${row.atIso}-${row.actor}`} className="text-[11px] text-slate-300">
                      {new Date(row.atIso).toLocaleString("tr-TR")} · {row.actor} · {Object.keys(row.changes).join(", ")} · {row.note}
                    </p>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrefRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/[0.02] px-3 py-2.5">
      <Label htmlFor={label} className="text-sm text-slate-300 cursor-pointer flex-1">
        {label}
      </Label>
      <Switch id={label} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function RateInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => {
    setLocal(String(value));
  }, [value]);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/[0.02] p-3">
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <Input
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onCommit(local)}
        className="bg-slate-950 border-slate-200 text-white h-9"
      />
    </div>
  );
}
