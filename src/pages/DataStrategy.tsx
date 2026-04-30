import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LineChart, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DataStrategy() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <LineChart className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">İhaleal Endeksi — verimli analiz nedir?</h1>
            <p className="text-sm text-slate-500">
              İhaleal Endeksi; teklif yoğunluğu, bölge fiyat bandı, talep ve yapay zeka sinyallerini <strong className="text-slate-300">aynı karar ekranında</strong> birleştirir. Statik tek rapor yerine, ihale akışına bağlı dinamik görünüm hedeflenir. İlan detayındaki «İhaleal Endeksi — piyasa raporu analizi» akışı burayı işaret eder; demo sınırları aşağıda.
            </p>
          </div>
        </div>

        <Card className="bg-red-500/5 border-red-500/20 mb-6">
          <CardContent className="p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300 space-y-2">
              <p>
                <strong className="text-white">Şu an bu sitede:</strong> Lisanslı piyasa verisiyle aynı kalitede, güncel “son 6 ayda satılanlar / şimdi satılıklar”
                <strong className="text-white"> verisi yok</strong>. /analiz sayfasındaki grafikler <Badge className="mx-1 bg-slate-600 text-white border-0">gösterim / demo</Badge> verisidir.
              </p>
              <p className="text-xs text-slate-500">
                Örnek ekspertiz / fiyat raporu PDF’i ürün ve avukatla “hangi alanları otomatik doldurabiliriz” diye incelemek faydalıdır.
                PDF’yi buraya yükleme alanı sadece <strong>dosya adını</strong> gösterir; dosya sunucuya gitmez (statik site).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/5 mb-6">
          <CardContent className="p-5">
            <h2 className="text-white font-semibold flex items-center gap-2 mb-3"><Upload className="w-5 h-5 text-blue-400" /> Örnek fiyat raporu (yerel seçim)</h2>
            <p className="text-xs text-slate-500 mb-4">Üretimde: güvenli depolama + OCR + şablon eşleme. Şimdilik yalnızca dosya adı.</p>
            <label className="flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-500/15 text-blue-300 text-sm border border-blue-500/20">
                PDF seç
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFileName(f ? f.name : null);
                }}
              />
              <span className="text-sm text-slate-400">{fileName || "Henüz dosya seçilmedi"}</span>
            </label>
            {fileName && (
              <p className="text-xs text-emerald-400 mt-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Dosya adı kaydedildi (tarayıcıda). Gerçek analiz için backend gerekir.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/5 mb-6">
          <CardContent className="p-5 space-y-4 text-sm text-slate-400">
            <h2 className="text-white font-semibold text-base">Tek tek — kurumsal piyasa analizine giden yol</h2>
            <ol className="space-y-3 list-decimal list-inside text-slate-400">
              <li><strong className="text-slate-200">Veri kaynağı:</strong> Lisanslı emlak veri sağlayıcısı veya kendi kapalı işlem veriniz (KVKK ile).</li>
              <li><strong className="text-slate-200">“Son 6 ay satılan”:</strong> ETL (günlük/saatlik cron) + normalize adres + m² birim fiyat indeksi.</li>
              <li><strong className="text-slate-200">“Şimdi satılık”:</strong> İlan feed’i (yine lisans veya sizin portföyünüz).</li>
              <li><strong className="text-slate-200">Harici site tarama:</strong> Önerilmez; ToS + KVKK + haksız rekabet riski. Yerine API / kullanıcı yüklemesi.</li>
              <li><strong className="text-slate-200">Rapor şablonu:</strong> Örnek PDF’inizi şablona map eden ürün + hukuk onayı.</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/15 mb-6">
          <CardContent className="p-5 space-y-3 text-sm text-slate-400">
            <h2 className="text-white font-semibold text-base">Üçüncü taraf veri API — teknik çerçeve (taslak)</h2>
            <p className="text-xs text-slate-500">
              Üçüncü taraf ticari veri ürünleri için <strong className="text-slate-300">resmi API veya sözleşme olmadan</strong> canlı bağlantı kurulmaz.
              Aşağıdaki tablo ürün ekibinin backend’de uygulayacağı <strong className="text-slate-300">hedef sözleşme</strong> alanlarını listeler.
            </p>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.04] text-slate-300">
                  <tr>
                    <th className="p-2 font-medium">Alan</th>
                    <th className="p-2 font-medium">Amaç</th>
                    <th className="p-2 font-medium">Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr><td className="p-2 text-emerald-300">auth</td><td className="p-2">OAuth2 / API key</td><td className="p-2">Sunucuda sakla; istemciye sızdırma.</td></tr>
                  <tr><td className="p-2 text-emerald-300">parsel / adres</td><td className="p-2">Normalize mahalle + ada/parsel</td><td className="p-2">Tapu-Adres birlikte doğrulama (hukuk).</td></tr>
                  <tr><td className="p-2 text-emerald-300">İhaleal Endeksi bandı</td><td className="p-2">m² birim fiyat + ihale likiditesi</td><td className="p-2">Tarih aralığı + örneklem; ihale verisi ile çapraz doğrulama.</td></tr>
                  <tr><td className="p-2 text-emerald-300">rapor PDF</td><td className="p-2">İhale kartında özet + link</td><td className="p-2">Kullanıcı yüklemesi veya sağlayıcı webhook.</td></tr>
                  <tr><td className="p-2 text-emerald-300">rate limit</td><td className="p-2">Önbellek (Redis)</td><td className="p-2">Analiz sayfası sorgu patlamasını önle.</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">
              Örnek env değişkenleri (üretim, sağlayıcıya göre isimlendirin): <code className="text-teal-400/90">PRICE_INDEX_API_BASE</code>,{" "}
              <code className="text-teal-400/90">PRICE_INDEX_CLIENT_ID</code>, <code className="text-teal-400/90">PRICE_INDEX_WEBHOOK_SECRET</code> — .env.example ile hizalayın.
            </p>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/analiz")} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
          Mevcut demo analiz sayfasına git
        </Button>
      </div>
    </div>
  );
}
