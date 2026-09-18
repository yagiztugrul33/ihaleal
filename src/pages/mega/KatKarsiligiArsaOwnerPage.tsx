import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Landmark, ShieldCheck, ListChecks, AlertTriangle, HelpCircle,
  Handshake, FileSignature, Building2, MessageCircle, Calculator, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KKA_HUB_PATH } from "@/lib/kkaHub";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { injectJsonLd, removeJsonLd } from "@/lib/seoStructuredData";

const OWNER_JOURNEY = [
  {
    title: "1. Ön değerlendirme",
    body: "Arsanın imar durumu (KAKS/emsal), tapu kaydı ve rayiç değeri SPK lisanslı eksper ile netleştirilir. Bu adım, hangi müteahhit teklifinin makul olduğunu anlamanın temelidir.",
  },
  {
    title: "2. Müteahhit seçimi ve teklif karşılaştırma",
    body: "Birden fazla müteahhitten pay oranı, teslim süresi ve teminat teklifi alınır. Sadece pay oranına değil; müteahhidin geçmiş projelerine, mali gücüne ve referanslarına bakılır.",
  },
  {
    title: "3. Sözleşme, noter ve tapu şerhi",
    body: "Kat karşılığı inşaat sözleşmesi noterde düzenlenir ve tapuya şerh edilir. Teslim tarihi, cezai şart, teminat mektubu ve ortak alan metrajı yazılı olarak netleştirilir.",
  },
  {
    title: "4. Ruhsat ve inşaat süreci",
    body: "Belediye yapı ruhsatı alınır, inşaat yapı denetim firması gözetiminde ilerler. Arsa sahibi bu aşamada düzenli ilerleme raporu talep edebilir.",
  },
  {
    title: "5. Hak ediş takibi",
    body: "Ödemeler/teslimler genelde dilimler halinde işler; bir dilim ancak bir önceki hakediş raporu veya kısmi kabul onaylandığında serbest kalır. Son dilim kesin kabul veya tapu devrine bağlıdır.",
  },
  {
    title: "6. Teslim ve tapu devri",
    body: "Kesin kabul sonrası kat irtifakı kat mülkiyetine döner ve arsa sahibine ait bağımsız bölümlerin tapusu devredilir.",
  },
];

const OWNER_RIGHTS = [
  "Sözleşmede belirtilen teslim tarihine uyulmaması halinde cezai şart talep hakkı.",
  "Teminat mektubu veya teminat senedi ile müteahhidin temerrüdüne karşı koruma.",
  "İnşaat ilerlemesini bağımsız yapı denetim raporlarıyla takip etme hakkı.",
  "Projeye ve ruhsata aykırı uygulamalarda durdurma/itiraz hakkı.",
  "Hak ediş dilimlerinin sözleşmede tanımlı koşullar sağlanmadan ödenmemesini isteme hakkı.",
];

const OWNER_RISKS = [
  {
    title: "Müteahhidin mali gücünün yetersiz kalması",
    mitigation: "Teminat mektubu/senedi ve kefil şartı; şirketin geçmiş proje ve mali durumu sözleşme öncesi araştırılır.",
  },
  {
    title: "Teslim süresinin uzaması",
    mitigation: "Sözleşmede gecikme başına işleyen cezai şart ve azami teslim tarihi net yazılır.",
  },
  {
    title: "İnşaat kalitesinin projeden düşük olması",
    mitigation: "Bağımsız yapı denetim firması raporları ve kabul aşamasında eksper/mimar kontrolü talep edilir.",
  },
  {
    title: "İmar planında süreç içinde değişiklik",
    mitigation: "Sözleşmeye imar değişikliği senaryosu ve tarafların yeniden müzakere hakkı madde olarak eklenir.",
  },
];

const OWNER_FAQ = [
  {
    q: "Arsamı kat karşılığı vermeden önce ne yapmalıyım?",
    a: "Önce arsanın imar durumunu (KAKS/emsal) belediyeden, tapu kaydını tapu müdürlüğünden ve rayiç değerini SPK lisanslı bir eksperden teyit edin. Bu üç bilgi olmadan alınan teklifler karşılaştırılamaz.",
  },
  {
    q: "Kaç müteahhitten teklif almalıyım?",
    a: "En az 2-3 müteahhitten pay oranı, teslim süresi ve teminat koşullarını içeren yazılı teklif almanız, piyasa rayicini görmenizi ve pazarlık gücünüzü artırır.",
  },
  {
    q: "Tapu şerhi olmadan kat karşılığı sözleşmesi güvenli midir?",
    a: "Hayır. Noter onaylı sözleşme tek başına yeterli değildir; sözleşmenin tapuya şerh edilmesi, arsanın üçüncü kişilere satılmasını veya ipotek edilmesini önler ve arsa sahibinin hakkını korur.",
  },
  {
    q: "Müteahhit inşaatı yarıda bırakırsa ne olur?",
    a: "Sözleşmede tanımlanan teminat mektubu/senedi ve cezai şart devreye girer; arsa sahibi tapu şerhi sayesinde arsa üzerindeki hakkını korur ve yeni bir müteahhitle devam etme veya hukuki yollara başvurma imkânına sahip olur. Süreç avukat desteğiyle yürütülmelidir.",
  },
  {
    q: "Hak ediş dilimlerim ne zaman ödenir/teslim edilir?",
    a: "Standart uygulamada ilk dilim emanette tutulur; her yeni dilim, bir önceki hakediş raporu veya kısmi kabul onaylandığında serbest kalır. Son dilim kesin kabul veya tapu devrine bağlanır.",
  },
];

export default function KatKarsiligiArsaOwnerPage() {
  const navigate = useNavigate();

  useEffect(() => {
    injectJsonLd("kat-karsiligi-arsa-faqpage", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: OWNER_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    return () => removeJsonLd("kat-karsiligi-arsa-faqpage");
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <PageBreadcrumbs
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Kat karşılığı", href: KKA_HUB_PATH },
            { label: "Arsa sahipleri için kat karşılığı" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-normal text-white flex items-center gap-2">
              <Landmark className="h-8 w-8 text-[var(--metin-ikincil)]" />
              Arsa sahipleri için kat karşılığı
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Arsanızı kat karşılığı vermeyi düşünüyorsanız süreç nasıl işler, hangi haklara
              sahipsiniz ve nelere dikkat etmelisiniz? Bu sayfa arsa sahibi gözünden adım adım
              anlatır; sayısal pay/hak ediş hesabı için hesaplayıcı modülüne yönlendirir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin-yumusak)] text-white border border-[var(--cizgi)]"
              onClick={() => navigate(KKA_HUB_PATH)}
            >
              <Calculator className="w-4 h-4" />
              Pay / hak ediş hesaplayıcı
            </Button>
            <Button variant="outline" className="border-white/15" onClick={() => navigate("/iletisim")}>
              <MessageCircle className="w-4 h-4" /> İletişime geçin
            </Button>
          </div>
        </div>

        {/* Giriş — kat karşılığı arsa sahibi için ne anlama gelir */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Handshake className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">Arsa sahibi için kat karşılığı ne demek?</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Kat karşılığı modelinde arsanızı satmak yerine bir müteahhide devredersiniz; müteahhit
              kendi kaynaklarıyla binayı inşa eder ve karşılığında yapılan bağımsız bölümlerin
              (dairelerin) bir kısmı size, kalanı müteahhide kalır. Böylece nakit sermaye koymadan,
              arsanızın değerini tamamlanmış konut/işyeri olarak geri almış olursunuz. Karşılığında
              inşaatın süresi, kalitesi ve teslimi konusunda müteahhide bağımlı kalırsınız — bu yüzden
              sözleşme, teminat ve takip süreci kritik önemdedir.
            </p>
          </CardContent>
        </Card>

        {/* Süreç — arsa sahibi gözünden adım adım */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <ListChecks className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">Süreç arsa sahibi gözünden nasıl işler?</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {OWNER_JOURNEY.map((step) => (
                <div key={step.title} className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-4">
                  <p className="text-sm font-normal text-[var(--metin-ikincil)] mb-1.5">{step.title}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Haklar */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <ShieldCheck className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">Arsa sahibi olarak haklarınız</h2>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {OWNER_RIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Riskler ve korunma */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">Ana riskler ve korunma yolları</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {OWNER_RISKS.map((risk) => (
                <div key={risk.title} className="rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30 p-4">
                  <p className="text-sm font-normal text-white mb-1.5">{risk.title}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{risk.mitigation}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 italic">
              Bu bilgiler eğitim amaçlıdır; sözleşme öncesi mutlaka avukat ve SPK lisanslı eksper desteği alın.
            </p>
          </CardContent>
        </Card>

        {/* İhaleal'ın rolü */}
        <Card className="border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <Building2 className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">İhaleal bu süreçte ne yapar?</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              İhaleal bir bilgi ve karar-destek platformudur; kat karşılığı sözleşmesinin tarafı değildir.
              Arsa sahibi olarak sürece hazırlanmanıza şu şekilde destek olur:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 mb-4">
              <li className="flex items-start gap-2">
                <FileSignature className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--metin-ikincil)]">Pay / hak ediş hesaplayıcı</strong> ile
                  farklı senaryolarda ne kadar daire/gelir alacağınızı ön analiz edebilirsiniz
                  (<button type="button" className="underline hover:text-white" onClick={() => navigate(KKA_HUB_PATH)}>kat karşılığı modülüne git</button>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Landmark className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--metin-ikincil)]">Kentsel dönüşüm</strong> kapsamındaki
                  riskli yapı/bölge bilgisi için ilgili modüle yönlendirir
                  (<button type="button" className="underline hover:text-white" onClick={() => navigate("/modul/kentsel-donusum")}>kentsel dönüşüm modülüne git</button>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
                <span>
                  Somut durumunuz için (arsanızın imar durumu, müteahhit teklifi değerlendirmesi vb.)
                  <strong className="text-[var(--metin-ikincil)]"> iletişime geçerek</strong> yönlendirme talep edebilirsiniz.
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin-yumusak)] text-white border border-[var(--cizgi)]"
                onClick={() => navigate("/iletisim")}
              >
                <MessageCircle className="w-4 h-4" /> İletişime geçin
              </Button>
              <Button variant="outline" className="border-white/15" onClick={() => navigate(KKA_HUB_PATH)}>
                <Calculator className="w-4 h-4" /> Hesaplayıcıya git
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-4 text-xs text-slate-400 leading-relaxed">
            Bu sayfadaki bilgiler <strong className="text-[var(--metin-ikincil)]">eğitim ve bilgilendirme amaçlıdır</strong>,
            yasal bağlayıcılığı yoktur. Kat karşılığı bir taşınmaz hukuku işlemidir; sözleşme imzalamadan
            önce mutlaka SPK lisanslı eksper, avukat ve mali müşavir desteği alın. İhaleal kat karşılığı
            sözleşmesinin tarafı değildir ve sözleşme, teminat, tapu işlemlerinden sorumlu tutulamaz.
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-[var(--cizgi)] bg-slate-900/40">
          <CardContent className="p-5">
            <div className="flex items-start gap-2 mb-3">
              <HelpCircle className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-normal text-white">Sık sorulan sorular</h2>
            </div>
            <div className="space-y-2">
              {OWNER_FAQ.map((item) => (
                <details key={item.q} className="group rounded-[10px] border border-[var(--cizgi)] bg-slate-900/30">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-normal text-white flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-slate-500 text-xs group-open:rotate-90 transition-transform">&#8250;</span>
                  </summary>
                  <p className="px-4 pb-4 text-xs leading-relaxed text-slate-400 border-t border-[var(--cizgi)] pt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
