import { useMemo, useState } from "react";
import {
  Anchor,
  Blocks,
  FlaskConical,
  Hammer,
  HardHat,
  Layers3,
  Puzzle,
  Shield,
  Building2,
  CircleDollarSign,
} from "lucide-react";
import { ModuleDataTable, ModulePanel, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { Slider } from "@/components/ui/slider";

type MethodId =
  | "jacket"
  | "cfrp"
  | "shear"
  | "collector"
  | "foundation"
  | "softStory"
  | "chimney"
  | "isolationInfo";

const METHODS: {
  id: MethodId;
  title: string;
  icon: typeof Shield;
  duration: string;
  intrusiveness: "düşük" | "orta" | "yüksek";
  body: string[];
}[] = [
  {
    id: "jacket",
    title: "Beton sıvama ve kolon yüzey sıkılaştırması",
    icon: Blocks,
    duration: "4–10 hafta (sahaya göre)",
    intrusiveness: "yüksek",
    body: [
      "Taşıyıcı kolon ve kiriş yüzeyinde yeni beton ve donatı ile gövde genişletilir; kayma ve eğilme kapasitesi artar.",
      "Kullanım sırasında sık sık kısmi boşaltım gerekir; iskele ve vibrasyon kontrolü kritik adımlardır.",
      "Yığma binalarda sıvama öncesi sıva ve harç zayıflığı tespitleri mutlaka yapılmalıdır.",
    ],
  },
  {
    id: "cfrp",
    title: "Karbon lif ile çekme kapasitesi artışı",
    icon: Layers3,
    duration: "2–5 hafta",
    intrusiveness: "orta",
    body: [
      "Eğilme açıklıkları uzun kiriş ve perde uçlarında çekme bileşenini güçlendirir; incelikleri detay çizim gerektirir.",
      "Kimyasal ankraj ve yüzey hazırlığı yüzey sıcaklığına duyarlıdır; uygulayıcı sertifikası esastır.",
      "Yangın kaplaması ile birlikte kullanımı performansı belirler.",
    ],
  },
  {
    id: "shear",
    title: "Yeni perde ve bağ kirişleri",
    icon: Hammer,
    duration: "6–16 hafta",
    intrusiveness: "yüksek",
    body: [
      "Yatay yük dağılımını düzene sokar; mevcut konsol ve çıkma dengesini yeniden hesaplar.",
      "İmar ve komşuluk hakkı kapsamında projelendirme daha uzun sürebilir.",
      "Kolon-perde birleşimlerinde ankraj detayları sık sık saha uyarlaması gerektirir.",
    ],
  },
  {
    id: "collector",
    title: "Çelik kolektör çapraz ve çapraz takviyeler",
    icon: Anchor,
    duration: "4–8 hafta",
    intrusiveness: "orta",
    body: [
      "Döşemelerde yatay kuvvetleri perdeye güvenle aktarır; uygun esneklik seçimi deprem spektrumuyla eşleştirilmeli.",
      "Bakım ve paslanmazlık önlemleri ömür boyu maliyeti etkiler.",
    ],
  },
  {
    id: "foundation",
    title: "Temel bağlantıları ve bağ kirişleri",
    icon: Building2,
    duration: "8–20 hafta",
    intrusiveness: "yüksek",
    body: [
      "Temel–taşıyıcı gövde uyumsuzluğu varsa önceliklidir; kazı ve geçici destekleme planı gerekir.",
      "Zemin etüdü ve sıvılaşma riski kartları olmadan yapılmaması gerekir.",
    ],
  },
  {
    id: "softStory",
    title: "Şişme kat yumuşaması giderimi",
    icon: Puzzle,
    duration: "10–18 hafta",
    intrusiveness: "yüksek",
    body: [
      "Ticaret katı veya otopark gevşemesinde rijitlik artırılır; sık sık düşeyde yeni perdeler ve bağ elemanları kullanılır.",
      "Ruhsat güncellemeleri ve ticari kiracı işleyişi zaman planını şekillendirir.",
    ],
  },
  {
    id: "chimney",
    title: "Baca ve çıkma dengesi",
    icon: HardHat,
    duration: "2–6 hafta",
    intrusiveness: "orta",
    body: [
      "Çekme gerilmelerini azaltmak için hafif doğrama, çelik iskelet veya bağ elemanları kullanılır.",
      "Konut dışı sıva ve dekorla gizlenmiş çatlaklar mutlaka sıyırılarak incelenir.",
    ],
  },
  {
    id: "isolationInfo",
    title: "Taban yalıtımı (kurumsal uygunluk odaklı özet)",
    icon: FlaskConical,
    duration: "12–30 hafta",
    intrusiveness: "yüksek",
    body: [
      "Yumuşatıcı elastomer veya sürgülü yalıtkanlar yalnızca yeterli kot ve periyod analizi ile uygulanır.",
      "Türkiye sahnesinde çoğunlukla kritik binalar ve sağlık tesisleri bağlamında değerlendirilir; maliyet eğrisi diktir.",
      "Proje öncesi titreşim ölçümü ve doğrusal olmayan zaman tanımı zorunlu kabul edilmelidir.",
    ],
  },
];

const METHOD_FACTORS: Record<MethodId, number> = {
  jacket: 1.08,
  cfrp: 0.92,
  shear: 1.22,
  collector: 1.05,
  foundation: 1.35,
  softStory: 1.28,
  chimney: 0.78,
  isolationInfo: 1.62,
};

const BASE_M2_TRY = 9800;

const MOCK_FIRMS = [
  { id: "f1", city: "İstanbul", name: "Kent Statik Mühendislik Ltd. Şti.", spec: "sıvama / CFRP", phone: "+90 212 XXX XX XX", note: "Konut ve ticari karma" },
  { id: "f2", city: "İzmir", name: "Ege Yapı Güvenliği Dan.", spec: "şişme kat giderimi", phone: "+90 232 XXX XX XX", note: "Körfez kıyısı deneyim bildirimi: demo" },
  { id: "f3", city: "Ankara", name: "Başkent Takviye A.Ş.", spec: "temel bağlantıları", phone: "+90 312 XXX XX XX", note: "Kamu yapı referansı seçkisi örnekleri" },
  { id: "f4", city: "Bursa", name: "Uludağ Güçlendirme", spec: "perde + bağ kirişi", phone: "+90 224 XXX XX XX", note: "Fabrika ve lojistik" },
  { id: "f5", city: "Antalya", name: "Akdeniz Yapı Onarım", spec: "sıvama", phone: "+90 242 XXX XX XX", note: "Oteller ve villalar" },
  { id: "f6", city: "Van", name: "Doğu Anadolu Statik", spec: "yığma + CFRP", phone: "+90 432 XXX XX XX", note: "İklim blokajı saha planı" },
  { id: "f7", city: "Malatya", name: "Yeşilyurt Takviye Üssü", spec: "şişme kat", phone: "+90 422 XXX XX XX", note: "Konut ve site yönetimleri" },
  { id: "f8", city: "Hatay", name: "İskenderun Yapı Güvenliği", spec: "bağ kirişleri", phone: "+90 326 XXX XX XX", note: "Limana yakın tuz etkisi seçkisi dahil" },
  { id: "f9", city: "Adana", name: "Çukurova Beton Onarım", spec: "sıvama + kolektör", phone: "+90 322 XXX XX XX", note: "Çelik-beton hibrit bağlantı" },
  { id: "f10", city: "Trabzon", name: "Pontus Yapı Güvenliği", spec: "heyelan eşli takviye", phone: "+90 462 XXX XX XX", note: "Eğimli arsa projeleri bağlamı" },
  { id: "f11", city: "Erzurum", name: "Palandöken Statik", spec: "yığma ve tuğla sıkılaştırma", phone: "+90 442 XXX XX XX", note: "Kış şantiye planı seçkisi uygun" },
  { id: "f12", city: "Samsun", name: "Yeşilırmak Güçlendirme", spec: "perde + sıvama", phone: "+90 362 XXX XX XX", note: "Kıyı rüzgâr dinamikleri dikkate alınmıştır — demo" },
  { id: "f13", city: "Denizli", name: "Pamukkale Yapı Dokusu", spec: "çatı bacası ve konsol", phone: "+90 258 XXX XX XX", note: "Tarihi yapı referansı — senaryo içi" },
  { id: "f14", city: "Balıkesir", name: "Kazdağı Yapı Güvenliği", spec: "sıvama", phone: "+90 266 XXX XX XX", note: "Konut siteleri blok takibi" },
  { id: "f15", city: "Tekirdağ", name: "Marmara Kuzey Hat Statik", spec: "temel + kolon", phone: "+90 282 XXX XX XX", note: "OSB ve depo projeleri seçkisi bağlamı — demo" },
  { id: "f16", city: "Mersin", name: "Akdeniz Liman Yapı Güvenliği", spec: "bağ kirişleri", phone: "+90 324 XXX XX XX", note: "Akıntı tuz ve lojistik sıcaklığı dikkate alınmış örnek bağlam" },
  { id: "f17", city: "Sakarya", name: "Adapazarı Takviye Ekibi", spec: "şişme kat + sıvama", phone: "+90 264 XXX XX XX", note: "Konut ve plaza — senaryo seçkisi bağlamıdır" },
  { id: "f18", city: "Manisa", name: "Spil Yapı Onarımı", spec: "CFRP + sıvama", phone: "+90 236 XXX XX XX", note: "Çelik fabrika gezdirme planı — demo" },
  { id: "f19", city: "Muğla", name: "Bodrum Kıyı Yapı Güvenliği", spec: "sıvama + baca", phone: "+90 252 XXX XX XX", note: "Temel su basıncı ve percolasyon — senaryo seçkisi dahil" },
  { id: "f20", city: "Elazığ", name: "Hazar Statik Grubu", spec: "genel güçlendirme", phone: "+90 424 XXX XX XX", note: "Konut ve hastane referansı bildirimi seçkisi dahil" },
] as const;

const GOVT_ROWS = [
  {
    id: "g1",
    program: "Kentsel Dönüşüm / riskli yapı bildirimi zinciri",
    summary: "Teknik rapor, il idare onayı ve hak sahibi mutabakatı sıralı ilerler.",
    support: "Mevzuattaki süre ve kira yardımı koşulları proje bazlı değişir; resmi başvuru tarihleri esastır.",
    linkNote: "Çevre ve Şehircilik ve yerel belediye duyuruları",
  },
  {
    id: "g2",
    program: "Belediye sıvama ve perde destek kredileri (örnek senaryo demo)",
    summary: "Pilot ilçelerde konut birlikleri ile toplu güçlendirme keşif bedeli desteği — senaryo bağlamı.",
    support: "Taksitlendirme ile keşif katkısı varsayımsal tabloda %8–15 bandı.",
    linkNote: "Yerel duyuru takvimi",
  },
  {
    id: "g3",
    program: "İller Bankası / TOKİ altyapılı düşük faiz (genel bilgilendirme)",
    summary: "Kamu veya karma projelerde garanti ve gelir paylaşımına göre değişen kredi masrafı.",
    support: "Gerçek teklifleri banka ve aracı kurum belirler; bu tablo yalnızca oryantasyon içindir.",
    linkNote: "Kurum web sitelerindeki güncel şartnameler",
  },
  {
    id: "g4",
    program: "Vergi düzenlemeleri bağlamında tamir ve güçlendirme",
    summary: "Belirli harcamaların giderleştirilebilirliği yıllık vergi mevzuatına göre değişir.",
    support: "Mali müşavir ve yeminli mali müşavir teyidi zorunludur.",
    linkNote: "GİB ve ilgili tebliğler",
  },
] as const;

export default function GuclendirmeRehberiPage() {
  const [method, setMethod] = useState<MethodId>("jacket");
  const [m2, setM2] = useState<number[]>([120]);
  const [zone, setZone] = useState<number[]>([2]);

  const zoneFactor = useMemo(() => {
    const z = zone[0] ?? 2;
    return 0.88 + z * 0.11;
  }, [zone]);

  const estimateTry = useMemo(() => {
    const area = m2[0] ?? 100;
    const mf = METHOD_FACTORS[method];
    return Math.round(area * BASE_M2_TRY * zoneFactor * mf);
  }, [m2, method, zoneFactor]);

  const comparisonRows = METHODS.map((m) => ({
    id: m.id,
    yöntem: m.title,
    süre: m.duration,
    işgal: <ModuleTag tone={m.intrusiveness === "düşük" ? "ok" : m.intrusiveness === "orta" ? "warn" : "risk"}>{m.intrusiveness}</ModuleTag>,
    kısaNot: m.body[0],
  }));

  return (
    <ModuleShell
      title="Güçlendirme Rehberi"
      subtitle="Sekiz yöntem odaklı anlatı, karşılaştırma tablosu, örnek firma dizini ve devlet destekleri için yönlendirici tablo; maliyet hesaplayıcı örnek katsayılarla çalışır."
      badge="Deprem Dayanımı"
      icon={Shield}
      iconAccent="text-emerald-300"
    >
      <ModuleStatGrid
        stats={[
          { label: "Referans m² birim fiyatı (demo)", value: `${BASE_M2_TRY.toLocaleString("tr-TR")} ₺`, hint: "Katsayılarla çarpılır" },
          { label: "Seçili yöntem katsayısı", value: METHOD_FACTORS[method].toFixed(2), hint: "Zemin ve detaylar eklemez" },
          { label: "Deprem zonu çarpanı (özet)", value: zoneFactor.toFixed(2), hint: "1–4 arası kaydırıcı" },
          { label: "Örnek toplam (₺)", value: estimateTry.toLocaleString("tr-TR"), hint: "Yalnızca keşif öncesi bant" },
        ]}
      />

      <div className="space-y-6">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <ModulePanel
              key={m.id}
              title={m.title}
              action={
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-600 text-white" : "border border-white/15 text-slate-300"}`}
                  onClick={() => setMethod(m.id)}
                >
                  Hesaplayıcıda seç
                </button>
              }
            >
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <Icon className="h-5 w-5 text-emerald-300" aria-hidden />
                <span>Süre: {m.duration}</span>
                <span>•</span>
                <span>
                  İşgal / tahribat:{" "}
                  <ModuleTag tone={m.intrusiveness === "düşük" ? "ok" : m.intrusiveness === "orta" ? "warn" : "risk"}>
                    {m.intrusiveness}
                  </ModuleTag>
                </span>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                {m.body.map((p, idx) => (
                  <li key={`${m.id}-${idx}`}>{p}</li>
                ))}
              </ul>
            </ModulePanel>
          );
        })}
      </div>

      <ModulePanel title="Yöntem karşılaştırma tablosu">
        <ModuleDataTable
          caption="Süre ve işgal düzeyi özet tablosu"
          columns={[
            { key: "yöntem", header: "Yöntem", render: (r) => r.yöntem },
            { key: "süre", header: "Süre bandı", render: (r) => r.süre },
            { key: "işgal", header: "İşgal", render: (r) => r.işgal },
            { key: "kısaNot", header: "Öne çıkan not", render: (r) => r.kısaNot },
          ]}
          rows={comparisonRows}
        />
      </ModulePanel>

      <ModulePanel title="Maliyet keşif öncesi hesaplayıcı (örnek katsayılar)" action={<CircleDollarSign className="h-4 w-4 text-slate-400" aria-hidden />}>
        <div className="mod-form-grid max-w-xl">
          <div>
            <label htmlFor="m2-select">Brüt alan (m²)</label>
            <Slider value={m2} min={45} max={420} step={5} onValueChange={setM2} />
            <p className="mt-2 text-xs text-slate-500">Seçili: {m2[0]} m²</p>
          </div>
          <div>
            <label htmlFor="zone-select">Deprem zonu (1 – 4 özet)</label>
            <Slider value={zone} min={1} max={4} step={1} onValueChange={setZone} />
            <p className="mt-2 text-xs text-slate-500">Zon: {zone[0]}</p>
          </div>
          <div>
            <label htmlFor="meth">Yöntem</label>
            <select id="meth" value={method} onChange={(e) => setMethod(e.target.value as MethodId)}>
              {METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Tahmini toplam: <strong className="text-white">{estimateTry.toLocaleString("tr-TR")} ₺</strong> — gerçek keşif,
          iskele, taşıyıcı detay ve ruhsat harçları bu bandın dışındadır.
        </p>
      </ModulePanel>

      <ModulePanel title="Örnek güçlendirme firmaları (demo kayıt — iletişim doğrulanmalıdır)">
        <ModuleDataTable
          caption="20 örnek firma"
          columns={[
            { key: "city", header: "Şehir", render: (r) => r.city },
            { key: "name", header: "Unvan", render: (r) => r.name },
            { key: "spec", header: "Uzmanlık özeti", render: (r) => r.spec },
            { key: "phone", header: "Telefon (maskeli)", render: (r) => r.phone },
            { key: "note", header: "Not", render: (r) => r.note },
          ]}
          rows={[...MOCK_FIRMS]}
        />
      </ModulePanel>

      <ModulePanel title="Kamu ve finansman yönlendirmesi (bilgilendirme — senaryo tablosu)">
        <ModuleDataTable
          caption="Devlet ve kurum destekleri özet"
          columns={[
            { key: "program", header: "Program / kanal", render: (r) => r.program },
            { key: "summary", header: "Süreç özeti", render: (r) => r.summary },
            { key: "support", header: "Destek / koşul", render: (r) => r.support },
            { key: "linkNote", header: "Takip", render: (r) => r.linkNote },
          ]}
          rows={[...GOVT_ROWS]}
        />
      </ModulePanel>
    </ModuleShell>
  );
}
