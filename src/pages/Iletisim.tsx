import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Clock, Linkedin, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  konu: z.string().min(3, "Konu en az 3 karakter olmalı"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı"),
});

const SOSYAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/ihaleal", icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com/@ihaleal", icon: Youtube },
] as const;

export default function Iletisim() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", konu: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const toastSuccess = (message: string) => {
    window.dispatchEvent(new CustomEvent("ihaleal:add-toast", { detail: { message, type: "success" } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = schema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fe[err.path[0] as string] = err.message;
      });
      setErrors(fe);
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", phone: "", konu: "", message: "" });
      toastSuccess("Mesajınız alındı. En kısa sürede size dönüş yapacağız.");
    }, 900);
  };

  return (
    <PageShell
      badge="İletişim"
      title="Bize ulaşın"
      subtitle="Kurumsal ortaklık, ürün demo veya teknik destek için formu doldurun. Ofis bilgilerimiz ve harita alanı aşağıdadır."
      cta={{ label: "SSS sayfası", to: "/sss" }}
    >
      <div className="py-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          {[
            {
              icon: Phone,
              label: "Telefon",
              value: "+90 212 123 45 67",
              href: "tel:+902121234567",
            },
            {
              icon: Mail,
              label: "E-posta",
              value: "info@ihaleal.com",
              href: "mailto:info@ihaleal.com",
            },
            {
              icon: Building2,
              label: "Kurumsal satış",
              value: "sales@ihaleal.com",
              href: "mailto:sales@ihaleal.com",
            },
            {
              icon: MapPin,
              label: "Ofis",
              value: "Maslak Mah. Büyükdere Cad. No: 255, Sarıyer / İstanbul",
              href: "https://maps.google.com/?q=Maslak+Buyukdere+Istanbul",
            },
            {
              icon: Clock,
              label: "Çalışma saatleri",
              value: "Pazartesi — Cuma: 09:00 — 18:00 (GMT+3)",
              href: null,
            },
          ].map((row) => {
            const Icon = row.icon;
            const inner = (
              <div className="flex items-start gap-4">
                <div
                  className="p-2.5 rounded-lg shrink-0"
                  style={{ background: "var(--color-bg-soft)", color: "var(--color-primary)" }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
                    {row.label}
                  </div>
                  <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {row.value}
                  </div>
                </div>
              </div>
            );
            return row.href ? (
              <a key={row.label} href={row.href} className="card-warm block hover:-translate-y-0.5 transition-transform">
                {inner}
              </a>
            ) : (
              <div key={row.label} className="card-warm">
                {inner}
              </div>
            );
          })}

          <div className="card-warm">
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
              Sosyal hesaplar
            </p>
            <div className="flex flex-wrap gap-3">
              {SOSYAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium underline-offset-2 hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl border overflow-hidden min-h-[220px] flex items-center justify-center"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-soft)" }}
            role="img"
            aria-label="Harita yer tutucu: Maslak ofis konumu yakında etkileşimli harita ile gösterilecek"
          >
            <div className="text-center px-6 py-10">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-60" style={{ color: "var(--color-primary)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Harita entegrasyonu
              </p>
              <p className="text-xs mt-2 max-w-xs mx-auto" style={{ color: "var(--color-text-muted)" }}>
                Üretim sürümünde Google Maps veya doğrulanmış koordinatlar gösterilecek. Şimdilik örnek adres metnine güvenin.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-warm p-6 lg:p-8 space-y-5 h-fit">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            Mesaj gönderin
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
                Ad soyad
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`bg-[var(--color-bg-card)] border ${errors.name ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)]`}
                placeholder="Ali Veli"
              />
              {errors.name ? <p className="text-xs text-red-400 mt-1">{errors.name}</p> : null}
            </div>
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
                E-posta
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`bg-[var(--color-bg-card)] border ${errors.email ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)]`}
                placeholder="ali@ornek.com"
              />
              {errors.email ? <p className="text-xs text-red-400 mt-1">{errors.email}</p> : null}
            </div>
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              Telefon
            </label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`bg-[var(--color-bg-card)] border ${errors.phone ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)]`}
              placeholder="+90 555 123 45 67"
            />
            {errors.phone ? <p className="text-xs text-red-400 mt-1">{errors.phone}</p> : null}
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              Konu
            </label>
            <Input
              value={form.konu}
              onChange={(e) => setForm({ ...form, konu: e.target.value })}
              className={`bg-[var(--color-bg-card)] border ${errors.konu ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)]`}
              placeholder="Kurumsal demo / Destek / Ortaklık"
            />
            {errors.konu ? <p className="text-xs text-red-400 mt-1">{errors.konu}</p> : null}
          </div>
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
              Mesajınız
            </label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`bg-[var(--color-bg-card)] border ${errors.message ? "border-red-500/50" : "border-slate-200"} text-[var(--color-text)] min-h-[140px]`}
              placeholder="Kısaca ihtiyacınızı yazın; mümkünse il ve ilçe bilgisi ekleyin."
            />
            {errors.message ? <p className="text-xs text-red-400 mt-1">{errors.message}</p> : null}
          </div>
          <Button type="submit" disabled={sending} className="w-full btn-primary h-11 gap-2 disabled:opacity-60 !flex !justify-center">
            <Send className="w-4 h-4" />
            {sending ? "Gönderiliyor..." : "Gönder"}
          </Button>
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            Gönderdiğinizde bildirim çubuğunda onay görürsünüz. Kişisel verileriniz{" "}
            <Link to="/gizlilik" className="underline underline-offset-2" style={{ color: "var(--color-primary)" }}>
              aydınlatma metni
            </Link>{" "}
            kapsamında işlenir.
          </p>
        </form>
      </div>
    </PageShell>
  );
}
