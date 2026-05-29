# AI ChatWidget Rewire Envanteri — R12.10 Sonrası

**Tarih:** 2026-05-30 (R12 FINAL refresh)  
**Referans HEAD:** `6331110`  
**Kapsam:** `ChatWidget.tsx` (~610 satır) + `assistantEngine.ts` (~257) + `knowledgeBase.ts` (~140) + `systemQaClient` (salt-okuma)

---

## 1. Mevcut mimari

### `ChatWidget.tsx` (~610 satır)

İki mod (`ChatMode`: `"qa" | "guide"`):

| Mod | UI etiketi | Yanıt kaynağı |
|---|---|---|
| `qa` | Soru–cevap | `invokeSystemQa()` → Supabase Edge **`ai_qa`** (OpenAI) |
| `guide` | Hızlı yönlendirme | `getAIResponse()` → yerel **`AI_RULES`** anahtar kelime dizisi (~200 satır) |

**QA hata fallback:** `buildQaFailureReply()` → yine `getAIResponse()` (guide ile aynı motor).

### R12.10 paketi (tree-shake, ChatWidget tüketmiyor)

| Dosya | Export | ChatWidget import? |
|---|---|---|
| `src/lib/ai/assistantEngine.ts` | `buildAssistantReply()`, `CHAT_GUIDE_CHIPS` | ❌ **Hayır** |
| `src/lib/ai/knowledgeBase.ts` | `KNOWLEDGE_TOPICS`, uyarı metinleri | ❌ (engine üzerinden) |
| `src/lib/systemQaClient.ts` | `invokeSystemQa()` | ✅ QA modunda |

**Sonuç:** R12.10 engine **canlı repoda var ama ChatWidget hâlâ eski inline `AI_RULES` kullanıyor** — bilinçli rewire bekleniyor.

---

## 2. `assistantEngine` API yüzeyi

```ts
buildAssistantReply(input: string): AssistantReply
// AssistantReply = { text: string; actions: AssistantAction[] }
// AssistantAction = { label: string; to: string }
```

Özellikler:

- TR normalize + intent routing (teklif, komisyon, Kadıköy, satış, güvenlik…)
- `KNOWLEDGE_TOPICS` eşlemesi (borsa, order book, imar/emsal, site haritası)
- `fees.ts` (`COMMISSION_RATE`, `BID_BOND_RATE`) + borsa demo varlıkları
- Her yanıtta: `DEMO_WARNING`, opsiyonel `EXPERT_WARNING`, `LIVE_AI_NOTE`
- Aksiyon chip'leri: `/borsa`, `/komisyon-hesaplayici`, `/ilanlar` vb.

Test kapsamı: `assistantEngine.test.ts` (9 senaryo).

---

## 3. Hibrit yaklaşım taslağı

```
Kullanıcı mesajı
    │
    ├─ guide mod ──────────────────► buildAssistantReply()  [client-engine]
    │
    └─ qa mod
           ├─ invokeSystemQa OK ───► Edge ai_qa (OpenAI)     [server-chat]
           └─ invokeSystemQa FAIL ─► buildAssistantReply()   [client fallback]
                                    (getAIResponse yerine)
```

**Ne zaman server (`ai_qa`):**

- Paragraflı, bağlamlı, serbest form sorular
- Thread geçmişi gerektiren diyalog
- Üretimde `OPENAI_API_KEY` + Edge deploy varsa

**Ne zaman client (`buildAssistantReply`):**

- Komisyon / teklif / rota gibi **bilgi bankası** soruları
- Edge down / env eksik / rate limit
- Guide modu (bilinçli olarak LLM'siz, deterministik UX)

**Karma örnek:**

| Soru | Önerilen yol |
|---|---|
| "ihaleal komisyon kaç" | client → `buildAssistantReply` (fees + KNOWLEDGE_TOPICS) |
| "Şu ilanı analiz et" / listing ID | server → `ai_qa` (+ ileride listing context inject) |
| "teklif verme kuralları" | client (deterministik, hukuki disclaimer sabit) |
| Edge fail + "KYC nedir" | client fallback |

---

## 4. Minimum rewire değişim listesi (tahmini)

| Dosya | Değişiklik | Satır (~) |
|---|---|---:|
| `ChatWidget.tsx` | `import { buildAssistantReply } from "@/lib/ai/assistantEngine"` | +1 |
| `ChatWidget.tsx` | Guide mod: `getAIResponse` → `buildAssistantReply().text` + action chips render | ~25–40 |
| `ChatWidget.tsx` | `buildQaFailureReply`: fallback body → `buildAssistantReply` | ~10–15 |
| `ChatWidget.tsx` | (Opsiyonel) QA başarılı yanıtta da action chips | ~15 |
| `ChatWidget.tsx` | `AI_RULES` / `getAIResponse` silinebilir veya thin-wrapper | −150~200 |
| `assistantEngine.ts` | Değişiklik gerekmez (additive) | 0 |

**Net:** ~**40–70 satır** anlamlı diff; büyük silme ile **−100 satır** net mümkün.

**UI ek iş:** `AssistantReply.actions` için mevcut quick-link chip pattern'i reuse (~20 satır).

---

## 5. Test senaryoları

| # | Girdi | Beklenen |
|---|---|---|
| T1 | Guide: "komisyon ne kadar" | `buildAssistantReply` → komisyon metni + `/komisyon-hesaplayici` action |
| T2 | Guide: "nasıl teklif veririm" | Adım adım teklif + `/ihaleler` action |
| T3 | QA + Edge OK: serbest soru | `invokeSystemQa` yanıtı (mock Edge test) |
| T4 | QA + Edge FAIL: "komisyon ne kadar" | Fallback → engine (T1 ile aynı içerik standardı) |
| T5 | QA: supabase_not_configured | Türkçe durum mesajı + engine fallback |
| T6 | Bilinmeyen soru | Engine "eşleştiremedim" + default actions |
| T7 | "KADIKÖY-D varlığına teklif" | Dynamic bid target → `/borsa/varlik/...` |
| T8 | Regression: integrity bypass keywords | Dolandırıcılık yönlendirme (mevcut `AI_RULES` parity — engine'de `guvenli mi` intent) |

---

## 6. Master UX karar matrisi

| Seçenek | Artı | Eksi | Öneri |
|---|---|---|---|
| **Sadece client-engine** | Deterministik, Edge maliyeti yok, offline-demo | Serbest LLM yok | Staging / demo |
| **Sadece server-chat** | Zengin NLU | Edge bağımlılığı, maliyet, fallback zayıf | Erken prod riskli |
| **Hibrit (önerilen)** | QA mod LLM + guide/fallback deterministik | İki kod yolu test gerekir | **Ürün kararı için default** |

**Bağımlılıklar (server path):**

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `supabase functions deploy ai_qa`
- Dashboard: `OPENAI_API_KEY`

---

## 7. Risk

| Risk | Not |
|---|---|
| `AI_RULES` vs engine parity | Bazı guide-only kurallar (localhost/Wi-Fi, bidding rules) engine'de yok — migrate listesi çıkar |
| Action chips UI | Engine actions render edilmezse R12.10 değeri yarım kalır |
| Duplicate maintenance | Rewire sonrası `AI_RULES` silinmeli (dead code) |

**Sıradaki adım:** Master hibrit onayı → tek PR: ChatWidget rewire + `AI_RULES` temizlik + smoke.
