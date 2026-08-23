# Call Center / Sesli Temsilci Notu

**Tarih:** 2026-05-30 · **Kapsam:** N24 MVP (metin) vs sesli (uzun vade)

## N24 MVP (uygulandı)

| Bileşen | Dosya |
|---------|-------|
| Site geneli chat widget | `src/components/ChatWidget.tsx` |
| AI soru–cevap | `invokeSystemQa` → `ai_qa` edge (`src/lib/systemQaClient.ts`) |
| Senaryo kısayolları | `ChatWidget.tsx` — ilan, ihale, kredi, randevu |
| Temsilci devir | `/mesajlar` yönlendirme (`chat_messages` mevcut) |
| Input sanitizasyon | `sanitizeChatInput` — XSS tag strip |

**Billing:** `ai_qa` OpenAI kotası canlıda bekliyor; widget hazır, billing gelince çalışır.

## Sesli call center için gerekenler (Master kararı)

| Katman | Seçenek | Tahmini maliyet |
|--------|---------|-----------------|
| Telefon | Twilio Voice / Netgsm | Dakika başı + numara |
| STT | Whisper / Google STT | Dakika başı |
| TTS | ElevenLabs / Azure Neural | Karakter/dakika |
| Kuyruk | Supabase Realtime + agent panel | Geliştirme ~40–60 saat |
| KVKK | Çağrı kaydı rızası, saklama süresi | Hukuk |

**Öneri:** Metin MVP retention ölçülsün; sesli faz 2 (Twilio POC ~2 hafta).
