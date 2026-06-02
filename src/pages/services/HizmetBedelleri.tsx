import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { SERVICE_FEES, SERVICE_FEE_DYNAMIC } from "@/lib/fees";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ServiceKey = keyof typeof SERVICE_FEES;

export default function HizmetBedelleri() {
  const { user } = useAuth();
  const { t } = useLocale();
  const sf = t.serviceFees;
  const [busy, setBusy] = useState<ServiceKey | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const buy = async (service_type: ServiceKey) => {
    setMsg(null);
    if (!user) {
      setMsg(sf.loginFirst);
      return;
    }
    setBusy(service_type);
    // ÇEKİRDEK: hizmet bedeli kaydı + tutar (SERVICE_FEES) — DOKUNULMADI (sadece görünür etiket i18n).
    const { error } = await supabase.from("service_fees").insert({
      user_id: user.id,
      listing_id: null,
      service_type,
      amount_try: SERVICE_FEES[service_type],
      status: "paid",
    });
    setBusy(null);
    if (error) setMsg(error.message);
    else setMsg(sf.recordCreated.replace("{label}", sf.labels[service_type]));
  };

  const entries = Object.keys(SERVICE_FEES) as ServiceKey[];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">{sf.pageTitle}</h1>
        <p className="text-slate-400 mb-3">{sf.intro1}</p>
        <p className="text-slate-400 mb-2">{sf.intro2}</p>
        <p className="text-slate-400 mb-8">{sf.intro3}</p>
        {msg ? <div className="mb-6 text-sm text-teal-300/90">{msg}</div> : null}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entries.map((key) => (
            <Card key={key} className="bg-slate-900/50 border-slate-200">
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-white leading-snug">{sf.labels[key]}</p>
                <p className="text-xs leading-relaxed text-slate-400">{sf.descriptions[key]}</p>
                <p className="text-lg font-bold text-amber-400">
                  {SERVICE_FEE_DYNAMIC[key] ? (
                    sf.dynamicBidEntry
                  ) : (
                    <span dir="ltr">₺{SERVICE_FEES[key].toLocaleString("tr-TR")}</span>
                  )}
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => void buy(key)}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {busy === key ? sf.saving : sf.purchase}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-base font-semibold text-white mb-2">{sf.modelSummaryTitle}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{sf.modelSummaryBody}</p>
        </div>
      </div>
    </div>
  );
}
