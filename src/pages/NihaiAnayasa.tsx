import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, Lock, Users, Scale, TrendingUp, Ban, Settings,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, FileText,
  Fingerprint, Clock, Banknote, Gavel, Building2, Eye, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";

const sections = [
  {
    id: "I",
    title: "Mülkiyet ve Envanter Sızdırmazlığı (Exclusivity)",
    icon: Lock,
    color: "blue",
    desc: "Ruhsat bazlı münhasırlık, barter beyanı, stok dondurma ve endüstriyel varlık validasyonu kuralları.",
    rules: [
      { id: "I-1", title: "Ruhsat Bazlı Münhasırlık", desc: "Müteahhit sisteme bağımsız bölüm bazlı değil, Yapı Ruhsatı (Ada/Parsel) üzerinden giriş yapar. Ruhsattaki tüm birimlerin tek yetkili satış kanalı İhaleal.com’dur.", critical: true },
      { id: "I-2", title: "Barter ve Tahsis Beyan Zorunluluğu", desc: "Lansman öncesi taşeronlara verilen (Barter) veya müteahhidin kendine ayırdığı birimler TCKN/Sözleşme ile beyan edilmelidir. Beyan dışı her devir 'Hukuki İhlal' sayılır.", critical: true },
      { id: "I-3", title: "Stok Dondurma Protokolü", desc: "İhale süreci başladıktan sonra stok geri çekilemez. Müteahhit, platform dışı bir satış yaparsa veya mülkü dondurursa 'Bypass Cezası' devreye girer.", critical: true },
      { id: "I-4", title: "Endüstriyel Varlık Validasyonu", desc: "Fabrika, otel ve ticari alanlarda; Trafo Gücü (kVA), ÇED Raporu, Sanayi Sicil Belgesi ve İtfaiye Uygunluk belgeleri doğrulanmadan ilan aktifleşemez.", critical: false },
    ]
  },
  {
    id: "II",
    title: "Miras ve Şahsiyet Hukuku (Fail-Safe)",
    icon: Users,
    color: "emerald",
    desc: "Vefat, miras reddi, ehliyet kaybı ve vasiyet durumlarında süreçlerin devam etmesini garanti altına alan kurallar.",
    rules: [
      { id: "II-1", title: "Külli Halefiyet İlkesi", desc: "Müteahhidin (Gerçek Kişi) vefatı durumunda, TMK m. 599 uyarınca sözleşme yükümlülükleri mirasçılara geçer. Süreç durmaz, mirasçılar platformdaki 'Satıcı' sıfatını devralır.", critical: true },
      { id: "II-2", title: "Mirasın Reddi ve Tasfiye", desc: "Mirasın reddi halinde, Takasbank havuzundaki alıcı bedelleri sistem tarafından otomatik olarak ve kesintisiz şekilde alıcılara iade edilir.", critical: true },
      { id: "II-3", title: "Ehliyet Kaybı ve Vasayet", desc: "Satıcının kısıtlanması durumunda, mahkemece atanan vasi onayı sisteme dahil edilene kadar işlem 'Hukuki Beklemede' statüsüne alınır.", critical: false },
    ]
  },
  {
    id: "III",
    title: "Mali Risk ve İcra-İflas Yönetimi",
    icon: Scale,
    color: "violet",
    desc: "Konkordato, iflas, rehin ve ipotek durumlarında alıcı ve platformun haklarını koruyan mali güvenlik kuralları.",
    rules: [
      { id: "III-1", title: "Konkordato Muvafakatı", desc: "Satıcının konkordato ilan etmesi halinde, konkordato komiserinin dijital onayı olmadan mülk devri veya satış işlemi yapılamaz.", critical: true },
      { id: "III-2", title: "İflas Masası ve Alacak Önceliği", desc: "Satıcının iflası durumunda, alıcının parası henüz müteahhide geçmediği için 'İflas Masası'na dahil edilemez ve alıcıya iade edilir. İhaleal.com komisyonu 'İmtiyazlı Alacak' olarak takip edilir.", critical: true },
      { id: "III-3", title: "Rehin ve İpotek Yönetimi", desc: "Taşınmaz üzerindeki mevcut ipotekler, satış bedelinden otomatik mahsup edilerek doğrudan bankaya gönderilir ve tapu temizlenerek alıcıya devredilir.", critical: true },
    ]
  },
  {
    id: "IV",
    title: "Dinamik Sigorta ve Enflasyon Koruması",
    icon: TrendingUp,
    color: "amber",
    desc: "Enflasyona karşı koruma, endeksli sigorta poliçeleri ve işletme kaybı tazminatı mekanizmaları.",
    rules: [
      { id: "IV-1", title: "Endeksli Bina Tamamlama Sigortası", desc: "Poliçeler sabit bedelli olamaz; inşaat maliyet endeksine (TÜİK-İME) duyarlı, yenileme bedeli esaslı (Replacement Cost) olmak zorundadır.", critical: true },
      { id: "IV-2", title: "Enflasyonist Koruma Faktörü", desc: "Cezai şartlar ve tazminatlar, ihlal günündeki bedel üzerinden değil; 'Ödeme Günündeki Güncel Rayiç Bedel' üzerinden hesaplanır. Müteahhit enflasyondan faydalanarak cezayı eritemez.", critical: true },
      { id: "IV-3", title: "İşletme Kaybı (ALOP) Sigortası", desc: "Endüstriyel tesislerde teslimat gecikmesi halinde, alıcının kâr kaybı sigorta poliçesi üzerinden tazmin edilir.", critical: false },
    ]
  },
  {
    id: "V",
    title: "Cezaî Şartlar ve Üçkağıt (Bypass) Engelleme",
    icon: Ban,
    color: "rose",
    desc: "10X ağırlaştırılmış ceza, ticari avans faizi, genişletilmiş lead takibi ve metrekare hırsızlığı tazminatı.",
    rules: [
      { id: "V-1", title: "10X Ağırlaştırılmış Ceza", desc: "Metrekareden çalma, malzeme kalitesini düşürme, aradan çıkma (Bypass) veya hileli barter beyanında; mahrum kalınan hizmet bedelinin (%4 + KDV) tam 10 KATI cezai şart uygulanır.", critical: true },
      { id: "V-2", title: "Ticari Avans Faizi", desc: "Tüm cezai bedellere, ihlal tarihinden itibaren TCMB En Yüksek Ticari Avans Faizi günlük olarak işletilir.", critical: true },
      { id: "V-3", title: "Genişletilmiş Lead Takibi", desc: "Alıcının soybağı (3. dereceye kadar akrabalar), ortaklıkları veya personeli üzerinden yapılan gizli alımlar, müteahhit yardımlı 'Bypass' sayılır ve ceza tetiklenir.", critical: true },
      { id: "V-4", title: "Metrekare Hırsızlığı Tazminatı", desc: "Proje ile teslim edilen birim arasındaki metrekare farkı, güncel piyasa rayici üzerinden hesaplanarak 10 katı ceza ile tahsil edilir.", critical: true },
    ]
  },
  {
    id: "VI",
    title: "Operasyonel ve Mali Kurallar",
    icon: Settings,
    color: "teal",
    desc: "Net kâr paylaşımı, B2B fatura şartı, biyometrik ve dijital delil mekanizmaları.",
    rules: [
      { id: "VI-1", title: "Net Kâr Paylaşımı", desc: "Emlakçı hak edişi; brüt komisyon tutarından vergiler ve POS masrafları düşüldükten sonra kalan NET TUTARIN %50'sidir.", critical: true },
      { id: "VI-2", title: "B2B Fatura Şartı", desc: "Geçerli bir hizmet faturası sisteme yüklenmeden hiçbir iş ortağına ödeme çıkışı yapılamaz.", critical: true },
      { id: "VI-3", title: "Biyometrik ve Dijital Delil", desc: "Tüm teklifler FaceID/TouchID ve zaman damgasıyla mühürlenir. Bu veriler mahkemede 'İnkar Edilemez Kesin Delil' niteliğindedir.", critical: true },
    ]
  },
];

export function NihaiAnayasa() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string[]>(["I"]);
  const [activeRule, setActiveRule] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalRules = sections.reduce((sum, s) => sum + s.rules.length, 0);
  const criticalRules = sections.reduce((sum, s) => sum + s.rules.filter(r => r.critical).length, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfa
          </Button>

          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">İhaleAL.com Nihai Sistem Anayasası</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Master Architecture — Mülkiyet, miras, mali risk, sigorta, cezaî şartlar ve operasyonel kuralların üst dokümanı.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-400" /> Kritik: {criticalRules} madde</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Toplam: {totalRules} alt madde</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-amber-400" /> 6 Ana Bölüm</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {sections.map(sec => {
            const Icon = sec.icon;
            const crit = sec.rules.filter(r => r.critical).length;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  toggle(sec.id);
                  document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="glass rounded-xl p-4 text-left hover:bg-white/[0.06] transition-all border border-slate-200/80 hover:border-white/15"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${sec.color}-500/10`}>
                    <Icon className={`w-4 h-4 text-${sec.color}-400`} />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{sec.id}. BÖLÜM</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{sec.title}</h3>
                <p className="text-xs text-slate-500">{sec.rules.length} madde · {crit} kritik</p>
              </button>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isOpen = expanded.includes(sec.id);
            return (
              <div key={sec.id} id={`section-${sec.id}`} className="glass rounded-xl border border-slate-200/80 overflow-hidden">
                <button
                  onClick={() => toggle(sec.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${sec.color}-500/10`}>
                      <Icon className={`w-5 h-5 text-${sec.color}-400`} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">{sec.id}. {sec.title}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{sec.desc}</p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        {sec.rules.map((rule, i) => (
                          <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className={`rounded-lg p-4 border transition-all cursor-pointer ${
                              activeRule === rule.id
                                ? "bg-white/[0.08] border-white/20"
                                : "bg-white/[0.02] border-slate-200/80 hover:border-slate-200"
                            }`}
                            onClick={() => setActiveRule(activeRule === rule.id ? null : rule.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                rule.critical ? "bg-rose-500/10" : "bg-cyan-500/10"
                              }`}>
                                {rule.critical ? (
                                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono text-slate-500">{rule.id}</span>
                                  {rule.critical && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                                      KRİTİK
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-semibold text-white mb-1">{rule.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{rule.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Enforcement Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 glass rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-2">Yaptırım ve Hukuki Geçerlilik</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Bu anayasa, İhaleAL.com platformunun tüm yazılım mimarisi, veritabanı kısıtları, akıllı sözleşme tetikleyicileri ve hukuki belgeleri için üst normdur. Kullanıcı kaydı, ilan verme, teklif verme ve satın alma işlemlerinin tamamı bu maddelere tabidir.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Biyometrik Onay</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Zaman Damgası</span>
                <span className="flex items-center gap-1"><Banknote className="w-3 h-3" /> Takasbank Entegrasyonu</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Denetim Kaydı</span>
                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> İmtiyazlı Alacak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cross-Reference */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white/[0.02] p-5 text-center">
          <p className="text-sm text-slate-400 mb-3">
            Bu Nihai Sistem Anayasası, site üzerindeki{" "}
            <strong>birleşik çerçeve sayfası</strong> (İhaleAL kuralları + KİK hatırlatıcıları) ile birlikte okunmalıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)} className="border-slate-200 text-slate-300 hover:text-white">
              <FileText className="w-4 h-4 mr-2" /> Platform ve KİK çerçevesine git
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/yasal/agency-contract")} className="border-slate-200 text-slate-300 hover:text-white">
              <Building2 className="w-4 h-4 mr-2" /> Ortaklık sözleşmesi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NihaiAnayasa;
