import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { SERVICE_FEES, SERVICE_FEE_LABELS } from "@/lib/fees";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ServiceKey = keyof typeof SERVICE_FEES;

export default function HizmetBedelleri() {
  const { user } = useAuth();
  const [busy, setBusy] = useState<ServiceKey | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const buy = async (service_type: ServiceKey) => {
    setMsg(null);
    if (!user) {
      setMsg("Önce giriş yapın.");
      return;
    }
    setBusy(service_type);
    const { error } = await supabase.from("service_fees").insert({
      user_id: user.id,
      listing_id: null,
      service_type,
      amount_try: SERVICE_FEES[service_type],
      status: "paid",
    });
    setBusy(null);
    if (error) setMsg(error.message);
    else setMsg(`${SERVICE_FEE_LABELS[service_type]} kaydı oluşturuldu.`);
  };

  const entries = Object.keys(SERVICE_FEES) as ServiceKey[];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Hizmet bedelleri</h1>
        <p className="text-slate-400 mb-8">
          Sekiz isteğe bağlı kalem; demo akışta doğrudan <code className="text-teal-400/90">service_fees</code> tablosuna yazılır.
        </p>
        {msg ? <div className="mb-6 text-sm text-teal-300/90">{msg}</div> : null}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entries.map((key) => (
            <Card key={key} className="bg-slate-900/50 border-slate-200">
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-white leading-snug">{SERVICE_FEE_LABELS[key]}</p>
                <p className="text-lg font-bold text-amber-400">
                  ₺{SERVICE_FEES[key].toLocaleString("tr-TR")}
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => void buy(key)}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {busy === key ? "Kaydediliyor..." : "Satın al"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
