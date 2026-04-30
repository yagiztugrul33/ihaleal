import type { KycSimulationStep } from "@/types/megaContent";

export const KYC_SIMULATION_STEPS: KycSimulationStep[] = [
  {
    id: "account",
    title: "Hesap ve iletişim",
    description: "Geçerli e-posta ve telefon; OTP ile doğrulama (simülasyon).",
  },
  {
    id: "phone_otp",
    title: "SMS kodu",
    description: "Tek kullanımlık kod girişi (demo: herhangi bir 6 haneli kod).",
  },
  {
    id: "identity_match",
    title: "Kimlik eşlemesi",
    description: "Kimlik bilgilerinin sistem kaydıyla uyumu (demo onayı).",
  },
  {
    id: "risk_review",
    title: "Risk kontrolü",
    description: "Basit otomatik kontrol listesi; bazı hesaplarda manuel inceleme sürebilir.",
  },
];
