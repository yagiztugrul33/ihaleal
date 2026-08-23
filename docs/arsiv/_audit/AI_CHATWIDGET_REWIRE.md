# AI ChatWidget Rewire Envanteri — R12.10 + Edge 404 (FINAL)

**Tarih:** 2026-05-29 ~15:30  
**Referans HEAD:** `665dd2c`  
**Kapsam:** `ChatWidget.tsx` (~610 satır) + `assistantEngine.ts` + `knowledgeBase.ts` + `systemQaClient` + prod Edge durumu

---

## 1. Mevcut mimari

### `ChatWidget.tsx` — iki mod

| Mod | UI | Yanıt kaynağı |
|---|---|---|
| `guide` | Hızlı yönlendirme | `getAIResponse()` → inline **`AI_RULES`** (~200 satır) |
| `qa` | Soru–cevap | `invokeSystemQa()` → Edge **`ai_qa`** |

**Mount davranışı:** ChatWidget load'da **network ping atmaz**. Kullanıcı QA modunda mesaj gönderince `ai_qa` POST edilir.

**QA hata fallback:** `buildQaFailureReply()` → yine `getAIResponse()` (guide ile aynı eski motor).

### R12.10 (tree-shake — ChatWidget tüketmiyor)

| Dosya | Export | ChatWidget import? |
|---|---|---|
| `assistantEngine.ts` | `buildAssistantReply()` | ❌ |
| `knowledgeBase.ts` | `KNOWLEDGE_TOPICS` | ❌ (engine üzerinden) |
| `systemQaClient.ts` | `invokeSystemQa()` | ✅ QA modunda |

---

## 2. Production Edge durumu (2026-05-29)

| Function | Prod POST | ChatWidget etkisi |
|---|---|---|
| **`ai_qa`** | **404** NOT_FOUND | QA mesaj → 404 → fallback (UI çökmez) |
| **`post_chat_message`** | **404** | `/mesajlar` Edge yolu kırık |

Detay tablo: [`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md)

**Master "400–500 çok" algısı:** QA modunda mesaj gönderince Network'te kırmızı **404** — beklenen gürültü, site genel 500 değil.

---

## 3. Hibrit yaklaşım (önerilen — C)

```
Kullanıcı mesajı
    │
    ├─ guide mod ──────────────────────────────► buildAssistantReply()     [client, 0 network]
    │
    └─ qa mod
           ├─ basit intent (komisyon/kapora/rota) ► buildAssistantReply()   [client önce]
           ├─ invokeSystemQa OK ───────────────► Edge ai_qa (OpenAI)       [server]
           └─ invokeSystemQa FAIL (404/500) ───► buildAssistantReply()   [client fallback]
```

### Ne zaman client (`buildAssistantReply` + `knowledgeBase`)

- "komisyon kaç", "kapora ne", "teklif kuralları", "site haritası", rota soruları
- Edge **404** / env eksik / rate limit
- **Guide modu** bilinçli deterministik UX
- **Avantaj:** 0 network, fees.ts uyumlu, offline-demo

### Ne zaman server (`ai_qa`)

- Serbest form, paragraflı, bağlamlı sorular
- "Şu ilanı analiz et", listing ID + lokasyon yorumu
- **Ön koşul:** `supabase functions deploy ai_qa` + `OPENAI_API_KEY`

---

## 4. Kod örneği — minimum rewire (~40–70 satır)

### Import

```ts
import { buildAssistantReply } from "@/lib/ai/assistantEngine";
import { invokeSystemQa, type SystemQaTurn } from "@/lib/systemQaClient";
```

### Guide mod — eski `getAIResponse` yerine

```ts
function replyFromEngine(userMsg: string) {
  const { text, actions } = buildAssistantReply(userMsg);
  setMessages((prev) => [...prev, { role: "ai", text }]);
  // actions → mevcut chip UI'ya map (label, to)
}
```

### QA mod — hibrit sıra

```ts
async function handleQaSend(userMsg: string, thread: SystemQaTurn[]) {
  setTyping(true);

  // 1) Basit sorular — client first (404'ten kaçın)
  const quick = buildAssistantReply(userMsg);
  if (quick.actions.length > 0 && !needsLlm(userMsg)) {
    setTyping(false);
    setMessages((prev) => [...prev, { role: "ai", text: quick.text }]);
    return;
  }

  // 2) Edge dene
  const res = await invokeSystemQa(thread);
  setTyping(false);

  if (res.ok) {
    setMessages((prev) => [...prev, { role: "ai", text: res.text }]);
    return;
  }

  // 3) Fallback — engine (404/500 gürültüsü kullanıcıya yansımaz)
  const fallback = buildAssistantReply(userMsg);
  setMessages((prev) => [...prev, { role: "ai", text: fallback.text }]);
}
```

`needsLlm()` — kısa heuristic: listing UUID, "analiz et", "yorumla", 120+ karakter → server; aksi client.

---

## 5. Master karar matrisi

| Seçenek | Artı | Eksi | Efor | Risk |
|---|---|---|---|---|
| **A — ai_qa deploy** | Tam LLM QA | OPENAI maliyet; 404 gider ama secret yoksa 500 | ~30 dk ops | Orta |
| **B — Sadece client rewire** | 404 yok; deterministik | Serbest LLM yok | ~1 saat kod | Düşük |
| **C — Hibrit (önerilen)** | Basit soru 0 network; karmaşık LLM; 404 sessiz fallback | İki yol test | ~1–1.5 saat | Düşük |

**Öneri:** **C** — önce ChatWidget rewire (B kısmı), paralel veya sonra **A** selektif deploy.

---

## 6. Test senaryoları

| # | Girdi | Beklenen |
|---|---|---|
| T1 | Guide: "komisyon ne kadar" | Engine + `/komisyon-hesaplayici` action |
| T2 | QA + Edge 404: "komisyon ne kadar" | Client engine (404 kullanıcıya görünmez) |
| T3 | QA + Edge OK: serbest analiz sorusu | `ai_qa` yanıtı |
| T4 | QA: Edge 404 + "KADIKÖY-D teklif" | Engine dynamic bid route |
| T5 | Mount sayfa load | **0** `ai_qa` request (Network sessiz) |

---

## 7. Değişim listesi (tek PR)

| Dosya | Değişiklik |
|---|---|
| `ChatWidget.tsx` | Engine import; guide/QA/fallback rewire; `AI_RULES` thin veya sil |
| `assistantEngine.ts` | Değişiklik gerekmez |
| `systemQaClient.ts` | Değişiklik gerekmez |

**Net:** ~40–70 satır anlamlı diff; `AI_RULES` silinirse −150 satır.

---

## 8. Risk

| Risk | Azaltma |
|---|---|
| `AI_RULES` vs engine parity | Rewire öncesi keyword diff listesi |
| Edge deploy sonrası maliyet | Hibrit: basit sorular client-first |
| Action chips render edilmezse | R12.10 değeri yarım — UI task dahil |

**Sıradaki adım:** Master **C** onayı → TS sprint sonrası tek PR; opsiyonel `ai_qa` deploy aynı hafta.

---

**Son güncelleme:** 2026-05-29 — Cursor FINAL audit (Edge 404 entegre + hibrit kod örneği)
