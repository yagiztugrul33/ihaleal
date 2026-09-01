import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Building2, MapPin, User, Mail, Phone,
  FileText, Send, CheckCircle2, CalendarClock, BarChart3,
  Home, Ruler, Banknote, AlertTriangle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Expertise() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    propertyType: "daire",
    roomCount: "",
    netSqm: "",
    grossSqm: "",
    buildingAge: "",
    floor: "",
    totalFloors: "",
    heating: "dogalgaz",
    facade: "güney",
    elevator: false,
    parking: false,
    balcony: false,
    furnished: false,
    usingStatus: "bos",
    deedStatus: "kat-mulkiyeti",
    estimatedValue: "",
    requestReason: "alim",
    notes: "",
    agreed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-normal text-white mb-3">Talebiniz Alindi!</h1>
          <p className="text-slate-400 mb-2">
            Ekspertiz talebiniz basariyla kaydedildi. Uzman degerleme ekibimiz en kisa sürede size ulasacaktir.
          </p>
          <div className="p-4 rounded-[20px] bg-blue-500/5 border border-blue-500/10 mt-6 mb-8">
            <div className="flex items-center gap-2 justify-center text-sm text-blue-400 mb-2"><CalendarClock className="w-4 h-4" /><span>Tahmini Rapor Süresi</span></div>
            <p className="text-xs text-slate-400">Standart raporlar 2-3 is günü, hizli raporlar 24 saat icinde hazirlanir.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} className="[background:var(--gradient-cta)] text-white"><Home className="w-4 h-4 me-1.5" /> Ana Sayfa</Button>
            <Button variant="outline" onClick={() => setSubmitted(false)} className="border-slate-200 text-slate-300 hover:text-white"><FileText className="w-4 h-4 me-1.5" /> Yeni Talep</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-blue-500/5 to-transparent border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-[20px] [background:var(--gradient-cta)] flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-normal text-white">Uzman Gorusu & Ekspertiz</h1>
              <p className="text-slate-400">Profesyonel gayrimenkul degerleme raporu talep edin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-lg font-normal text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Iletisim Bilgileri</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="text-sm text-slate-400 mb-1 block">Ad Soyad *</label><Input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Orn: Ahmet Yilmaz" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">E-posta *</label><Input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="ahmet@email.com" /></div>
                    <div className="sm:col-span-2"><label className="text-sm text-slate-400 mb-1 block">Telefon *</label><Input required type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="+90 532 123 45 67" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-lg font-normal text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" /> Adres Bilgileri</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="text-sm text-slate-400 mb-1 block">Sehir *</label><Input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Istanbul" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Ilce *</label><Input required value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Kadikoy" /></div>
                    <div className="sm:col-span-2"><label className="text-sm text-slate-400 mb-1 block">Acik Adres</label><Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Mahalle, Sokak, No" /></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-lg font-normal text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-400" /> Gayrimenkul Ozellikleri</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="text-sm text-slate-400 mb-1 block">Emlak Tipi</label>
                      <select value={form.propertyType} onChange={(e) => setForm({...form, propertyType: e.target.value})} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="daire">Daire</option><option value="villa">Villa</option><option value="mustakil">Mustakil Ev</option>
                        <option value="rezidans">Rezidans</option><option value="isyeri">Is Yeri</option><option value="arsa">Arsa</option>
                      </select>
                    </div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Oda + Salon</label><Input value={form.roomCount} onChange={(e) => setForm({...form, roomCount: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Orn: 3+1" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Net m² *</label><Input required type="number" value={form.netSqm} onChange={(e) => setForm({...form, netSqm: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="120" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Brüt m²</label><Input type="number" value={form.grossSqm} onChange={(e) => setForm({...form, grossSqm: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="145" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Bina Yasi</label><Input value={form.buildingAge} onChange={(e) => setForm({...form, buildingAge: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Orn: 5-10 arasi, 0 (Sifir)" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Bulundugu Kat</label><Input value={form.floor} onChange={(e) => setForm({...form, floor: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Orn: 3, Zemin, Bahce" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Toplam Kat</label><Input type="number" value={form.totalFloors} onChange={(e) => setForm({...form, totalFloors: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="5" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Isitma</label>
                      <select value={form.heating} onChange={(e) => setForm({...form, heating: e.target.value})} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="dogalgaz">Dogalgaz Kombi</option><option value="merkezi">Merkezi Sistem</option>
                        <option value="yerden">Yerden Isitma</option><option value="klima">Klima</option><option value="soba">Soba</option><option value="yok">Yok</option>
                      </select>
                    </div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Cephe</label>
                      <select value={form.facade} onChange={(e) => setForm({...form, facade: e.target.value})} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="güney">Guney</option><option value="kuzey">Kuzey</option><option value="dogu">Dogu</option>
                        <option value="bati">Bati</option><option value="guneydogu">Guneydogu</option><option value="guneybati">Guneybati</option>
                      </select>
                    </div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Kullanim Durumu</label>
                      <select value={form.usingStatus} onChange={(e) => setForm({...form, usingStatus: e.target.value})} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="bos">Bos</option><option value="kiraci">Kiracili</option><option value="malik">Malik Oturuyor</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {[
                      { key: "elevator", label: "Asansör" },
                      { key: "parking", label: "Otopark" },
                      { key: "balcony", label: "Balkon" },
                      { key: "furnished", label: "Esyali" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 p-3 rounded-[20px] bg-white/[0.03] border border-slate-200/80 cursor-pointer hover:bg-white/[0.05] transition-colors">
                        <input type="checkbox" checked={form[item.key as keyof typeof form] as boolean} onChange={(e) => setForm({...form, [item.key]: e.target.checked})} className="w-4 h-4 rounded-[3px] border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-500/50" />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-200/80">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-lg font-normal text-white flex items-center gap-2"><Banknote className="w-5 h-5 text-blue-400" /> Değerleme Bilgileri</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className="text-sm text-slate-400 mb-1 block">Beklentiniz (Opsiyonel)</label><Input type="number" value={form.estimatedValue} onChange={(e) => setForm({...form, estimatedValue: e.target.value})} className="bg-slate-950 border-slate-200 text-white" placeholder="Orn: 5000000" /></div>
                    <div><label className="text-sm text-slate-400 mb-1 block">Talep Nedeni</label>
                      <select value={form.requestReason} onChange={(e) => setForm({...form, requestReason: e.target.value})} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="alim">Satin Alma</option><option value="satis">Satis / Ihale</option>
                        <option value="kredi">Banka Kredisi</option><option value="vergi">Vergi Degeri</option><option value="diger">Diger</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2"><label className="text-sm text-slate-400 mb-1 block">Ek Notlar</label><textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-[10px] bg-slate-950 border border-slate-200 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" placeholder="Dairenin durumu, yaptirilmasi gereken tadilatlar vb." /></div>
                  </div>
                </CardContent>
              </Card>

              <label className="flex items-start gap-3 p-4 rounded-[20px] bg-white/[0.03] border border-slate-200/80 cursor-pointer">
                <input type="checkbox" required checked={form.agreed} onChange={(e) => setForm({...form, agreed: e.target.checked})} className="w-4 h-4 mt-0.5 rounded-[3px] border-white/20 bg-slate-950 text-blue-500 focus:ring-blue-500/50 shrink-0" />
                <div>
                  <p className="text-sm text-slate-400"><span className="text-white font-normal">KVKK Aydinlatma Metni'ni</span> okudum, ekspertiz hizmeti kapsaminda kisisel verilerimin islenmesine rza veriyorum.</p>
                  <button type="button" onClick={() => navigate("/kvkk")} className="text-xs text-blue-400 hover:text-blue-300 mt-1">KVKK Metnini Oku</button>
                </div>
              </label>

              <Button type="submit" className="w-full [background:var(--gradient-cta)] hover:brightness-110 text-white font-normal h-12 text-base"><Send className="rtl:-scale-x-100 w-5 h-5 me-2" /> Ekspertiz Talebi Gonder</Button>
            </form>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-200/80 sticky top-24">
              <CardContent className="p-5 space-y-5">
                <h4 className="text-sm font-normal text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /> Rapor Icerigi</h4>
                <div className="space-y-3">
                  {[
                    "Piyasa analizi ve bolge karsilastirmasi",
                    "Yapi kalitesi ve teknik durum degerlendirmesi",
                    "Hukuki durum ve tapu analizi",
                    "AI destekli fiyat tahmini",
                    "Kira getirisi ve yatırım analizi",
                    "Risk faktorleri ve tavsiyeler",
                    "Fotografli ve detayli rapor formati",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm text-slate-400">{item}</span></div>
                  ))}
                </div>
                <div className="border-t border-slate-200/80 pt-4">
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Standart Rapor</span><span className="text-white font-normal">₺5.500</span></div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Hizli Rapor (24s)</span><span className="text-white font-normal">₺8.250</span></div>
                  <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-xs mt-2 w-full justify-center">Ihale kazananlara %50 indirim</Badge>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-[20px] bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-start gap-2"><Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /><p className="text-xs text-slate-400">Değerleme raporu, SPK ve BDDK düzenlemelerine uygun hazirlanir. Raporlar 6 ay gecerlidir.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
