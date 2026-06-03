// R14 PAKET 4 — Yeni Proje Oluşturma (multi-step form + birim envanteri)
// Master 8 karar: C1 ayrı sayfa, D1 ayrı project_units, E1 unit→listing, H1 mock PDF

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useDeveloperProjects, bulkInsertUnits, type NewProjectInput, type NewUnitInput } from "@/hooks/useDeveloperProjects";
import { getActiveOrgId } from "@/lib/activeOrgId";
import { supabase } from "@/lib/supabase";
import { uploadProjectDoc, UploadUnavailableError } from "@/lib/uploadFile";

type Step = 1 | 2 | 3 | 4;

const STAGES: { value: NewProjectInput["stage"]; label: string }[] = [
  { value: "planning", label: "Planlama" },
  { value: "foundation", label: "Temel" },
  { value: "construction", label: "İnşaat" },
  { value: "finishing", label: "İnce İmalat" },
  { value: "ready", label: "Hazır" },
];

const UNIT_TYPES = ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "Dubleks", "Tripleks", "Müstakil"] as const;

export default function MuteahhitYeniProjePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useDeveloperProjects();
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ADIM 1
  const [project_name, setProjectName] = useState("");
  const [ruhsat_no, setRuhsatNo] = useState("");
  const [ada_parsel, setAdaParsel] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<NewProjectInput["stage"]>("planning");

  // ADIM 2 — Ruhsat belgesi (Storage)
  const [skipRuhsat, setSkipRuhsat] = useState(true);
  const [ruhsatFile, setRuhsatFile] = useState<File | null>(null);
  const [ruhsatFileName, setRuhsatFileName] = useState("");

  // ADIM 3 — Birim envanteri
  const [units, setUnits] = useState<NewUnitInput[]>([
    { unit_no: "A-1", block: "A", floor: 1, unit_type: "2+1", m2_brut: 95, m2_net: 80, price_try: 3500000 },
  ]);

  const addUnit = () => {
    setUnits((u) => [...u, { unit_no: `A-${u.length + 1}`, block: "A" }]);
  };

  const removeUnit = (idx: number) => {
    setUnits((u) => u.filter((_, i) => i !== idx));
  };

  const updateUnit = (idx: number, patch: Partial<NewUnitInput>) => {
    setUnits((u) => u.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const validate1 = (): string | null => {
    if (!project_name.trim()) return "Proje adı zorunludur";
    if (!ruhsat_no.trim()) return "Ruhsat numarası zorunludur";
    if (!ada_parsel.trim()) return "Ada/parsel zorunludur";
    if (!province.trim() || !district.trim()) return "İl ve ilçe zorunludur";
    if (!address.trim()) return "Adres zorunludur";
    return null;
  };

  const validate3 = (): string | null => {
    if (units.length === 0) return "En az 1 birim ekleyin";
    const noSet = new Set<string>();
    for (const u of units) {
      if (!u.unit_no?.trim()) return "Tüm birimlerde unit_no zorunludur";
      if (noSet.has(u.unit_no)) return `Tekrarlayan unit_no: ${u.unit_no}`;
      noSet.add(u.unit_no);
      if (!u.m2_brut || u.m2_brut <= 0) return `${u.unit_no}: m² brüt > 0 olmalı`;
      if (!u.price_try || u.price_try <= 0) return `${u.unit_no}: fiyat > 0 olmalı`;
    }
    return null;
  };

  const next = () => {
    setError(null);
    if (step === 1) {
      const err = validate1();
      if (err) return setError(err);
      setStep(2);
    } else if (step === 2) {
      if (!skipRuhsat && !ruhsatFile) {
        return setError("Ruhsat belgesi seçin veya «Daha sonra ekleyeceğim» kutusunu işaretleyin.");
      }
      setStep(3);
    } else if (step === 3) {
      const err = validate3();
      if (err) return setError(err);
      setStep(4);
    }
  };

  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const save = async () => {
    setBusy(true);
    setError(null);
    const { data: project, error: projErr } = await createProject({
      project_name: project_name.trim(),
      ruhsat_no: ruhsat_no.trim(),
      ada_parsel: ada_parsel.trim(),
      province: province.trim(),
      district: district.trim(),
      neighborhood: neighborhood.trim() || undefined,
      address: address.trim(),
      description: description.trim() || undefined,
      stage,
    });
    if (projErr || !project) {
      setError(projErr ?? "Proje oluşturulamadı");
      setBusy(false);
      return;
    }

    if (!skipRuhsat && ruhsatFile) {
      try {
        const orgId = (await getActiveOrgId()) ?? user!.id;
        const uploaded = await uploadProjectDoc(ruhsatFile, orgId, project.id, "ruhsat");
        const { error: ruhsatErr } = await supabase
          .from("developer_projects")
          .update({ ruhsat_document_url: uploaded.path, ruhsat_status: "pending" })
          .eq("id", project.id);
        if (ruhsatErr) {
          setError(`Proje kaydedildi ancak ruhsat URL yazılamadı: ${ruhsatErr.message}`);
          setBusy(false);
          navigate(`/muteahhit/proje/${project.id}`);
          return;
        }
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof UploadUnavailableError
            ? uploadErr.message
            : uploadErr instanceof Error
              ? uploadErr.message
              : "Ruhsat yüklenemedi";
        setError(`Proje kaydedildi ancak ruhsat yüklenemedi: ${msg}`);
        setBusy(false);
        navigate(`/muteahhit/proje/${project.id}`);
        return;
      }
    }

    const { error: unitsErr } = await bulkInsertUnits(project.id, units);
    setBusy(false);
    if (unitsErr) {
      setError(`Proje kaydedildi ama birimler eklenemedi: ${unitsErr}`);
      navigate(`/muteahhit/proje/${project.id}`);
      return;
    }
    navigate(`/muteahhit/proje/${project.id}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-slate-400">
        Yeni proje oluşturmak için giriş yapın. <button onClick={() => navigate("/giris?profil=muteahhit")} className="text-blue-400 underline">Giriş</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/muteahhit/panel")} className="mb-4 gap-2 text-slate-400">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Panele dön
        </Button>

        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-cyan-400" /> Yeni Proje
        </h1>
        <p className="text-slate-400 text-sm mb-6">Lansman ilanı oluşturmak için proje + birim envanteri tanımlayın.</p>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`flex-1 h-2 rounded-full ${n <= step ? "bg-cyan-500" : "bg-slate-700"}`} />
          ))}
        </div>

        {error ? (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
        ) : null}

        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-white">Adım 1 — Proje Bilgileri</h2>
                <div>
                  <label className="text-xs text-slate-400">Proje Adı *</label>
                  <Input value={project_name} onChange={(e) => setProjectName(e.target.value)} placeholder="Örnek Konutları" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Ruhsat Numarası *</label>
                    <Input value={ruhsat_no} onChange={(e) => setRuhsatNo(e.target.value)} placeholder="2026/1234" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Ada/Parsel *</label>
                    <Input value={ada_parsel} onChange={(e) => setAdaParsel(e.target.value)} placeholder="1234/5" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">İl *</label>
                    <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="İstanbul" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">İlçe *</label>
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kadıköy" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Mahalle</label>
                    <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Moda" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Adres *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[60px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-200 text-white text-sm"
                    placeholder="Cadde, sokak, no"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as NewProjectInput["stage"])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-200 text-white text-sm"
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Açıklama</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[60px] px-3 py-2 rounded-lg bg-slate-950 border border-slate-200 text-white text-sm"
                    placeholder="Proje hakkında kısa bilgi"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-white">Adım 2 — Ruhsat Belgesi</h2>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                  <FileText className="w-8 h-8 text-amber-300" />
                  <p className="text-sm text-amber-100/90">
                    Ruhsat belgesi PDF veya JPEG olarak project-docs bucket&apos;a yüklenir. Admin onayı sonrası lansman ilanları açılır.
                  </p>
                  <label className="flex flex-col gap-2 cursor-pointer">
                    <span className="text-xs text-slate-400">Ruhsat dosyası (PDF / JPEG, max 10 MB)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpeg,.jpg,image/jpeg,application/pdf"
                      className="text-xs text-slate-300 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setRuhsatFile(f);
                        setRuhsatFileName(f?.name ?? "");
                        if (f) setSkipRuhsat(false);
                      }}
                    />
                    {ruhsatFileName ? <span className="text-xs text-emerald-300">Seçildi: {ruhsatFileName}</span> : null}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={skipRuhsat} onChange={(e) => setSkipRuhsat(e.target.checked)} className="accent-amber-500" />
                    Daha sonra ekleyeceğim (admin onayından sonra ilan yayınlayamam, kalemleri hazırlarım)
                  </label>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-white">Adım 3 — Birim Envanteri</h2>
                <p className="text-xs text-slate-400">En az 1 birim ekleyin. Unit no benzersiz olmalı.</p>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pe-2">
                  {units.map((u, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200/80 bg-slate-950/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-300">Birim #{idx + 1}</span>
                        <button type="button" onClick={() => removeUnit(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-4 gap-2">
                        <Input value={u.unit_no} onChange={(e) => updateUnit(idx, { unit_no: e.target.value })} placeholder="A-1" />
                        <Input value={u.block ?? ""} onChange={(e) => updateUnit(idx, { block: e.target.value })} placeholder="Blok" />
                        <Input type="number" value={u.floor ?? ""} onChange={(e) => updateUnit(idx, { floor: e.target.value ? Number(e.target.value) : undefined })} placeholder="Kat" />
                        <select
                          value={u.unit_type ?? ""}
                          onChange={(e) => updateUnit(idx, { unit_type: e.target.value || undefined })}
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-200 text-white text-sm"
                        >
                          <option value="">Tip seç</option>
                          {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2">
                        <Input type="number" value={u.m2_brut ?? ""} onChange={(e) => updateUnit(idx, { m2_brut: e.target.value ? Number(e.target.value) : undefined })} placeholder="m² Brüt" />
                        <Input type="number" value={u.m2_net ?? ""} onChange={(e) => updateUnit(idx, { m2_net: e.target.value ? Number(e.target.value) : undefined })} placeholder="m² Net" />
                        <Input type="number" value={u.price_try ?? ""} onChange={(e) => updateUnit(idx, { price_try: e.target.value ? Number(e.target.value) : undefined })} placeholder="Fiyat ₺" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addUnit} className="gap-2">
                  <Plus className="w-4 h-4" /> Yeni Birim
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-lg font-bold text-white">Adım 4 — Önizleme</h2>
                <div className="rounded-xl border border-slate-200/80 bg-slate-950/40 p-4 space-y-2 text-sm">
                  <p><strong className="text-white">{project_name}</strong></p>
                  <p className="text-slate-400">Ruhsat: {ruhsat_no} · Ada/Parsel: {ada_parsel}</p>
                  <p className="text-slate-400">{province} / {district} {neighborhood ? `/ ${neighborhood}` : ""}</p>
                  <p className="text-slate-500 text-xs">{address}</p>
                  <p className="text-cyan-300 mt-2">{units.length} birim · {STAGES.find((s) => s.value === stage)?.label}</p>
                </div>
                <div className="text-xs text-slate-400">Kayıt sonrası admin ruhsat doğrulaması beklenir. Onay sonrası lansman ilanları yayınlanabilir.</div>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              {step > 1 ? (
                <Button type="button" variant="outline" size="sm" onClick={back} className="gap-2">
                  <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
                </Button>
              ) : <div />}
              {step < 4 ? (
                <Button type="button" size="sm" onClick={next} className="gap-2 bg-blue-600 hover:bg-blue-500">
                  Devam <ArrowRight className="rtl:rotate-180 w-4 h-4" />
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={save} disabled={busy} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                  <CheckCircle2 className="w-4 h-4" /> {busy ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
