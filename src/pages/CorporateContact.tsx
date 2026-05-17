import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function CorporateContact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
    phone: "",
    org_size: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    if (!isSupabaseConfigured()) {
      setStatus("sent");
      return;
    }
    const { error } = await supabase.from("corporate_leads").insert(form);
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="kurumsal-page flex min-h-screen items-center justify-center px-4 py-16">
        <div className="card-luxury max-w-md p-10 text-center">
          <div className="text-5xl text-emerald-400" aria-hidden>✓</div>
          <h2 className="mt-4 text-2xl font-bold text-white">Başvurunuz alındı</h2>
          <p className="mt-3 leading-relaxed text-slate-400">
            Ekibimiz 1 iş günü içinde sizinle iletişime geçecek. Genellikle aynı gün dönüş yapıyoruz.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-block">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="kurumsal-page min-h-screen px-4 py-16 pt-28">
      <div className="mx-auto max-w-2xl">
        <p className="badge-corp mb-4">Kurumsal İletişim</p>
        <h1 className="section-heading text-3xl">Demo talebi oluşturun</h1>
        <p className="section-subtitle mt-3">
          Emlak ofisi, GYO veya müteahhit yöneticisiyseniz, ekibimiz size özel bir demo hazırlasın.
          Formu doldurun; 1 iş günü içinde dönüş yapalım.
        </p>

        <form onSubmit={submit} className="card-luxury mt-8 space-y-4 p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ad Soyad" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Şirket" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
            <Field label="Pozisyon" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            <Field label="E-posta" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ekip büyüklüğü
              </label>
              <select
                value={form.org_size}
                onChange={(e) => setForm({ ...form, org_size: e.target.value })}
                className="corp-input"
              >
                <option value="">Seçin</option>
                <option value="1-5">1-5 kişi</option>
                <option value="5-15">5-15 kişi</option>
                <option value="15-50">15-50 kişi</option>
                <option value="50+">50+ kişi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Mesaj</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="Hangi özelliklerle ilgileniyorsunuz?"
              className="corp-input resize-y"
            />
          </div>
          <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
            {status === "sending" ? "Gönderiliyor…" : "Demo talebimi gönder"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-400">Hata oluştu. Lütfen tekrar deneyin veya kurumsal@ihaleal.com adresine yazın.</p>
          )}
          <p className="text-center text-xs leading-relaxed text-slate-500">
            Bilgileriniz KVKK kapsamında saklanır; yalnızca demo amacıyla kullanılır, üçüncü taraflarla paylaşılmaz.
          </p>
        </form>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="trust-badge-card">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">E-posta</p>
              <p className="mt-1 text-sm text-slate-200">kurumsal@ihaleal.com</p>
            </div>
          </div>
          <div className="trust-badge-card">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Telefon</p>
              <p className="mt-1 text-sm text-slate-200">+90 (212) 000 00 00</p>
            </div>
          </div>
          <div className="trust-badge-card">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Yanıt süresi</p>
              <p className="mt-1 text-sm font-medium text-emerald-400">Ortalama 4 saat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="corp-input"
      />
    </div>
  );
}