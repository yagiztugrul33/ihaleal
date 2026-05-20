export type DemoNotification = {
  id: string;
  title: string;
  body: string;
  type: "bid" | "ending" | "price_drop" | "kyc" | "payment" | "message" | "won";
  read: boolean;
  createdAt: string;
};

/** Navbar bildirim demosu — gerçek zamanlı değildir. */
export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "n1",
    title: "Yeni teklif",
    body: "İstanbul Kadıköy konut ilanında üstünüze daha yüksek bir teklif gösterildi (demo).",
    type: "bid",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "İhale bitiyor",
    body: "Takip ettiğiniz ihale 24 saat içinde kapanıyor; son teklifinizi güncelleyin.",
    type: "ending",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "n3",
    title: "Fiyat güncellemesi",
    body: "Favori listenizdeki bir ilanda güncel teklif değişti.",
    type: "price_drop",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "n4",
    title: "KYC doğrulama",
    body: "Kimlik doğrulama evraklarınız incelemede (demo süreç).",
    type: "kyc",
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "n5",
    title: "Teklifiniz geçildi",
    body: "Kadıköy sahil hattı ilanında yeni en yüksek teklif oluştu.",
    type: "bid",
    read: false,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "n6",
    title: "Kazandınız",
    body: "Beşiktaş ofis ihalesinde en yüksek teklif sizde kaldı. Evrak adımına geçebilirsiniz.",
    type: "won",
    read: false,
    createdAt: new Date(Date.now() - 5400000).toISOString(),
  },
];
