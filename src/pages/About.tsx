import { Link } from "react-router-dom";
import { Building2, Shield, Users, Target, Eye, Award, TrendingUp, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="px-4 pt-24 pb-24">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-4 py-1.5 text-xs font-normal uppercase tracking-wider text-[var(--metin-ikincil)]">
            <Sparkles className="h-3.5 w-3.5" /> Demo Platform · 2026
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-normal text-white">Hakkımızda</h1>
          <p className="mt-5 mx-auto max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed">
            ihaleal.com, Türkiye gayrimenkul piyasasında şeffaflığı, AI destekli analizi ve banka düzeyinde
            güvenliği bir araya getiren yeni nesil ihale ve teklif platformudur.
          </p>
        </div>

        {/* Hikaye */}
        <div className="mt-16 rounded-[20px] border border-slate-200/60 bg-slate-900/50 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-normal text-white">Hikayemiz</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Gayrimenkul piyasasında alıcı–satıcı buluşması ve fiyat keşfi yıllardır kapalı kanallarla, asimetrik
            bilgiyle ilerliyordu. ihaleal.com bu sürtünmeyi çözmek için kuruldu: açık artırma + escrow güvencesi
            + yapay zeka destekli emsal analiziyle gerçek değer ortaya çıksın diye. Platformumuz şu an demo
            modunda; mimari, hukuki çerçeve ve güvenlik katmanları yayına hazır seviyede.
          </p>
        </div>

        {/* Vizyon Misyon */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Card className="border-[var(--cizgi)] bg-gradient-to-br from-[var(--zemin-yumusak)] to-slate-900/60">
            <CardContent className="p-6">
              <Eye className="mb-4 h-9 w-9 text-[var(--metin-ikincil)]" />
              <h3 className="text-xl font-normal text-white">Vizyonumuz</h3>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Türkiye gayrimenkulünde fiyat keşfini şeffaflaştıran, yatırımcıya ve satıcıya eşit bilgi sunan
                referans dijital pazaryeri olmak.
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
            <CardContent className="p-6">
              <Target className="mb-4 h-9 w-9 text-[var(--metin-ikincil)]" />
              <h3 className="text-xl font-normal text-white">Misyonumuz</h3>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Her ilanı denetlenebilir teklif tarihçesi, AI değerleme ve kart blokajlı katılım disipliniyle
                sunarak manipülasyondan uzak bir ihale ekosistemi kurmak.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Değerler */}
        <h2 className="mt-16 text-2xl md:text-3xl font-normal text-white text-center">Değerlerimiz</h2>
        <p className="mt-2 text-center text-slate-400">5 temel ilke, tüm kararlarımızın ana çerçevesi.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <Shield className="mb-3 h-7 w-7 text-[var(--metin-ikincil)]" />
              <h3 className="text-base font-normal text-white">Güvenlik</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                256-bit SSL, escrow, KYC, oturum denetimi.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <Eye className="mb-3 h-7 w-7 text-[var(--metin-ikincil)]" />
              <h3 className="text-base font-normal text-white">Şeffaflık</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Açık komisyon yapısı, denetlenebilir teklif tarihçesi.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <Sparkles className="mb-3 h-7 w-7 text-[var(--metin-ikincil)]" />
              <h3 className="text-base font-normal text-white">Yenilikçilik</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                AI değerleme, deprem skoru, akıllı modül entegrasyonları.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <HeartHandshake className="mb-3 h-7 w-7 text-[var(--metin-ikincil)]" />
              <h3 className="text-base font-normal text-white">Adil İşlem</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Gizli ücret yok, anti-sniping koruması, eşit teklif fırsatı.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-5">
              <Award className="mb-3 h-7 w-7 text-[var(--metin-ikincil)]" />
              <h3 className="text-base font-normal text-white">Sorumluluk</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                KVKK uyumu, hukuk + finans regülasyonlarına bağlı süreçler.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sayılarla Demo Platform */}
        <div className="mt-16 rounded-[20px] border border-slate-200/60 bg-gradient-to-br from-slate-900/60 to-slate-950/40 p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-normal text-white">Sayılarla Demo Platform</h2>
          <p className="mt-2 text-sm text-slate-500">Gösterilen metrikler demo veriler üzerindendir.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-900/40 p-5">
              <div className="text-3xl font-normal text-[var(--metin-ikincil)]">12.840</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">Doğrulanmış işlem</div>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-900/40 p-5">
              <div className="text-3xl font-normal text-[var(--metin-ikincil)]">68.900</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">Aktif kullanıcı</div>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-900/40 p-5">
              <div className="text-3xl font-normal text-[var(--metin-ikincil)]">%4</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">Toplam komisyon</div>
            </div>
            <div className="rounded-[20px] border border-slate-200/80 bg-slate-900/40 p-5">
              <div className="text-3xl font-normal text-[var(--metin-ikincil)]">%94</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">Demo memnuniyet</div>
            </div>
          </div>
        </div>

        {/* Yaklaşım */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-6">
              <Building2 className="mb-3 h-8 w-8 text-[var(--metin-ikincil)]" />
              <h3 className="font-normal text-base text-white">Odak</h3>
              <p className="mt-2 text-sm text-slate-400">
                İlan, ihale ve kapalı teklif modlarıyla tek çatı altında uçtan uca süreç çizgisi.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-6">
              <TrendingUp className="mb-3 h-8 w-8 text-[var(--metin-ikincil)]" />
              <h3 className="font-normal text-base text-white">Uyumluluk hedefi</h3>
              <p className="mt-2 text-sm text-slate-400">
                KYC, evrak ve saklama politikaları üretimde hukuk ve regülasyonla tamamlanır.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="p-6">
              <Users className="mb-3 h-8 w-8 text-[var(--metin-ikincil)]" />
              <h3 className="font-normal text-base text-white">Ortaklık</h3>
              <p className="mt-2 text-sm text-slate-400">
                B2B emlakçı ortaklığı; ilan paketi satışı değil, performansa dayalı kazanç paylaşımı.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-6 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-normal text-white">Platformu keşfedin</h2>
          <p className="mt-3 mx-auto max-w-xl text-slate-400">
            Canlı ihaleler, AI değerleme, risk analiz modülleri — hepsi tek panelde.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/ihaleler">İhaleleri incele</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/iletisim">İletişim</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15">
              <Link to="/kunye">Yasal künye</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
