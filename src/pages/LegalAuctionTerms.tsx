import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gavel, AlertTriangle, CheckCircle, Percent, Clock, ShieldCheck, FileText, UserCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calcSellerNet, feeBadgeLabel, FEE_TEXTS } from "@/lib/fees";

const LEGAL_EXAMPLE_TRY = 10_000_000;
const legalEx = calcSellerNet(LEGAL_EXAMPLE_TRY);

export default function AuctionTerms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-6 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gavel className="w-8 h-8 text-orange-400" />
            İhale Katılım Koşulları ve Komisyon Yapısı
          </h1>
          <p className="text-slate-400 mt-2">Yasal çerçeve, yükümlülükler ve komisyon bilgileri</p>
          <p className="text-xs text-slate-600 mt-1">Son güncelleme: 27.04.2026 — taslak; avukat onayı beklenmelidir.</p>
        </div>

        <Card className="bg-amber-500/10 border-amber-500/25 p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                Bu sayfadaki süreçler <strong className="text-white">hedef iş kuralı taslağıdır</strong>. e-Devlet kimlik doğrulama, Findeks sorgusu, banka tahsilatı, MASAK bildirimi ve “gereksiz kişileri otomatik eleme”
                yalnızca <strong>üretim backend’i ve resmi entegrasyonlar</strong> ile uygulanabilir; şu anki demo sitede otomatik olarak çalışmaz.
              </p>
              <p className="text-xs text-slate-500">
                Detaylı mevzuat hatırlatıcıları: <button type="button" onClick={() => navigate("/yasal-cerceve")} className="text-amber-300 underline hover:text-amber-200">Yasal çerçeve (taslak)</button>
                {" · "}
                <button type="button" onClick={() => navigate("/canliya-hazirlik")} className="text-amber-300 underline hover:text-amber-200">Canlıya hazırlık listesi</button>
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="bg-slate-900/50 border-orange-500/20 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Komisyon Yapısı</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  <strong className="text-slate-200">Hedef model (sözleşmede netleştirilecek):</strong> gayrimenkul satışında platform hizmet bedeli olarak
                  <Badge className="bg-orange-500/20 text-orange-400 text-sm mx-1">{feeBadgeLabel()}</Badge>
                  oranı kullanılabilir. Alıcıdan mı, satıcıdan mı veya paylaşımlı mı olacağı <strong className="text-white">avukat onaylı kullanıcı sözleşmesi</strong> ile belirlenir; bu paragraf bağlayıcı teklif değildir.
                </p>
                <div className="mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <p className="text-sm text-orange-300">
                    <strong>Örnek (tek kaynak <code className="text-orange-200">fees.ts</code>, satıcı brüt {LEGAL_EXAMPLE_TRY.toLocaleString("tr-TR")} ₺):</strong>{" "}
                    komisyon ₺{legalEx.commission.toLocaleString("tr-TR")} + KDV ₺{legalEx.vatOnCommission.toLocaleString("tr-TR")} = toplam kesinti ₺
                    {(legalEx.commission + legalEx.vatOnCommission).toLocaleString("tr-TR")} (satıcı neti ₺{legalEx.net.toLocaleString("tr-TR")})
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              Kimler İhaleye Katılabilir?
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>18 yaşını doldurmuş, reşit Türkiye Cumhuriyeti vatandaşları</li>
              <li>Türkiye'de ikamet eden yabancı uyruklu kişiler (tapu kanunu çerçevesinde)</li>
              <li>Türkiye'de ticari faaliyeti bulunan şirketler ve tüzel kişilikler</li>
              <li>Findeks kredi notu 1000+ olan kullanıcılar (talep edilen ilanlar için)</li>
              <li>Telefon numarası SMS doğrulaması tamamlanmış kullanıcılar</li>
              <li>Kimlik doğrulaması (hedef: e-Devlet veya nüfus müdürlüğü süreci — üretim entegrasyonu gerekir)</li>
            </ul>
            <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-sm text-red-300 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <strong>Katılamayacaklar:</strong> Adli sicil kaydı olanlar, yasal engeli bulunanlar, daha önce ihale ihlali yapmış ve kara listede olanlar.
              </p>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              İhale Süreci
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold text-white">Kayıt ve Doğrulama</h4>
                  <p className="text-sm text-slate-400">Üye olun, telefon ve e-posta doğrulaması yapın. Findeks raporu talep edin.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold text-white">Teminat Yatırma (Kapora)</h4>
                  <p className="text-sm text-slate-400">{FEE_TEXTS.bidBondLine()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold text-white">Teklif Verme</h4>
                  <p className="text-sm text-slate-400">Minimum artış miktarına göre teklif verin. Son 5 dakikada teklif gelirse süre otomatik 5 dk uzar.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold text-white">Kazanan İlan Edilme</h4>
                  <p className="text-sm text-slate-400">En yüksek teklif sahibi kazanan ilan edilir. 24 saat içinde kalan tutarı ödemek zorundadır.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">5</div>
                <div>
                  <h4 className="font-semibold text-white">Tapu Devir ve Teslim</h4>
                  <p className="text-sm text-slate-400">Ödeme onayından sonra tapu devri için randevu alınır. Ekspertiz raporu platform tarafından sağlanır.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-red-500/20 p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              Teklif verme — risk ve dolandırıcılık önlemleri (taslak)
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Aşağıdaki başlıklar ürün ve uyum taslağıdır; bağlayıcı hukuki metin sözleşme + avukat onaylı koşullardır.
            </p>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-slate-200">Bağlayıcı teklif:</strong> Onaylanan teklif geri alınamaz; yalnızca kurallara uygun daha yüksek teklif verilebilir. Kullanıcı arayüzü zaman damgası ve kayıt ile delil zinciri hedefler.
              </li>
              <li>
                <strong className="text-slate-200">Şişirme / sahte teklif:</strong> Kendi ilanını manipüle etmek, hayali alıcı veya bot ile teklif göstermek yasaktır; tespitte hesap kapatma, teminat iradı ve sözleşmedeki cezai şartlar uygulanabilir (hedef).
              </li>
              <li>
                <strong className="text-slate-200">Kimlik hırsızlığı / vekâletsiz işlem:</strong> Üçüncü kişi adına teklif; güçlü KYC, OTP ve oturum risk skoru ile engellenmelidir (üretim).
              </li>
              <li>
                <strong className="text-slate-200">Kart / ödeme dolandırıcılığı:</strong> Ön yetki ve tahsilat yalnızca PCI-DSS uyumlu sağlayıcı üzerinden; kart PAN saklanmaz. Şüpheli işlemde MASAK STR ve işlem durdurma.
              </li>
              <li>
                <strong className="text-slate-200">İçeriden bilgi (insider):</strong> Rapor ve teminat kayıtlarına erişen personel için ayrı NDA ve erişim logu; müşteri verisi sızdırma ihlali iş ve ceza hukuku kapsamındadır.
              </li>
              <li>
                <strong className="text-slate-200">Platform dışına çekme:</strong> İletişimi ilan sahibiyle gizlice platform dışına taşımak komisyon kaçağı ve aradan çıkma riski doğurur; sözleşmede cezai şart ve MERNIS adres eşleştirme denetimi hedeflenir (demo metinleri).
              </li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Güvenlik ve AML/KYC Politikası
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              AML ve KYC için <strong className="text-slate-200">hedeflenen</strong> operasyonel kurallar (yürürlük için uyum programı ve hukuk onayı şarttır):
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>Kimlik doğrulama (e-Devlet / güvenilir sağlayıcı entegrasyonu — üretim)</li>
              <li>Belirlenen eşik üzeri işlemlerde Findeks raporu talebi (API anlaşması ile)</li>
              <li>Şüpheli işlem prosedürü ve MASAK STR süreci (iç politika + yetkili birim)</li>
              <li>Ödemelerin Türkiye içi hesaplara yönlendirilmesi ve kayıt saklama</li>
              <li>Yabancı uyruklu alıcılar için tapu mevzuatına uygun ek kontroller</li>
            </ul>
          </Card>

          <Card className="bg-slate-900/50 border-slate-200/80 p-5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              İptal ve İade Koşulları
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-400 list-disc list-inside">
              <li>{FEE_TEXTS.bidBondForfeitLine()} Bir sonraki teklif sahibine geçiş üretim kuralında netleşir.</li>
              <li>Teminat iadesi, ihale kaybedildikten sonra 48 saat içinde yapılır.</li>
              <li>İlan sahibi (satıcı) ihaleyi iptal ederse, tüm katılımcılara teminat iade edilir.</li>
              <li>Ekspertiz raporunda belirgin bir eksiklik çıkarsa, alıcı 72 saat içinde cayma hakkına sahiptir.</li>
            </ul>
          </Card>

          <div className="flex justify-center pt-6">
            <Button onClick={() => navigate(-1)} className="[background:var(--gradient-cta)] text-white px-8">
              Anladım, Geri Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
