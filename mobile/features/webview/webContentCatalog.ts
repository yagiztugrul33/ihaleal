export type WebContentCategory = "Hukuki" | "Rehber/Bilgi" | "İçerik";

export type WebContentItem = {
  slug: string;
  title: string;
  path: string;
  category: WebContentCategory;
};

export const WEB_CONTENT_ITEMS: WebContentItem[] = [
  // Hukuki
  { slug: "kvkk", title: "KVKK", path: "/kvkk", category: "Hukuki" },
  { slug: "gizlilik", title: "Gizlilik", path: "/gizlilik", category: "Hukuki" },
  { slug: "cerez-politikasi", title: "Çerez Politikası", path: "/cerez-politikasi", category: "Hukuki" },
  { slug: "kullanim-kosullari", title: "Kullanım Koşulları", path: "/kullanim-kosullari", category: "Hukuki" },
  {
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    path: "/mesafeli-satis-sozlesmesi",
    category: "Hukuki",
  },
  { slug: "iade-iptal", title: "İade / İptal", path: "/iade-iptal", category: "Hukuki" },
  { slug: "aydinlatma-metni", title: "Aydınlatma Metni", path: "/aydinlatma-metni", category: "Hukuki" },
  { slug: "ihale-kosullari", title: "İhale Koşulları", path: "/ihale-kosullari", category: "Hukuki" },
  { slug: "yasal-sozlesmeler", title: "Yasal Sözleşmeler", path: "/yasal/sozlesmeler", category: "Hukuki" },
  { slug: "yasal-guvenlik", title: "Yasal Güvenlik", path: "/yasal/guvenlik", category: "Hukuki" },
  {
    slug: "yasal-agency-contract",
    title: "Agency Contract",
    path: "/yasal/agency-contract",
    category: "Hukuki",
  },
  {
    slug: "yasal-dolandiricilik-savunmasi",
    title: "Dolandırıcılık Savunması",
    path: "/yasal/dolandiricilik-savunmasi",
    category: "Hukuki",
  },
  {
    slug: "yasal-supabase-uyum",
    title: "Supabase Uyum",
    path: "/yasal/supabase-uyum",
    category: "Hukuki",
  },

  // Rehber / Bilgi
  { slug: "rehber", title: "Rehber", path: "/rehber", category: "Rehber/Bilgi" },
  { slug: "nasil-calisir", title: "Nasıl Çalışır", path: "/nasil-calisir", category: "Rehber/Bilgi" },
  { slug: "sss", title: "Sık Sorulan Sorular", path: "/sss", category: "Rehber/Bilgi" },
  { slug: "ekspertiz", title: "Ekspertiz", path: "/ekspertiz", category: "Rehber/Bilgi" },
  { slug: "evraklar", title: "Evraklar", path: "/evraklar", category: "Rehber/Bilgi" },
  { slug: "guvenlik", title: "Güvenlik", path: "/guvenlik", category: "Rehber/Bilgi" },
  { slug: "fiyatlandirma", title: "Fiyatlandırma", path: "/fiyatlandirma", category: "Rehber/Bilgi" },
  { slug: "hizmet-bedelleri", title: "Hizmet Bedelleri", path: "/hizmet-bedelleri", category: "Rehber/Bilgi" },

  // İçerik
  { slug: "blog", title: "Blog", path: "/blog", category: "İçerik" },
  { slug: "hakkimizda", title: "Hakkımızda", path: "/hakkimizda", category: "İçerik" },
  { slug: "iletisim", title: "İletişim", path: "/iletisim", category: "İçerik" },
  { slug: "destek", title: "Destek", path: "/destek", category: "İçerik" },
];

export function findWebContentBySlug(slug: string): WebContentItem | null {
  return WEB_CONTENT_ITEMS.find((item) => item.slug === slug) ?? null;
}
