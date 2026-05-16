import { useState } from "react";
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
      <div className="mx-auto max-w-md p-12 text-center">
        <div className="text-5xl">✓</div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">Talebiniz alındı</h2>
        <p className="mt-3 text-slate-600">24 saat i뿯½inde ekibimiz sizinle iletişime ge뿯½ecek.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Kurumsal G뿯½r뿯½şme Talebi</h1>
      <p className="mt-3 text-slate-600">Re/Max, GYO veya b뿯½y뿯½k emlak grubu i뿯½in 뿯½zel demo planlayalım.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ad Soyad" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Şirket" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
          <Field label="Pozisyon" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          <Field label="E-posta" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <label className="text-sm font-medium text-slate-700">Ekip b뿯½y뿯½kl뿯½ğ뿯½</label>
            <select
              value={form.org_size}
              onChange={(e) => setForm({ ...form, org_size: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Se뿯½in</option>
              <option value="1-5">1-5</option>
              <option value="5-15">5-15</option>
              <option value="15-50">15-50</option>
              <option value="50+">50+</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Mesaj</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button type="submit" disabled={status === "sending"} className="w-full rounded-lg bg-slate-900 py-3 text-white disabled:opacity-50">
          {status === "sending" ? "G뿯½nderiliyor…" : "Talep G뿯½nder"}
        </button>
        {status === "error" && <p className="text-sm text-red-600">Hata oluştu. L뿯½tfen tekrar deneyin.</p>}
      </form>
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
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </div>
  );
}
