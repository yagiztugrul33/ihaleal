import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı"),
});

export function Contact() {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus("idle");
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((err) => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
      setErrors(fe);
      return;
    }
    setStatus("sending");
    if (!isSupabaseConfigured()) {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
      return;
    }
    const { error } = await supabase.from("corporate_leads").insert({
      name: form.name,
      company: "Bireysel",
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-heading mb-4">Bize Ulaşın</h2>
          <p className="section-subtitle mx-auto">Sorularınız mı var? Ekibimiz size yardımcı olmaktan mutluluk duyar.</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: <Phone className="w-5 h-5 text-blue-400" />, label: "Telefon", value: "+90 212 123 45 67" },
              { icon: <Mail className="w-5 h-5 text-blue-400" />, label: "E-posta", value: "info@ihaleal.com" },
              { icon: <MapPin className="w-5 h-5 text-blue-400" />, label: "Adres", value: "İstanbul, Türkiye" },
              { icon: <Clock className="w-5 h-5 text-blue-400" />, label: "Çalışma Saatleri", value: "Pzt - Cmt: 09:00 - 18:00" },
            ].map((item, idx) => (
              <div key={idx} className={`card-warm flex items-start gap-4 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="p-2.5 rounded-lg shrink-0" style={{ background: "var(--color-bg-soft)" }}>{item.icon}</div>
                <div><div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>{item.label}</div><div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{item.value}</div></div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className={`lg:col-span-3 card-warm p-6 lg:p-8 space-y-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
            {status === "success" && <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-fade-in"><CheckCircle2 className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">Mesajınız başarıyla gönderildi!</span></div>}
            {status === "error" && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-fade-in"><AlertCircle className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">Bir hata oluştu.</span></div>}
            <div className="grid sm:grid-cols-2 gap-5">
              <div><label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Ad Soyad</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`bg-[var(--color-bg-card)] border ${errors.name ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)] focus:ring-[var(--color-primary)]/30`} placeholder="Ali Veli" />{errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}</div>
              <div><label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>E-posta</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`bg-[var(--color-bg-card)] border ${errors.email ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)] focus:ring-[var(--color-primary)]/30`} placeholder="ali@ornek.com" />{errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}</div>
            </div>
            <div><label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Telefon</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`bg-[var(--color-bg-card)] border ${errors.phone ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)] focus:ring-[var(--color-primary)]/30`} placeholder="+90 555 123 45 67" />{errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}</div>
            <div><label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Mesajınız</label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`bg-[var(--color-bg-card)] border ${errors.message ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)] focus:ring-[var(--color-primary)]/30 min-h-[120px]`} placeholder="Mesajınızı buraya yazın..." />{errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}</div>
            <Button type="submit" disabled={status === "sending"} className="w-full btn-primary h-11 gap-2 disabled:opacity-60 !flex !justify-center"><Send className="w-4 h-4" />{status === "sending" ? "Gönderiliyor..." : "Gönder"}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
