import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Gavel,
  Scale,
  ShieldCheck,
  Printer,
} from "lucide-react";
import type { IhalealPlatformRule, RuleSeverity } from "@/data/anayasa400IhalealRules";
import { IHALEAL_PLATFORM_RULES } from "@/data/anayasa400IhalealRules";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FIRST_COUNT = 18;

/** İlk 18 kural i뿯½in: Neden + İhlal sonucu (uygulama metni JSON `desc` alanından gelir). */
const SECTION_EXTRA: Record<number, { neden: string; ihlalSonucu: string }> = {
  1: {
    neden:
      "Ruhsat tek doğruluk kaynağı olduğunda stok, birim ve yetki karmaşası azalır; alıcı tek kanaldan g뿯½venle işlem g뿯½r뿯½r.",
    ihlalSonucu:
      "Ruhsat dışı veya paralel kanal satışları Bypass 뿯½izgisinde değerlendirilir; hesap kısıtları ve s뿯½zleşmesel cezai şartlar uygulanabilir.",
  },
  2: {
    neden:
      "Barter ve m뿯½teahhit tahsisleri gizlenirse rekabet bozulur ve alıcılar kapasiteyi yanlış g뿯½r뿯½r; şeffaf beyan zorunludur.",
    ihlalSonucu:
      "Beyan dışı devirler hukuki ihlal sayılır; ilan askıya alınması, 뿯½deme blokajı ve tahkim / dava s뿯½re뿯½leri tetiklenebilir.",
  },
  3: {
    neden:
      "İhale başladıktan sonra stoğu 뿯½ekmek teklif g뿯½venini ve fiyat keşfini bozar; s뿯½reklilik kuralı korunmalıdır.",
    ihlalSonucu:
      "Platform dışı satış veya m뿯½lk dondurma Bypass cezasını tetikler; teminat ve komisyon 뿯½zerinden genişletilmiş yaptırımlar devreye girebilir.",
  },
  4: {
    neden:
      "Fabrika, otel ve ticari alanlarda teknik uygunluk yoksa yanlış fiyatlama ve g뿯½venlik riski doğar; doğrulama 뿯½n şarttır.",
    ihlalSonucu:
      "Trafo, 뿯½ED veya itfaiye doğrulaması tamamlanmadan ilan aktifleşmez; eksik evrakta s뿯½re뿯½ hukuki beklemede kalır.",
  },
  5: {
    neden:
      "Ger뿯½ek kişi m뿯½teahhit 뿯½ld뿯½ğ뿯½nde TMK halefiyeti ile y뿯½k뿯½ml뿯½l뿯½kler kesintisiz devam etmeli; alıcı mağdur olmamalıdır.",
    ihlalSonucu:
      "Miras뿯½ı kaydı işlenmeden devir veya 뿯½deme 뿯½ıkışı yapılırsa işlem durdurulur; tapu ve teminat uyuşmazlığı riski oluşur.",
  },
  6: {
    neden:
      "Mirasın reddi halinde havuzdaki alıcı parasının iadesi g뿯½venin temelidir; s뿯½re뿯½ şeffaf olmalıdır.",
    ihlalSonucu:
      "İade gecikmesi veya kesinti kullanıcı şikayeti ve d뿯½zenleyici izlenebilirlik riskini artırır; hesap denetimi başlatılabilir.",
  },
  7: {
    neden:
      "Ehliyet kaybında işlem yetkisi belirsizdir; vasilik kaydı gelene kadar beklemek hukuki ge뿯½erlilik i뿯½in gereklidir.",
    ihlalSonucu:
      "Mahkeme kararı sisteme işlenmeden s뿯½zleşme ve 뿯½deme adımları ilerletilirse işlem ge뿯½ersizlik ve iade talepleriyle sonu뿯½lanabilir.",
  },
  8: {
    neden:
      "Konkordato s뿯½recinde alacaklıların iradesi korunmalı; komiser onayı olmadan devir tasarrufu ihlal oluşturur.",
    ihlalSonucu:
      "Dijital muvafakat olmadan m뿯½lk devri veya satış yapılamaz; ihlalde s뿯½re뿯½ durdurulur ve hukuki takip başlatılır.",
  },
  9: {
    neden:
      "İflasta kullanıcı parasının masaya dahil edilmemesi temel alıcı koruma kuralıdır; şeffaf mutabakat şarttır.",
    ihlalSonucu:
      "Para m뿯½teahhide haksız aktarılırsa iflas masası ve iade davaları g뿯½ndeme gelir; platform kayıtları delil olarak kullanılır.",
  },
  10: {
    neden:
      "İpoteklerin mahsubu olmadan tapu teslimi temiz olmaz; alıcı beklenmedik bor뿯½la karşılaşmamalıdır.",
    ihlalSonucu:
      "Mahsup atlama tapu iptali ve tazminat zinciri riski doğurur; işlem geri alınır ve cezai şart kalemleri devreye alınabilir.",
  },
  11: {
    neden:
      "Sabit bedelli poli뿯½e enflasyon ve inşaat maliyeti artışında yetersiz kalır; yenileme bedeli endeksli olmalıdır.",
    ihlalSonucu:
      "Poli뿯½e uyumsuzluğu teslim ve garanti şartlarında ihlal olarak işlenir; eksik sigorta d뿯½zeltimi talep edilir.",
  },
  12: {
    neden:
      "Ceza ve tazminatların 뿯½deme g뿯½n뿯½n뿯½n rayicine g뿯½re g뿯½ncellenmesi mağduriyeti 뿯½nler; tarih oyunları engellenir.",
    ihlalSonucu:
      "Eski tarihli hesaplama reddedilir ve g뿯½ncel rayi뿯½ 뿯½zerinden yeniden tahakkuk ettirilir; gecikmede ticari avans faizi işler.",
  },
  13: {
    neden:
      "End뿯½striyel tesiste teslim gecikmesi doğrudan işletme kaybı yaratır; ALOP ile risk sigortaya yayılır.",
    ihlalSonucu:
      "Poli뿯½e kapsamı dışı talepler hukuki uyuşmazlığa gider; s뿯½re뿯½ kayıtları ve teknik raporlar delil dosyasına eklenir.",
  },
  14: {
    neden:
      "Bypass, hileli barter ve metrekareden 뿯½alma gibi kasıtlı davranışlar ekosistemi zehirler; caydırıcı 뿯½arpan gerekir.",
    ihlalSonucu:
      "Hizmet bedeli (%4 + KDV) 뿯½zerinden 10 kat cezai şart ve tahsil s뿯½re뿯½leri uygulanır; kalıcı hesap yaptırımı g뿯½ndeme gelebilir.",
  },
  15: {
    neden:
      "뿯½denmeyen cezai kalemlerde faiz işletilmezse tahsil g뿯½c뿯½ zayıflar; ticari avans faizi net bir 뿯½er뿯½eve sunar.",
    ihlalSonucu:
      "İhlal tarihinden itibaren TCMB en y뿯½ksek ticari avans faizi g뿯½nl뿯½k işletilir; ek mahrumiyet tazminatı talepleri doğabilir.",
  },
  16: {
    neden:
      "Akraba, ortaklık veya personel 뿯½zerinden gizli alım; m뿯½teahhit yardımlı Bypass olarak rekabeti 뿯½뿯½kertir.",
    ihlalSonucu:
      "Tespit halinde ihale iptali, kara liste, cezai şart ve hukuki takip s뿯½re뿯½leri başlatılabilir; graf analizi delil oluşturur.",
  },
  17: {
    neden:
      "Teslim birimi ile broş뿯½r/projesi arasındaki metrekare farkı doğrudan ekonomik zarardır; katlı tazminat makuld뿯½r.",
    ihlalSonucu:
      "Fark g뿯½ncel rayi뿯½ 뿯½zerinden 10 katı ile tahsil edilir; kasıt ve tekrar halinde ek yaptırımlar uygulanır.",
  },
  18: {
    neden:
      "Emlak뿯½ı paylaşımında net k뿯½r tanımı şeffaf olmalıdır; br뿯½t komisyon 뿯½zerinden vergi ve POS d뿯½ş뿯½m뿯½ 뿯½nceden bilinmelidir.",
    ihlalSonucu:
      "Ge뿯½erli hizmet faturası ve mutabakat olmadan 뿯½deme 뿯½ıkışı yapılamaz; ihlalde iş ortaklığı askıya alınır ve mahsuplaşma başlatılır.",
  },
};

function severityLabel(sev: RuleSeverity): string {
  switch (sev) {
    case "K":
      return "Kritik";
    case "U":
      return "Uyarı";
    case "B":
      return "Bilgilendirme";
    default:
      return sev;
  }
}

function severityBadgeClass(sev: RuleSeverity): string {
  switch (sev) {
    case "K":
      return "border-rose-500/40 bg-rose-500/15 text-rose-100";
    case "U":
      return "border-amber-500/40 bg-amber-500/15 text-amber-100";
    case "B":
      return "border-slate-500/40 bg-slate-500/15 text-slate-200";
    default:
      return "";
  }
}

function sectionId(rule: IhalealPlatformRule): string {
  return `anayasa-kural-${rule.id}`;
}

export default function AnayasaIhalealPage() {
  const navigate = useNavigate();
  const rules = useMemo(() => IHALEAL_PLATFORM_RULES.slice(0, FIRST_COUNT), []);
  const [activeId, setActiveId] = useState<number>(rules[0]?.id ?? 1);

  const scrollToRule = useCallback((id: number) => {
    const el = document.getElementById(`anayasa-kural-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);

  const handleDemoExport = useCallback(() => {
    const header =
      "İhaleAL — Platform Anayasası (ilk 18 kural özeti, demo metin)\n" +
      "Bu dosya bilgilendirme amaçlıdır; bağlayıcı metin için tam dokümana bakınız.\n\n";
    const body = rules
      .map((r) => {
        const ex = SECTION_EXTRA[r.id];
        return [
          `--- ${r.id}. ${r.title} [${severityLabel(r.sev)}] (${r.ref}) ---`,
          `Neden: ${ex?.neden ?? ""}`,
          `Uygulama: ${r.desc}`,
          `İhlal sonucu: ${ex?.ihlalSonucu ?? ""}`,
          "",
        ].join("\n");
      })
      .join("\n");
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ihaleal-anayasa-ilk18-ozet.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [rules]);

  const handlePrintPdfDemo = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-900 gap-2 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>

        <header className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-400/90">
                İhaleAL platform kuralları
              </p>
              <h1 className="text-2xl font-bold text-white mt-1">
                Anayasa özeti — ilk {FIRST_COUNT} kural
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
                Aşağıda Nihai dokümandaki ilk on sekiz kural özetlenmiştir. Tam liste ve arama için{" "}
                <Link to={PLATFORM_FRAMEWORK_PATH} className="text-cyan-400 underline-offset-2 hover:underline">
                  platform çerçevesi
                </Link>{" "}
                sayfasını kullanın. Bu sayfa bilgilendirme amaçlıdır; bağlayıcı danışmanlık değildir.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 shrink-0 print:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15 text-slate-200 gap-2"
                onClick={handleDemoExport}
              >
                <Download className="h-4 w-4" />
                Özet indir (demo)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-teal-500/30 text-teal-100 gap-2"
                onClick={handlePrintPdfDemo}
              >
                <Printer className="h-4 w-4" />
                PDF için yazdır
              </Button>
            </div>
          </div>

          <Card className="border-indigo-500/25 bg-indigo-950/20 print:border-slate-300">
            <CardContent className="flex flex-col sm:flex-row gap-4 p-4 sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-200 shrink-0">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-white flex flex-wrap items-center gap-2">
                    Avukat gözetiminde metin
                    <Badge variant="outline" className="border-indigo-400/40 text-indigo-100">
                      Taslak / bilgilendirme
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Metinler iç hukuk ve ürün politikası taslaklarından üretilmiştir. Somut işlem için baro kayıtlı avukatınıza
                    danışınız.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-300 shrink-0 self-start sm:self-center" asChild>
                <Link to="/yasal-master-brief" className="gap-2">
                  <FileText className="h-4 w-4" /> Master brief
                </Link>
              </Button>
            </CardContent>
          </Card>
        </header>

        <nav
          aria-label="Kural bölümleri"
          className={cn(
            "sticky top-16 z-30 -mx-1 px-1 py-2 bg-[var(--gradient-page)]/95 backdrop-blur-md border-b border-white/10 print:hidden",
          )}
        >
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin touch-pan-x">
            {rules.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => scrollToRule(r.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                  activeId === r.id
                    ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-50"
                    : "border-white/15 bg-slate-900/50 text-slate-300 hover:border-white/25 hover:text-white",
                )}
              >
                <span className="font-mono text-[10px] opacity-70 mr-1">{r.id}</span>
                {r.title.length > 42 ? `${r.title.slice(0, 40)}…` : r.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-8">
          {rules.map((rule) => {
            const extra = SECTION_EXTRA[rule.id];
            return (
              <section
                key={rule.id}
                id={sectionId(rule)}
                className="scroll-mt-36 rounded-xl border border-slate-700/50 bg-slate-900/40 p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">#{rule.id}</span>
                      <Badge variant="outline" className={cn("text-[10px]", severityBadgeClass(rule.sev))}>
                        {severityLabel(rule.sev)}
                      </Badge>
                      <span className="text-xs text-slate-500">{rule.ref}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white leading-snug">{rule.title}</h2>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-slate-400 shrink-0 print:hidden" asChild>
                    <a href={`#${sectionId(rule)}`}>Bağlantı</a>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-1">
                  <div>
                    <p className="text-xs font-medium text-emerald-200/90 mb-1">Neden</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{extra?.neden}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-cyan-200/85 mb-1">Uygulama detayı</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{rule.desc}</p>
                  </div>
                  <div className="rounded-lg border border-rose-500/20 bg-rose-950/15 p-4">
                    <p className="text-xs font-medium text-rose-200/90 mb-1 flex items-center gap-2">
                      <Gavel className="h-3.5 w-3.5" aria-hidden />
                      İhlal sonucu (özet)
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed">{extra?.ihlalSonucu}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <Card className="border-slate-600/40 bg-slate-950/40 print:hidden">
          <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-slate-400 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-medium text-white">Tam çerçeve ve arama</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tüm kurallar, filtreler ve Nihai çapraz referanslar için platform çerçevesine gidin.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link to={PLATFORM_FRAMEWORK_PATH}>Platform çerçevesini aç</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-[11px] text-slate-600 text-center pb-4 print:hidden">
          Veri kaynağı: <code className="text-slate-500">src/data/anayasa400IhalealRules.ts</code> — ilk {FIRST_COUNT}{" "}
          kayıt.
        </p>
      </div>
    </div>
  );
}
