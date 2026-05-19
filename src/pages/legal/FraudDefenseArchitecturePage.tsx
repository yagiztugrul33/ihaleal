import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scale,
  ShieldAlert,
  Gavel,
  FileText,
  Link2,
  Landmark,
  Radar,
  Users,
  WalletCards,
  Fingerprint,
  Network,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FRAUD_DEFENSE_PAGE_DISCLAIMER,
  FRAUD_LITIGATION_PILLARS,
} from "@/legal/fraudDefenseFramework";
import { REAL_ESTATE_RISK_ATLAS } from "@/legal/realEstateRiskAtlas";

export default function FraudDefenseArchitecturePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2">
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-rose-400/90">Hukuki risk mimarisi</p>
            <h1 className="text-2xl font-bold text-white mt-1">Dolandırıcılık ve dava risklerine karşı savunma</h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Üç kağıt, sahte ilan, teklif manipülasyonu, platform dışı kapora ve aradan çıkma, lansman ön satışında teknik şartname ile
              ilan uyumu, para birliği, MASAK, KVKK ve süreklilik riskleri; platformun ayakta kalması ve kullanıcıya güven vermesi için ürün,
              hukuk ve teknik kontrollerin özeti. Bağlayıcı danışmanlık değildir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-master-brief")}>
              <FileText className="w-4 h-4 mr-1" /> Master brief
            </Button>
            <Button variant="outline" size="sm" className="border-white/15 text-slate-200" onClick={() => navigate("/yasal-cerceve")}>
              <Scale className="w-4 h-4 mr-1" /> Yasal çerçeve
            </Button>
            <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-100" onClick={() => navigate("/guvenlik")}>
              <ShieldAlert className="w-4 h-4 mr-1" /> Güvenlik merkezi
            </Button>
          </div>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/10">
          <CardContent className="flex gap-3 p-4 text-xs text-slate-300 leading-relaxed">
            <Gavel className="w-5 h-5 shrink-0 text-amber-400" />
            <p>{FRAUD_DEFENSE_PAGE_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-900/40">
          <CardContent className="p-5 text-sm text-slate-400 space-y-2">
            <p className="font-medium text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Hızlı bağlantılar
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/ihale-kosullari")}>
                İhale koşulları / AML
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/evraklar")}>
                Evraklar
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/kvkk")}>
                KVKK
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yedekleme")}>
                BCP / yedekleme
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yasal/supabase-uyum")}>
                Supabase RLS / audit
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-8 text-xs" onClick={() => navigate("/yasal/agency-contract")}>
                agency_contract
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-cyan-500/20 bg-slate-900/45">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden />
                Sahte ve şişirilmiş teklif tespiti
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Teklifler sunucu zamanı ve atomik RPC ile mühürlenir; anormal düşük/yüksek teklifler, portföysüz ani sıçramalar ve teminat
                uyumsuzluğu risk skoruna girer. Şüpheli oturumlar manuel inceleme kuyruğuna alınır; teklif grafı ve cihaz parmak izi korelasyonu
                şişirme (shill) desenlerini ayıklamayı hedefler.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                <li>Zaman damgası + idempotency anahtarı ile çift teklif ve geri sarma denemelerinin reddi.</li>
                <li>Teminat / ön ödeme durumu ile teklif uyumu; blokajsız agresif teklifler için ek doğrulama.</li>
                <li>Şeffaf ihale geçmişi ve şüpheli iptal döngülerinde otomatik bayraklar.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-violet-500/20 bg-slate-900/45">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400 shrink-0" aria-hidden />
                Self-dealing ve çıkar çatışması
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Satıcı, müteahhit veya emlakçının kontrolündeki hesaplarla fiyatı suni yükseltme; yakın akraba / ortaklık / personel hatları
                üzerinden gizli alım Nihai kurallarda Bypass olarak ele alınır. Ödeme aracı, TCKN/MERNİS ve graf analizi ilişkileri güçlü
                sinyal oluşturur.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                <li>Aynı tarafa bağlı çoklu kimliklerde otomatik sürtünme: ek KYC, bekletme veya ihale dışı bırakma.</li>
                <li>Kurumsal bağlantı beyanı olmadan kuruluş içi çapraz tekliflerin reddi politikasının sözleşmede netliği.</li>
                <li>Kanıt paketi: IP / cihaz / ödeme maskesi korelasyon kayıtları.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-500/25 bg-amber-950/15">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <WalletCards className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
                Platform dışı kapora ve ön ödeme yasağı
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Kapora ve ön ödemeler yalnızca blokeli ödeme kuruluşu veya emanet modeli üzerinden akar; operatör cari hesabında biriktirme
                (commingling) hedeflenmez. Mesajlaşma kanallarında IBAN paylaşımı ve “havale ile kapora” teşvikleri politika ihlalidir.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                <li>Sınırlı PSP kodları ve mutabakat batch’leri ile günlük reconciliation.</li>
                <li>Platform dışı ödeme kanıtı (dekont) ile kapora iddiası: hesap askıya alma ve uyum incelemesi.</li>
                <li>Kullanıcıya net uyarı: ödemeyi yalnızca uygulama içi akıştan yapın.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-rose-500/20 bg-slate-900/45">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-rose-400 shrink-0" aria-hidden />
                KYC atlama ve kimlik sahteciliği
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seviyeli KYC (birey / tacir / emlakçı) zorunludur; biyometrik veya e-devlet kanıtı olmadan limit üstü işlem ve ilan
                yayınlama engellenir. Sahte belge ve fotoğraf manipülasyonu için hash + moderasyon ve zaman damgalı belge sürümleri tutulur.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                <li>Yüksek risk ülkeleri / PEP / yaptırım listesi eşlemesinde manuel onay.</li>
                <li>KYC geri çekilmesi veya red sonrası otomatik ihale iptalleri ve bakiye bloğu.</li>
                <li>STR süreciyle bağlantılı saklama; sessiz silme yerine denetlenebilir kayıt.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-900/45">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
                Çoklu hesap ve kimlik çoğaltma kuralları
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fiilen tek kullanıcıya bağlı birden fazla hesap; ceza veya yasaklılıktan kaçma veya referans ödülü kötüye kullanımı yasaktır.
                Cihaz parmak izi, davranışsal oturum ve ödeme maskesi ile bağlantılı hesaplar birleştirilir veya askıya alınır.
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                <li>Bir TCKN altında tek doğrulanmış satıcı kimliği; kurumsal istisna için vergi numarası doğrulaması.</li>
                <li>Yasaklı kullanıcının yeni hesap açması: otomatik eşleşmede kalıcı red.</li>
                <li>Kullanıcıya şeffaf itiraz kanalı ve insan denetimi.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-600 bg-slate-950/50">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
                İhlal ceza tablosu (özet — hedef politika)
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Tutarlar ve süreler somut sözleşme ve KVKK / MASAK süreçleriyle güncellenir; mahkeme ve düzenleyici merciler önceliklidir.
              </p>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300 whitespace-normal">İhlal türü</TableHead>
                    <TableHead className="text-slate-300 whitespace-normal">Birinci basamak</TableHead>
                    <TableHead className="text-slate-300 whitespace-normal">Tekrar / kasıt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-300 whitespace-normal">Sahte veya şişirilmiş teklif</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Teklif iptali, teminat iradı riski, 30–90 gün kısıtlama</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Kalıcı hesap kapatma, hukuki takip, şikayet dosyası</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-300 whitespace-normal">Self-dealing / Bypass</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">İhale iptali, ödeme bloğu, ek KYC</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">
                      Kara liste, cezai şart (ör. hizmet bedeli üzerinden çarpan), tahkim
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-300 whitespace-normal">Platform dışı kapora</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Uyarı, ilan askıya alma, mesaj kanalı kapatma</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Hesap fesihi, MASAK bildirimi değerlendirmesi</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-300 whitespace-normal">KYC atlama / sahte belge</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Limit düşürme, işlem durdurma</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Kalıcı red, kolluk bildirimi süreci</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-700">
                    <TableCell className="text-slate-300 whitespace-normal">Çoklu hesap suistimali</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Hesap birleştirme veya askı</TableCell>
                    <TableCell className="text-slate-400 whitespace-normal">Tüm bağlı hesaplarda yasaklama</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-teal-500/30 bg-teal-950/20">
            <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <Flag className="w-8 h-8 text-teal-400 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold text-white">Şüpheli aktivite bildirimi</h2>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Şişirilmiş teklif, platform dışı ödeme talebi veya sahte belge gördüğünüzde destek hattına iletin; mümkünse ihale
                    bağlantısı ve ekran görüntüsü ekleyin. Acil dolandırıcılık şüphesinde yetkili mercilere başvurmanız önerilir.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Button type="button" className="gap-2 bg-teal-600 hover:bg-teal-500 text-white" onClick={() => navigate("/destek")}>
                  <Flag className="w-4 h-4" />
                  Bildirimi gönder
                </Button>
                <Button type="button" variant="outline" className="border-white/15 text-slate-200" onClick={() => navigate("/raporlar")}>
                  Raporlar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {FRAUD_LITIGATION_PILLARS.map((p) => (
            <Card key={p.id} className="border-slate-200 bg-slate-900/50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{p.id}</span>
                  <h2 className="text-lg font-semibold text-white">{p.title}</h2>
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-200/90 mb-1">Tehdit</p>
                  <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                    {p.threats.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Hukuki referans (ozet)</p>
                  <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1">
                    {p.legalAnchors.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-200/90 mb-1">Onlem (urun / operasyon)</p>
                  <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                    {p.controls.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-cyan-200/80 mb-1">Delil / denetim izi</p>
                  <p className="text-xs text-slate-500">{p.evidenceArtifacts.join(" · ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
            Gayrimenkul, miras, imar ve ticaret (geniş atlas)
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Emlak ekosisteminde sik gorulen dava hatlari: miras ve paydas zinciri, imar / 6306, ipotek-serh, TBK edimleri, TTK aracilik,
            lansman on-satisi ve teknik sartname ile ilan uyumu, platform baypasi, iflas ve yabanci edinimi. Asagidaki maddeler bilgilendirme
            taslagi olup somut dosyada avukat ile netlestirilir.
          </p>
        </div>

        <div className="space-y-6">
          {REAL_ESTATE_RISK_ATLAS.map((p) => (
            <Card key={p.id} className="border-emerald-500/15 bg-slate-900/40">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-600/90">{p.id}</span>
                  <h3 className="text-base font-semibold text-white">{p.title}</h3>
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-200/90 mb-1">Tehdit</p>
                  <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                    {p.threats.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Hukuki referans (ozet)</p>
                  <ul className="list-disc pl-5 text-xs text-slate-500 space-y-1">
                    {p.legalAnchors.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-200/90 mb-1">Onlem (urun / operasyon)</p>
                  <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                    {p.controls.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-cyan-200/80 mb-1">Delil / denetim izi</p>
                  <p className="text-xs text-slate-500">{p.evidenceArtifacts.join(" · ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-[11px] text-slate-600 text-center pb-8">
          Kod referansi: <code className="text-slate-500">src/legal/fraudDefenseFramework.ts</code>,{" "}
          <code className="text-slate-500">src/legal/realEstateRiskAtlas.ts</code> — ilan kartlarinda{" "}
          <code className="text-slate-500">INTEGRITY_RULES_SUMMARY</code> ile birlestirilir.
        </p>
      </div>
    </div>
  );
}
