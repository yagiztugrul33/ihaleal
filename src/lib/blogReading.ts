import type { MegaBlogCategory, MegaBlogPost } from "@/types/megaContent";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Yaklaşık okuma süresi (Türkçe, ~200 kelime/dk). */
export function estimateReadingMinutes(post: MegaBlogPost): number {
  const body = [post.title, post.excerpt, ...post.paragraphs].join(" ");
  const w = wordCount(body);
  return Math.max(1, Math.round(w / 200));
}

export const MEGA_BLOG_CATEGORY_LABELS: Record<MegaBlogCategory, string> = {
  ihale: "İhale",
  komisyon: "Komisyon",
  ortaklik: "Ortaklık",
  "hesap-guvenlik": "Hesap ve güvenlik",
  teknik: "Teknik",
  politika: "Politika",
  hukuk: "Hukuk",
};
