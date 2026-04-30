import { FileSignature } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CONTRACTS = [
  {
    title: "Ön bilgilendirme / mesafeli hizmet",
    desc: "Üyelik ve platform hizmetine ilişkin özet şartlar; üretimde hukuk onayı.",
    status: "Taslak",
  },
  {
    title: "Teklif ve katılım şartnamesi",
    desc: "İhale turunda bağlayıcı kurallar, teminat ve süre uzatma çizgisi.",
    status: "Taslak",
  },
  {
    title: "Aracılık ve komisyon çerçevesi",
    desc: "Komisyon matrahı, mahsup ve B2B ortak payı faturalama düzeni.",
    status: "Taslak",
  },
  {
    title: "KVKK ve iletişim rızası",
    desc: "Kişisel veri işleme ve bildirim kanalları için çerçeve metni.",
    status: "Taslak",
  },
];

/** E-imza: üretimde zaman damgalı ve saklama politikası ile tamamlanır (demo metin). */
export default function DigitalContractsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-start gap-3">
          <div className="rounded-xl bg-sky-500/15 p-3 text-sky-400">
            <FileSignature className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Dijital sözleşme</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Dört sözleşme tipi için çerçeve (demo). E-imza entegrasyonu üretimde güvenilir zaman damgası ve saklama ile tamamlanır; bağlayıcı hukuki görüş değildir.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {CONTRACTS.map((c) => (
            <Card key={c.title} className="border-white/10 bg-slate-900/40">
              <CardContent className="space-y-2 p-6">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.status}</span>
                <h2 className="text-lg font-semibold text-white">{c.title}</h2>
                <p className="text-sm text-slate-400">{c.desc}</p>
                <p className="text-xs text-slate-600">E-imza akışı demo — gerçek imza yok.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
