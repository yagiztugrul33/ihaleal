import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { EarthquakeRiskWorkbench } from "@/components/risk/EarthquakeRiskWorkbench";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function BinaRiskSorguPage() {
  const envReady = isSupabaseConfigured();
  return (
    <ModuleShell
      title="Bina Risk Sorgu"
      subtitle="TBDY 2018 katmanlarıyla fay, zemin, sıvılaşma ve yapı davranışını tek risk skorunda birleştiren sorgu sihirbazı."
      icon={ShieldCheck}
      iconAccent="text-rose-300"
      badge="Deprem Risk Motoru"
    >
      <div className="space-y-4">
        {!envReady ? (
          <ModulePanel title="Ortam fallback bildirimi">
            <p className="text-sm text-amber-100">
              Canlı veri kaynakları bulunmadığında sorgu ekranı demo risk katmanlarıyla çalışır; kullanıcıya boş ekran gösterilmez.
            </p>
          </ModulePanel>
        ) : null}
        <ModulePanel title="Neden bu sorgu gerekli">
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Bina riski tek bir değişkenle ölçülemez. Fay mesafesi ve PGA tehlikesi, zemin sınıfı, sıvılaşma olasılığı ve
              yapısal durum birlikte okunmadığında sahte güven oluşur.
            </p>
            <p>
              Bu ekran, her katmanı 0-100 skorlayıp ağırlıklı birleşik puan verir. Katkı dökümü sayesinde riskin hangi
              faktörde yoğunlaştığı şeffaf biçimde görünür.
            </p>
          </div>
        </ModulePanel>

        <EarthquakeRiskWorkbench title="Bina risk sorgu sihirbazı" />
        <ModulePanel title="Karar matrisi">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-300">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Satın alma kararı</h3>
              <p className="mt-2">Skor orta-alt banddaysa fiyat pazarlığına güçlendirme maliyeti kalemi eklenir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Satıcı aksiyonu</h3>
              <p className="mt-2">Riskli katmanlar için rapor ve güçlendirme planı yayınlanarak güven puanı yükseltilir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Yatırımcı filtresi</h3>
              <p className="mt-2">Yüksek riskli varlıklar portföyde ağırlık düşürülerek veya sigorta tamponuyla yönetilir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Operasyon akışı</h3>
              <p className="mt-2">Sorgu sonucu deprem haritası + bina dosyası + teklif sürecine bağlı kayıt zincirine yazılır.</p>
            </article>
          </div>
        </ModulePanel>

        <ModulePanel title="Skor nasıl okunur?">
          <div className="grid gap-3 lg:grid-cols-2 text-sm text-slate-300">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Katman katkıları</h3>
              <p className="mt-2">Çıktı tek sayı değildir: fay/PGA, zemin, sıvılaşma ve yapısal katman ayrı izlenir.</p>
              <p className="mt-1">Hangi katman zayıfsa aksiyon planı o alandan başlatılır (etüd, güçlendirme, yeniden proje).</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Örnek karar kuralı</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>80+ : düşük risk bandı, yine de yerinde teknik teyit zorunlu.</li>
                <li>65-79 : orta band, güçlendirme alternatifi mutlaka masada.</li>
                <li>64 ve altı : yüksek dikkat, bağımsız mühendislik raporu olmadan ilerleme yok.</li>
              </ul>
            </article>
          </div>
        </ModulePanel>

        <div className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Örnek</h3>
            <p className="mt-2">
              Örnek bir yapıda skor 72/100 çıktığında risk “orta-iyi” bandındadır; yine de saha zemin etüdü ve
              performans raporu olmadan nihai karar verilmez.
            </p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Kime göre</h3>
            <p className="mt-2">Alıcı: gizli riskleri görür. Satıcı: güçlendirme etkisini ölçer. Yatırımcı: maliyet/risk dengesini hesaplar.</p>
          </article>
          <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">
              Ön analizdir. Resmi işlem için lisanslı jeoloji mühendisliği zemin etüdü ve inşaat mühendisliği performans
              değerlendirmesi zorunludur.
            </p>
          </article>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-100">Risk skorunu harita katmanında doğrulayarak mahalle ölçeğinde karşılaştırın.</p>
          <Button asChild className="bg-rose-300 text-slate-900 hover:bg-rose-200">
            <Link to="/modul/deprem-risk-haritasi">
              Haritayı aç <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ModulePanel title="Soru-cevap">
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
            <article>
              <p className="font-semibold text-slate-100">Skor yükseltilebilir mi?</p>
              <p className="mt-1">Evet, güçlendirme ve zemin iyileştirme sonrası risk bandı güncellenebilir.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Hangi rapor zorunlu?</p>
              <p className="mt-1">Yerinde zemin etüdü ve performans analizi olmadan resmi karar verilmez.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Sonraki adım ne?</p>
              <p className="mt-1">Deprem risk haritası ve sigorta modülü ile mali etkiler birlikte incelenir.</p>
            </article>
          </div>
        </ModulePanel>
        <ModulePanel title="CTA">
          <p className="text-sm text-slate-300">
            Risk skorunu teklif sürecine taşımadan önce harita katmanı ve sigorta karşılaştırmasıyla mali etkiyi birlikte doğrulayın.
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Böylece risk analizi tek seferlik rapor değil, sürekli güncellenen karar desteği olarak kullanılır.
          </p>
          <p className="mt-2 text-sm text-slate-300">Kritik kararlar için bağımsız mühendislik raporu zorunluluğu korunur.</p>
          <p className="mt-2 text-sm text-slate-300">Bu kural, yanlış güven hissini engelleyerek işlem kalitesini korur.</p>
          <p className="mt-2 text-sm text-slate-300">Risk katmanları değiştiğinde rapor periyodik olarak yenilenmelidir.</p>
          <p className="mt-2 text-sm text-slate-300">Periyodik güncelleme, riskin zamana bağlı sürüklenmesini görünür kılar.</p>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
