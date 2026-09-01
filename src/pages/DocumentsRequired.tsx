import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Shield, Building2, BadgeCheck, Banknote,
  UserCheck, Gavel, CreditCard, Landmark, AlertTriangle, CheckCircle2,
  XCircle, Clock, ChevronDown, ChevronUp, FileCheck, Printer, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBidBondPercent } from "@/lib/fees";

export default function DocumentsRequired() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("gerekli");

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  const gerekliEvraklar = [
    {
      category: "Kimlik ve Nüfus",
      icon: <UserCheck className="w-5 h-5" />,
      color: "blue",
      items: [
        { name: "Nüfus Cüzdanı / Pasaport", required: true, desc: "Güncel ve okunaklı kimlik belgesi. Yabancı uyruklular için pasaport ve ikamet tezkeresi." },
        { name: "Vukuatlı Nüfus Kayıt Örneği", required: true, desc: "E-Devlet üzerinden alınmış, son 6 ay içinde düzenlenmiş. Medeni hal bilgisi içermeli." },
        { name: "Adli Sicil Kaydı (Sabıka Kaydı)", required: true, desc: "E-Devlet üzerinden alınmış. İhale katılımında hukuki engel olmadığını teyit eder." },
        { name: "Yerleşim Yeri Belgesi", required: false, desc: "İkametgah ilmühaberi veya e-Devlet adres beyanı. İhale bölgesi ile ilişki kurulabilir." },
      ],
    },
    {
      category: "Finansal ve Banka",
      icon: <Landmark className="w-5 h-5" />,
      color: "emerald",
      items: [
        { name: "Findeks Kredi Notu ve Risk Raporu", required: true, desc: "Findeks üzerinden alınmış güncel kredi notu. Minimum 1200 puan önerilir. Platform üzerinden anlık sorgulanır." },
        { name: "Banka Hesap Cüzdanı / IBAN Doğrulama", required: true, desc: "Türkiye'deki aktif bir banka hesabına ait IBAN. Ödeme ve teminat iadeleri için zorunlu." },
        { name: "Gelir Belgesi / Maaş Bordrosu", required: true, desc: "Son 3 aya ait maaş bordrosu, SGK hizmet dökümü veya noter tasdikli gelir beyanı. Serbest meslek için vergi levhası." },
        { name: "Vergi Levhası (Ticari alımlar için)", required: false, desc: "Şirket adına alım yapılacaksa güncel vergi levhası ve imza sirküleri." },
        { name: "Banka Referans Mektubu", required: false, desc: "Çalışılan bankadan alınacak referans mektubu. Kredi geçmişi olanlar için opsiyonel." },
      ],
    },
    {
      category: "Gayrimenkul ve Ekspertiz",
      icon: <Building2 className="w-5 h-5" />,
      color: "sky",
      items: [
        { name: "Ekspertiz / Değerleme Raporu", required: true, desc: "SPK lisanslı değerleme uzmanı tarafından hazırlanmış, 6 ay geçerli rapor. Platform üzerinden talep edilebilir." },
        { name: "Tapu Kayıt Örneği", required: true, desc: "E-Devlet veya Tapu Kadastro'dan alınmış güncel tapu kaydı. Şerh, ipotek ve kayıtlı haklar incelenir." },
        { name: "İmar Durumu Belgesi", required: false, desc: "Belediyeden alınmış imar durumu. Yapı kullanma izin belgesi (iskan) varsa eklenmeli." },
        { name: "Kat İrtifakı / Kat Mülkiyeti Belgesi", required: false, desc: "Projesi devam eden gayrimenkuller için kat irtifakı tapusu ve proje onay belgesi." },
      ],
    },
    {
      category: "Teminat ve Kapora",
      icon: <Banknote className="w-5 h-5" />,
      color: "violet",
      items: [
        {
          name: "Teminat Mektubu / Kapora Dekontu",
          required: true,
          desc: `İhale bedelinin ${formatBidBondPercent()} oranında teminat (fees.ts). Halkbank, Ziraat Bankası veya İş Bankası blokeli çek ile yatırılır.`,
        },
        { name: "Temiz Kaçakçılık Beyannamesi", required: true, desc: "Gümrük kaçakçılığı ile mücadele kapsamında beyan. E-Devlet üzerinden alınır." },
        { name: "Terör Örgütüne Yardım Etmediğine Dair Beyan", required: true, desc: "3713 sayılı Kanun kapsamında noter onaylı veya platform üzerinden dijital imzalı beyan." },
      ],
    },
    {
      category: "Özel Durumlar (Şirket / Vekalet)",
      icon: <FileText className="w-5 h-5" />,
      color: "amber",
      items: [
        { name: "Ticaret Sicil Gazetesi", required: false, desc: "Şirket unvanı, merkezi ve yetkili kişilerin doğrulanması için güncel gazete örneği." },
        { name: "İmza Sirküleri", required: false, desc: "Noter tasdikli imza beyannamesi. Şirket yetkilisinin ihale süreçlerini yürütme yetkisini gösterir." },
        { name: "Noter Onaylı Vekaletname", required: false, desc: "Başka bir kişi adına ihaleye katılım için özel vekaletname. Gümrük Müsteşarlığı formatında." },
        { name: "Oda Kayıt Belgesi", required: false, desc: "Ticaret Odası / Emlakçılar Odası kayıt belgesi. Emlak ajansları için zorunlu." },
      ],
    },
  ];

  const yasalCerceve = [
    { law: "7263 sayılı Kanun", desc: "E-ticaret ve dijital hizmetlere ilişkin çerçeve. Operasyonel uyum için hukuk danışmanlığı ve politika güncellemesi gerekir." },
    { law: "6698 sayılı KVKK", desc: "Kişisel verilerin korunması. Tüm evraklar şifreli sunucularda saklanır." },
    { law: "5549 sayılı Suç Gelirleri Kanunu", desc: "Kara para aklamaya karşı önlem (AML). Şüpheli işlemler MASAK'a bildirilir." },
    { law: "2975 sayılı Tapu Kanunu", desc: "Tapu devri ve tescil işlemleri. Tüm tapu işlemleri noter eşliğinde yapılır." },
    { law: "3100 sayılı İmar Kanunu", desc: "Yapı ruhsatı, iskan ve imar durumu kontrolleri." },
    { law: "193 sayılı Gelir Vergisi Kanunu", desc: "Gayrimenkul alım-satım vergi yükümlülükleri. Tapu harcı ve KDV hesaplamaları." },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-[var(--zemin-yumusak)] to-transparent border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-[20px] [background:var(--gradient-cta)] flex items-center justify-center"><FileCheck className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-normal text-white">İhale Katılım Evrakları</h1>
              <p className="text-slate-400">Gayrimenkul ihalelerine katılmak için gerekli tüm belgeler ve yasal çerçeve</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* Uyarı Banner */}
        <div className="p-4 rounded-[20px] bg-[var(--zemin-yumusak)] border border-[var(--cizgi)] flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--metin-ikincil)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-300 font-normal mb-1">Önemli Hatırlatma</p>
            <p className="text-sm text-slate-400 mb-2">Tüm belgelerin güncel ve okunaklı olması zorunludur. Eksik veya sahte evrak tespitinde ihale katılım hakkı iptal edilir ve kara listeye alınırsınız. Belgelerinizi platform üzerinden güvenli bir şekilde yükleyebilirsiniz.</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-300">Hukuki bağlayıcılık:</strong> Bu sayfa hukuki danışmanlık yerine geçmez. İhale şartnamesi, alıcı/satıcı sözleşmeleri, kurumsal ihale düzenlemeleri ve e-Devlet / vekalet süreçleri için <strong className="text-slate-300">avukat onaylı</strong> doküman seti oluşturulmalıdır.
            </p>
          </div>
        </div>

        {/* Evrak Kategorileri */}
        {gerekliEvraklar.map((section) => (
          <Card key={section.category} className="bg-slate-900/50 border-slate-200/80 overflow-hidden">
            <button
              onClick={() => toggle(section.category)}
              className="w-full p-5 flex items-center justify-between text-start hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-[10px] bg-${section.color}-500/10 text-${section.color}-400`}>{section.icon}</div>
                <div>
                  <h3 className="text-base font-normal text-white">{section.category}</h3>
                  <p className="text-xs text-slate-500">{section.items.filter(i => i.required).length} zorunlu, {section.items.filter(i => !i.required).length} opsiyonel</p>
                </div>
              </div>
              {openSection === section.category ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            {openSection === section.category && (
              <CardContent className="px-5 pb-5 pt-0 space-y-3">
                {section.items.map((item) => (
                  <div key={item.name} className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80">
                    <div className="flex items-center gap-2 mb-1">
                      {item.required ? <Badge className="bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] text-[10px] border-0">Zorunlu</Badge> : <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">Opsiyonel</Badge>}
                      <span className="text-sm font-normal text-white">{item.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 ps-0">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}

        {/* Yasal Çerçeve */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-[var(--metin-ikincil)]" /> Yasal Çerçeve ve Mevzuat</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {yasalCerceve.map((law) => (
                <div key={law.law} className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80">
                  <div className="text-sm font-normal text-white mb-1">{law.law}</div>
                  <p className="text-xs text-slate-400">{law.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Süreç Akışı */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-[var(--metin-ikincil)]" /> Evrak Teslim Süreci</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: "Üyelik ve Kimlik Doğrulama", desc: "E-Devlet üzerinden kimlik doğrulama yapılır. Yüz tanıma ve SMS onayı zorunludur.", time: "5 dakika" },
                { step: 2, title: "Evrak Yükleme", desc: "Tüm belgeler platforma PDF/JPG formatında yüklenir. AI OCR sistemi otomatik doğrular.", time: "10-15 dk" },
                { step: 3, title: "Findeks ve Banka Doğrulama", desc: "Findeks API ile kredi notu sorgulanır. Banka hesabı mikro ödeme ile doğrulanır.", time: "Anlık" },
                { step: 4, title: "Ekspertiz Raporu", desc: "Platform ekspertiz ekibi gayrimenkulü yerinde inceler ve rapor hazırlar.", time: "2-3 gün" },
                { step: 5, title: "Onay ve İhale Katılım", desc: "Tüm evraklar incelenip onaylandıktan sonra ihalelere teklif verilebilir.", time: "24 saat" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full [background:var(--gradient-cta)] flex items-center justify-center shrink-0 text-xs font-normal text-white">{s.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-normal text-white">{s.title}</span>
                      <Badge variant="outline" className="border-[var(--cizgi)] text-[var(--metin-ikincil)] text-[10px]">{s.time}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Banka ve Findeks Entegrasyonu */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-lg font-normal text-white flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-[var(--metin-ikincil)]" /> Entegre Banka ve Kurumlar</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Ziraat Bankası", "Halkbank", "İş Bankası", "Garanti BBVA", "Akbank", "Yapı Kredi", "Findeks", "E-Devlet"].map((bank) => (
                <div key={bank} className="p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 text-center">
                  <Landmark className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <span className="text-xs text-slate-300 font-normal">{bank}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Tüm bankalar ile API entegrasyonu mevcuttur. Teminat ve ödeme işlemleri otomatik olarak gerçekleştirilir.</p>
          </CardContent>
        </Card>

        {/* İhale Koşullarına Git */}
        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate("/ihale-kosullari")} variant="outline" className="border-slate-200 text-slate-300 hover:text-white gap-2"><Gavel className="w-4 h-4" /> İhale Koşulları</Button>
          <Button onClick={() => navigate("/ekspertiz")} variant="outline" className="border-slate-200 text-slate-300 hover:text-white gap-2"><FileCheck className="w-4 h-4" /> Ekspertiz Talebi</Button>
        </div>
      </div>
    </div>
  );
}
