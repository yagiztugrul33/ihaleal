import { PageShell } from "@/components/marketing/PageShell";

const REVIEWS = [
  { name: "Ayşe K.", role: "Emlak danışmanı", city: "İstanbul", text: "Kapalı teklif modülü ofisimizin kurumsal satış sürecine tam oturdu. Müşteri güveni arttı." },
  { name: "Mehmet T.", role: "GYO yöneticisi", city: "Ankara", text: "Çok şubeli yapıda rol bazlı yetki kritikti. Panel sade ve hızlı." },
  { name: "Zeynep A.", role: "Yatırımcı", city: "İzmir", text: "İhale şeffaflığı ve KYC rozeti sayesinde karar vermek kolaylaştı." },
  { name: "Can D.", role: "Müteahhit", city: "Bursa", text: "KKA senaryolarını aynı ekranda modellemek zamandan tasarruf sağladı." },
  { name: "Elif S.", role: "Emlak ofisi sahibi", city: "Antalya", text: "Toplu ilan yükleme ile 200+ portföyü bir günde taşıdık." },
  { name: "Burak Y.", role: "Satın alma", city: "Kocaeli", text: "Webhook entegrasyonu CRM ile sorunsuz çalışıyor." },
  { name: "Selin M.", role: "Bireysel alıcı", city: "Eskişehir", text: "Anında teklif akışı net ve anlaşılır; belgeler adım adım isteniyor." },
  { name: "Oğuz R.", role: "Emlak danışmanı", city: "Adana", text: "AI fiyat önerisi müşteri görüşmelerinde güçlü referans." },
  { name: "Deniz P.", role: "Proje müdürü", city: "Gaziantep", text: "Müteahhit panelinde ihale takibi tek yerden yönetiliyor." },
  { name: "Hakan L.", role: "Hukuk danışmanı", city: "İstanbul", text: "Denetim izi ve sözleşme şablonları uyum sürecini hızlandırdı." },
  { name: "Merve C.", role: "Yatırımcı", city: "Muğla", text: "Yatırımcı panelinde portföy performansını net görüyorum." },
  { name: "Emre B.", role: "Emlakçı", city: "Trabzon", text: "Mobil deneyim akıcı; müşteriyle sahadan teklif girebiliyorum." },
  { name: "Fatma G.", role: "Ofis yöneticisi", city: "Konya", text: "Komisyon split kuralları şeffaf; ekip içi anlaşmazlık kalmadı." },
  { name: "Kerem U.", role: "Arsa sahibi", city: "Çanakkale", text: "Kat karşılığı tekliflerini karşılaştırmak için ideal araç." },
  { name: "Gizem N.", role: "Alıcı", city: "Samsun", text: "Destek ekibi hızlı yanıt veriyor; SSS sayfası da çok yardımcı." },
  { name: "Alper V.", role: "Kurumsal satış", city: "İstanbul", text: "Enterprise SLA ile geçiş sorunsuz tamamlandı." },
  { name: "Seda H.", role: "Emlak danışmanı", city: "Mersin", text: "Favoriler ve karşılaştırma özelliği müşteri sunumlarında işime yarıyor." },
  { name: "Tolga İ.", role: "Müteahhit", city: "Ankara", text: "Kapalı teklif raporu yönetim kuruluna doğrudan sunulabiliyor." },
  { name: "Pınar E.", role: "GYO analisti", city: "İstanbul", text: "Analytics modülü lead kaynağını net gösteriyor." },
  { name: "Yusuf Z.", role: "Bireysel satıcı", city: "Balıkesir", text: "İlan açma süreci rehberli; ilk ihalemde bile kaybolmadım." },
];

export default function YorumlarPage() {
  return (
    <PageShell
      badge="Kullanıcı yorumları"
      title="Platformu kullananların deneyimi"
      subtitle="Emlakçılar, müteahhitler, yatırımcılar ve bireysel kullanıcılardan geri bildirimler."
    >
      <section className="py-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {REVIEWS.map((r) => (
          <blockquote key={r.name} className="card-warm flex flex-col">
            <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--color-text-muted)" }}>
              &ldquo;{r.text}&rdquo;
            </p>
            <footer className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                {r.name}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {r.role} · {r.city}
              </p>
            </footer>
          </blockquote>
        ))}
      </section>
    </PageShell>
  );
}
