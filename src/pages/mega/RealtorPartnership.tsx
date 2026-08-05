import { useState } from "react";
import { Building2, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { RealtorPartnershipPayload } from "@/types/megaContent";
import { REALTOR_B2B_RATE, VAT_RATE } from "@/lib/fees";

type PartnershipStep = {
  title: string;
  subtitle: string;
  desc: string;
  bullets: string[];
};

const STEPS: PartnershipStep[] = [
  {
    title: "Başvuru",
    subtitle: "Kurumsal kayıt ve belge paketi",
    desc:
      "Ticari ünvan, vergi kimliği ve iletişim matrisi ile birlikte taşınmaz ticareti yetki belgesi özetinizi dijital kanaldan iletirsiniz. Başvuru; KVKK kapsamında işlenecek verilerin doğruluğu ve kurumsal temsil yetkisinin netleşmesi için tek kaynaklı formatta toplanır.",
    bullets: [
      "Şirket ve yetkili temsil bilgileri",
      "VKN / TCKN ve operasyon e-postası",
      "Yetki belgesi ve ofis kapsamı özeti (TTBS çizgisi ile uyum hedefi)",
    ],
  },
  {
    title: "Ön değerlendirme",
    subtitle: "Operasyon ve uygunluk incelemesi",
    desc:
      "İhaleal operasyon ekibi; bölge kapasitesi, mevcut iş ortaklığı yoğunluğu ve temel uygunluk notunu değerlendirir. Amaç, platform kalitesi ve tüketici güveni için çakışmasız, ölçeklenebilir bir dağılım sağlamaktır. Üretimde sonuç kayıtlı bildirim veya portal durumu ile paylaşılır (demo: manuel süreç).",
    bullets: [
      "Bölge ve segment uygunluğu",
      "Çakışma / yoğunluk kontrolü",
      "KYC / AML hattı ile hizalanma (hedef entegrasyon)",
    ],
  },
  {
    title: "Sözleşme / onboarding",
    subtitle: "Yazılı çerçeve ve mali netlik",
    desc:
      "Ortak emlakçı modeline ilişkin sözleşme ve ekler imzalanır; B2B hizmet bedeli matrahı, KDV ve fatura teslim süreleri yazılı hale getirilir. İletişim ve eskalasyon kanalları (kayıtlı e-posta, destek hattı) resmen tanımlanır; böylece teklif ve kapanış süreçlerinde tek muhataplık korunur.",
    bullets: [
      "agency_contract ve ek protokoller (avukat onayı)",
      "Faturalama periyodu ve e-fatura çizgisi",
      "Kayıtlı bildirim ve destek SLA metni (hedef)",
    ],
  },
  {
    title: "Yayında aktifleştirme",
    subtitle: "Panel ve yayın kuralları",
    desc:
      "Yetkilendirilmiş kullanıcılar için panel erişimi açılır; ilan oluşturma, vitrin ve teklif yönlendirme kuralları üretim politikasına göre etkinleştirilir. Komisyon motoru ve denetim izleri ile uyumlu hareket edilmesi için iç eğitim özeti ve hızlı kontrol listesi paylaşılır.",
    bullets: [
      "Rol bazlı panel ve yetki matrisi",
      "İlan / ihale yayın kuralları ve moderasyon hattı",
      "Performans ve şikâyet yönetimi için teknik iz sütunu (hedef)",
    ],
  },
];

const ADV = [
  { title: "Şeffaf B2B payı", desc: `İşlem tutarı üzerinden yaklaşık %${(REALTOR_B2B_RATE * 100).toFixed(0)} matrah; üretimde faturalama politikası ile uyumlu.` },
  { title: "Liste / paket satışı yok", desc: "Abonelik veya vitrin paketi satılmaz; tahakkuk işlem bazlıdır." },
  { title: "Çoklu ofis uyumu", desc: "Kurumsal çatı altında yetkilendirilmiş kullanıcı modelleri değerlendirilebilir." },
  { title: "Operasyon iletişimi", desc: "Teklif ve teslimat süreçlerinde kayıtlı bildirim hatları hedeflenir." },
];

const CONDITIONS = [
  "Türkiye’de taşınmaz ticareti yetkisine sahip tüzel kişilik veya yetkilendirilmiş ofis.",
  "Şirket ünvanı, vergi numarası ve iletişim doğrulanabilir olmalı.",
  "KVKK ve çerez politikasının kabulü (demo formunda yer tutucu).",
];

export default function RealtorPartnershipPage() {
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [taxIdOrTc, setTaxIdOrTc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!kvkk) return;
    const payload: RealtorPartnershipPayload = {
      companyLegalName: companyLegalName.trim(),
      taxIdOrTc: taxIdOrTc.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      notes: notes.trim(),
      kvkkAccepted: true,
      submittedAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("ihaleal_partner_apps") || "[]");
      if (!Array.isArray(prev)) throw new Error();
      prev.push(payload);
      localStorage.setItem("ihaleal_partner_apps", JSON.stringify(prev));
    } catch {
      localStorage.setItem("ihaleal_partner_apps", JSON.stringify([payload]));
    }
    setSent(true);
  }

  const exampleSale = 10_000_000;
  const exampleB2B = exampleSale * REALTOR_B2B_RATE;
  const exampleVat = exampleB2B * VAT_RATE;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-14">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Emlakçı ortaklığı</h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Ortak emlakçı payı iş modeline uygun, kurumsal onaylı partner alım süreci. Başvurular demo ortamında tarayıcıda saklanır; üretimde güvenli kanal ve sözleşme akışı tanımlanır. Liste veya vitrin paketi satışı yapılmaz; gelir işlem bazlı tahakkuk eder.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-white">Kurumsal süreç</h2>
          <p className="mt-2 mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
            Dört aşamalı çerçeve; başvurudan canlı ortama kadar şeffaf kontrol noktaları ve yazılı taahhütlerle ilerler. Aşamalar arası geri dönüş, yalnızca operasyon ve hukuk onayı ile yapılır.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-900/40 p-4">
                <span className="mb-3 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-violet-300/90">{s.subtitle}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">{s.desc}</p>
                <ul className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3 text-[11px] leading-snug text-slate-500">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="shrink-0 text-teal-500/80" aria-hidden>
                        ·
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-lg font-semibold text-white">Avantajlar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ADV.map((a) => (
              <Card key={a.title} className="border-slate-200 bg-slate-900/40">
                <CardContent className="flex gap-3 p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-400" />
                  <div>
                    <h3 className="font-medium text-white">{a.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{a.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Başvuru koşulları (özet)</h2>
          <ul className="space-y-2 text-sm text-slate-400">
            {CONDITIONS.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="text-teal-500/80">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <Card className="border-teal-500/20 bg-teal-950/15">
          <CardContent className="space-y-2 p-6">
            <h2 className="text-lg font-semibold text-white">Komisyon yapısı — örnek</h2>
            <p className="text-sm text-slate-400">
              ₺{(exampleSale / 1_000_000).toFixed(0)}M tutarında işlem için ortak emlakçı B2B matrahı yaklaşık{" "}
              <span className="text-teal-300">₺{Math.round(exampleB2B).toLocaleString("tr-TR")}</span>
              {" "}(işlem üzerinden %{(REALTOR_B2B_RATE * 100).toFixed(0)}); KDV {(VAT_RATE * 100).toFixed(0)}% ile yaklaşık{" "}
              <span className="text-teal-300">₺{Math.round(exampleVat).toLocaleString("tr-TR")}</span>. Kesin tutarlar sözleşme ve fatura ile ilişkilidir.
            </p>
          </CardContent>
        </Card>

        {sent ? (
          <Card className="border-emerald-500/30 bg-emerald-950/20">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-medium text-white">Başvurunuz kaydedildi (demo).</p>
              <p className="mt-2 text-sm text-slate-400">Üretimde ekibe iletilecek iş akışı tanımlanır.</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Başvuru formu</h2>
            <Card className="border-slate-200 bg-slate-900/50">
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label className="text-slate-300">Ticari ünvan</Label>
                  <Input required value={companyLegalName} onChange={(e) => setCompanyLegalName(e.target.value)} className="mt-2 bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">VKN veya yetkili TCKN</Label>
                  <Input required value={taxIdOrTc} onChange={(e) => setTaxIdOrTc(e.target.value)} className="mt-2 bg-slate-950 border-slate-200 text-white" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-slate-300">E-posta</Label>
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 bg-slate-950 border-slate-200 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Telefon</Label>
                    <Input required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 bg-slate-950 border-slate-200 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Şehir</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 bg-slate-950 border-slate-200 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Notlar</Label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                    placeholder="Taşınmaz ticareti yetki belgesi özeti, referans vb."
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="kvkk" checked={kvkk} onCheckedChange={(v) => setKvkk(v === true)} required />
                  <label htmlFor="kvkk" className="cursor-pointer text-sm text-slate-400">
                    Kişisel verilerimin işlenmesine ilişkin bilgilendirme metnini okudum.
                  </label>
                </div>
                <Button type="submit" className="w-full gap-2 [background:var(--gradient-cta)] font-semibold text-white">
                  <Send className="rtl:-scale-x-100 h-4 w-4" /> Gönder (demo)
                </Button>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
