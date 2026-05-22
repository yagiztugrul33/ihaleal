import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { SERVICE_FEES, SERVICE_FEE_LABELS } from "@/lib/fees";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ServiceKey = keyof typeof SERVICE_FEES;

const SERVICE_DESCRIPTIONS: Record<ServiceKey, string> = {
  photo: "Profesyonel çekim paketi ile ilanın ilk temas kalitesi artar; açılar, ışık ve kompozisyon satış hızını destekleyecek formatta hazırlanır.",
  drone: "Parsel, çevre ve ulaşım bağlantılarını yukarıdan gösteren dron çekimleri. Özellikle arsa ve büyük ölçekli portföylerde karar süresini kısaltır.",
  legal: "Hukuki ön kontrol paketi. Sözleşme dili, evrak bütünlüğü ve işlem sırası netleşir; nihai hukuki görüş ilgili uzmanla tamamlanır.",
  expertise: "Ekspertiz raporu üretim hazırlığı. Değer bandı, teknik durum ve karşılaştırmalı analiz başlıkları tek raporda toplanır.",
  bid_entry: "İhaleye giriş operasyonu. Katılım şartlarının doğrulanması, teklif adımı hazırlığı ve kullanıcı bilgilendirme süreci için başlangıç kalemidir.",
  virtual_tour: "360 sanal tur üretimi. Uzaktan inceleme oranını artırır, fiziksel ziyaret öncesi ön eleme kalitesini yükseltir.",
  video: "Kısa video tanıtım paketi. Sosyal ve kampanya dağıtımı için optimize edilmiş hızlı anlatım formatı sağlar.",
  tapu_prep: "Tapu randevu ve dosya hazırlık kalemi. Evrak setinin doğru sıra ile toplanmasına ve kapanış gününün gecikmeden ilerlemesine destek olur.",
};

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
        <p className="text-slate-400 mb-3">
          Sekiz isteğe bağlı kalem; demo akışta doğrudan <code className="text-teal-400/90">service_fees</code> tablosuna yazılır.
        </p>
        <p className="text-slate-400 mb-2">
          Bu sayfa, işlem yaşam döngüsünde hangi adım için hangi operasyon paketinin devreye girdiğini şeffaflaştırır. Her kalem tek başına
          satın alınabilir; kurumlar ihtiyaçlarına göre farklı kombinasyonlar oluşturabilir.
        </p>
        <p className="text-slate-400 mb-8">
          Ücretler referans niteliğindedir, nihai kapsam ve bedel sözleşme ile kesinleşir. Amaç, tekliften kapanışa kadar maliyetin
          sonradan sürpriz olmadan önden planlanabilmesidir.
        </p>
        {msg ? <div className="mb-6 text-sm text-teal-300/90">{msg}</div> : null}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entries.map((key) => (
            <Card key={key} className="bg-slate-900/50 border-slate-200">
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-white leading-snug">{SERVICE_FEE_LABELS[key]}</p>
                <p className="text-xs leading-relaxed text-slate-400">{SERVICE_DESCRIPTIONS[key]}</p>
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
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-900/40 p-4">
          <h2 className="text-base font-semibold text-white mb-2">Hizmet modeli özeti</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Düşük hacimli kullanıcılar tekil paketlerle başlayabilir; çok ofisli ekipler ise hukuk + due diligence + premium support
            kombinasyonuyla daha kontrollü bir operasyon kurabilir. Satın alma akışı demo modunda kayıt oluşturur, gerçek tahsilat
            üretim aktivasyonu sonrası yürütülür.
          </p>
        </div>
      </div>
    </div>
  );
}
