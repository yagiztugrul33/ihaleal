# ihaleal — Akşam Oturumu Planı (2026-05-27)

**Hazırlık modu:** SALT-OKUMA tamamlandı. Production'a/git'e yazma YOK; bu plan dosyası lokal commit edilecek, push YOK.
**Bağlam:** `_audit/OTURUM_DURUMU.md` ile tamamlayıcı — orada "ne yapıldı", burada "akşam ne yapılacak".

---

## ⚠️ MİMARİ KARAR — 2026-05-28 (Adım 1 C sonrası eklendi)

**Sorun:** Adım 1 C (mobile/shared/depositRegister.ts re-export bridge) denemesinde keşfedildi: web `src/lib/depositRegister.ts` içinde `import { supabase } from "@/lib/supabase"` var. Web `supabase` client browser-tabanlı (window/document); mobile'da fail eder. Mobile'da `mobile/src/app/(auth)/authClient.ts`'in `getSupabaseClient()` (SecureStore adapter) farklı bir client.

**Karar:** **Mobile facade'lar Adım 4'te mobile-specific yazılacak** — re-export DEĞİL.
- **Tipler** (DepositContext, RegisterBidDepositResult vb.): `export type { ... } from "@/lib/depositRegister"` ile re-export. Tek doğruluk kaynağı.
- **Runtime fonksiyonu** (registerBidDeposit, executeBuyNow, placeBidRpc): mobile'da kendi implementasyonu — `getSupabaseClient()` (mobile authClient) ile RPC çağrısı. Web facade'ın iş mantığı (KYC ön-check, hata code eşleştirme) mobile'a taşınır ama supabase client mobile'ın.

**Etki:**
- Adım 1 C iptal (mobile bridge bu şekilde mümkün değil)
- Adım 2 (bidActions gerçek RPC) **revize edilmeli**: bidActions zaten mobile-side facade, `placeBidRpc`'i değil mobile-equivalent'ini çağıracak
- Pure logic re-export'ları (borsa/valuation/calculators/locationIntelligence) sorun değil — bunlar supabase'siz
- mobile bidActions, depositRegister, buyNow için **3 paralel mobile facade** yazılır Adım 4'te

**Kanıt:**
- Mobile branch (`feat/mobile-calculators`) merge commit `c36f540` ile main ile sync edildi (15 commit + merge)
- `src/lib/depositRegister.ts`, `buyNow.ts`, `placeBid.ts` artık mobile worktree'de mevcut
- Bridge denemesinde tsc fail: `Cannot find module '@/lib/supabase'` → kanıt re-export semantically uygun değil
- Restore + temizlik yapıldı; merge commit korundu

---

## 📋 ADIM 2 — REVİZE PLAN (Adım 2.0 keşif sonucu, 2026-05-28)

### A) Web placeBid/bidActions durumu (kanıt)

| Bulgu | Sonuç |
|---|---|
| `src/lib/bidActions.ts` var mı? | **YOK** — web tarafında bidActions.ts yok |
| Web placeBidRpc tüketici | Tek nokta: `src/pages/AuctionDetail.tsx:62,465` (handleBid) |
| `placeBidRpc` türü | Zaten **discriminated union** facade: `PlaceBidResult = ok+status:ok / ok+status:duplicate / not-ok+message+code?` |
| handleBid pattern | `if (!res.ok)` + `res.status === "duplicate"` — temiz discriminated union tüketim ✓ |
| Web refactor gerek | **YOK** — defterdeki "bdaa42e partial" depositRegister ile zaten kapandı |

### B) Mobile authClient pattern (kanıt — Cursor zaten kurmuş)

**SupabaseClientLike tipi** (`mobile/src/app/(auth)/authClient.ts:11`) yine `.rpc()` exposed değil **ama Cursor cast pattern'i pushNotifications.ts'te kuruldu:**

```typescript
// mobile/features/notifications/pushNotifications.ts:11-13, 47, 50
type RpcClientLike = {
  rpc: (fn: string, params?: Record<string, unknown>) =>
    Promise<{ error: { message?: string } | null }>;
};

const client = (await getSupabaseClient()) as unknown as RpcClientLike;
const { error } = await client.rpc('register_push_token', { p_token, ... });
```

**Pattern hazır** — bidActions/depositRegister/buyNow için aynı kullanılır. Tek genişleme: `data` da döndürmesi gerek (push token sadece error, biz discriminated union dönüşü için data lazım):

```typescript
type RpcClientLike = {
  rpc: <T = unknown>(fn: string, params?: Record<string, unknown>) =>
    Promise<{ data: T | null; error: { message?: string; code?: string } | null }>;
};
```

**crypto.randomUUID() durumu:** Mobile bundle export'unda `uuid` modülü `crypto.randomUUID()` kullanıyor (Hermes 0.71+ ve SDK 56'da global mevcut). **Polyfill gerek YOK.**

### C) Mobile facade şablonu

**Yapı (KYC pattern + mobile authClient):**

```typescript
// mobile/shared/depositRegister.ts (revize — mobile-specific runtime)

import { getSupabaseClient } from '../src/app/(auth)/authClient';

// Tipler web'den re-export — tek doğruluk kaynağı
export type {
  DepositContext,
  RegisterBidDepositParams,
  RegisterBidDepositResult,
} from "@/lib/depositRegister";

import type {
  RegisterBidDepositParams,
  RegisterBidDepositResult,
} from "@/lib/depositRegister";

type RpcClientLike = {
  rpc: <T = unknown>(fn: string, params?: Record<string, unknown>) =>
    Promise<{ data: T | null; error: { message?: string; code?: string } | null }>;
  from: (table: string) => any;  // profile select için
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> };
};

const KYC_REQUIRED_MESSAGE =
  "Teminat/ödeme yetkisi için KYC doğrulaması zorunlu. Profilinizden kimlik doğrulamayı tamamlayın.";

function parseRpcRow(data: unknown): Record<string, unknown> | null { /* aynı web */ }
function readString(...) { /* aynı web */ }

export async function registerBidDeposit(
  params: RegisterBidDepositParams
): Promise<RegisterBidDepositResult> {
  const client = (await getSupabaseClient()) as unknown as RpcClientLike;

  // Auth check
  const { data: authData } = await client.auth.getUser();
  if (!authData.user) {
    return { ok: false, status: "auth_required", message: "Teminat için giriş yapmalısınız." };
  }

  // KYC ön-check (hızlı UX; sunucu yine enforce)
  const profile = await client.from("profiles").select("kyc_status").eq("id", authData.user.id).maybeSingle();
  // ... (web buyNow.ts paterniyle aynı)

  // RPC
  const key = params.idempotencyKey ?? crypto.randomUUID();
  const { data, error } = await client.rpc("register_bid_deposit", { p_listing_id: ..., ... });

  // ... error/data parse → discriminated union dönüş (web depositRegister.ts ile birebir)
}
```

**Tipler web'den, runtime mobile-specific** — supabase client web ile mobile farklı, hata code eşleştirme + KYC ön-check + idempotency aynı mantık.

**KYC redirect:** Facade'da YOK — sadece `{status:'kyc_required'}` döner. UI tarafı `Linking.openURL("https://www.ihaleal.com/kyc")` ya da `router.push('/(auth)/kyc-redirect')` çağırır (önerim: UI'da kalsın, web buyNow.ts paterniyle uyum).

### D) Parça sırası

| Adım | Dosya | İş | Tahmini satır | Test |
|---|---|---|---|---|
| **2.1** | `mobile/shared/depositRegister.ts` (revize, mobile-specific) | KYC + RPC + discriminated union; web tipler re-export | ~140 satır | tsc + lint + expo export |
| **2.2** | `mobile/shared/buyNow.ts` (yeni, mobile-specific) | execute_buy_now için aynı pattern | ~150 satır | tsc + lint + expo export |
| **2.3** | `mobile/shared/bidActions.ts` (revize) | setTimeout(250) D-7 kaldır + placeBidRpc çağrısı (mobile-spesifik); validateBid pure logic kalır | ~80 satır (mevcut 56 → +24) | tsc + lint + expo export |
| **2.4** | `mobile/shared/index.ts` (barrel) | depositRegister + buyNow re-export ekle | +2 satır | tsc |
| **2.5** | `mobile/tsconfig.json` path map | `@/lib/depositRegister`, `@/lib/buyNow`, `@/lib/placeBid` (tipler için — runtime'ı tüketmiyoruz, ama tip resolve gerek) | +3 satır | tsc |

**Sıra mantığı:** En küçük risk → büyük. depositRegister ilk çünkü web ile yeni karşılaştırma (1d51c5d güncel). Buy_now ikinci (önceki tur'da test edildi). bidActions üçüncü (mevcut dosya revize, dikkat). Hepsinden sonra barrel + tsconfig path. Her parça **AYRI COMMIT** (kanıt birikimi için).

**Mobile UI (mobile/src/app/**) bu adımlarda DOKUNULMAZ** — Cursor'ın alanı, Adım 4 (talimat ayrı tur).

### E) Risk + Karar Noktası

**3 karar noktası:**

1. **K-2A — KYC redirect facade'da mı UI'da mı?**
   - **Önerim: UI'da.** Mobile facade `{status:'kyc_required'}` döner, mobile ekran (örn. ihale/[id]/hemen-al.tsx) `Linking.openURL('https://www.ihaleal.com/kyc')` çağırır. Web buyNow.ts paterniyle uyumlu.
   - Alternatif: facade içinde Linking çağrısı — daha az çağıran kodu ama "facade UI side-effect yapmaz" prensibini bozar.

2. **K-2B — RpcClientLike tipi nerede tanımlı?**
   - **Önerim:** `mobile/shared/_rpcClient.ts` (yeni, küçük) — paylaşılan tip + cast helper. 3 facade'da tekrar etmeyiz.
   - Alternatif: Her facade'da local kopya (pushNotifications.ts paterni).

3. **K-2C — Web bidActions facade yazılsın mı?**
   - **Önerim: HAYIR.** Web tarafında zaten placeBidRpc tek noktada (AuctionDetail.tsx:465) discriminated union tüketicisi var. Yeni bir bidActions.ts katmanı ekstra abstraction — gerek yok. Web AuctionDetail direkt placeBidRpc çağırmaya devam.

**Risk seviyesi (genel):** Düşük-orta.
- Para akışı kodu, ama 4 server-side fix ve KYC guard zaten aktif → bypass mümkün değil
- Mobile traffic 0 — fix yapısal, gerçek kullanıcı etkisi yok
- tsc + lint + expo export build smoke her parça sonrası kanıt
- Mobile UI henüz facade'leri kullanmıyor; bu sadece library katmanı

**Reverse:** Her parça ayrı commit → individual revert mümkün. Cursor mobile UI commits zaten Adım 4'te ayrı, bu turda etkilenmiyor.

### Karar bekleyen sorular (özet)

- **K-2A:** KYC redirect facade'da mı UI'da mı? *(Önerim: UI'da)*
- **K-2B:** RpcClientLike tipi paylaşılan dosya mı? *(Önerim: evet, mobile/shared/_rpcClient.ts)*
- **K-2C:** Web bidActions.ts yazılsın mı? *(Önerim: hayır, gerek yok)*

Karar verince **"BAS Adım 2.1"** ile depositRegister mobile facade'tan başlanır.

---

## YÖNETİCİ ÖZETİ

Akşamın ana işi: **mobil teklif/hemen-al akışını mock'tan gerçek RPC'ye köprülemek**. 4 mobil ekran (`borsa.tsx`, `ihale/[id]/teklif.tsx`, `hemen-al.tsx`, `kapali-teklif.tsx`) bugün tamamen mock; bidActions.ts `setTimeout(250)` ile fake-success döner (D-7 doğrulandı). Çekirdek tarafı zaten hazır: `placeBidRpc` + `executeBuyNow` facade'leri discriminated union döndürür, sunucuda KYC guard sert. Bağlantı için 3 köprü işi var: (i) mobile `authClient.ts`'in `SupabaseClientLike` tipini `.rpc()` exposed yapacak şekilde genişletmek, (ii) mobile/shared'a `placeBidMobile`/`executeBuyNowMobile` ince köprü eklemek, (iii) mobil ekranların handler'larını mock yerine bu köprülere bağlamak.

Yan iş: M-1/M-3/M-4/M-5/O8 olgunlaştırma (Cursor). Faz 4 pgmq ve main push bu turda **henüz değil** — kullanıcı uyanıkken Dashboard hazırlık ve CI yeşil teyidiyle yapılır.

3 kritik karar/onay noktası (en altta).

---

## BÖLÜM 1 — MOBİL TEKLİF/HEMEN-AL RPC BAĞLANTISI (akşamın ana işi)

### 1.1 Mobil mevcut durum (salt-okuma sonucu)

| Dosya | Akış | RPC'ye gidiyor mu? | Notlar |
|---|---|---|---|
| `mobile/src/app/(tabs)/borsa.tsx:98-142` | submitBid → shared/bidActions.ts | **HAYIR — fake** | bidderId session.user.id ✓ (K-B fix), ama bidActions setTimeout(250) → "ok" fake; gerçek place_bid yok |
| `mobile/shared/bidActions.ts:53` | submitBid impl | **HAYIR** | TODO yorumu satırında `placeBidRpc({...})` bekliyor; `validateBid` + `calculateProxyBid` (pure engine) çalışıyor ama sonuç simülasyon |
| `mobile/src/app/ihale/[id]/teklif.tsx:14-24` | submitMock | **HAYIR — mock** | KVKK checkbox + tutar girişi, sonuç sadece state setStatus, RPC yok |
| `mobile/src/app/ihale/[id]/hemen-al.tsx:13-19` | onMockBuyNow | **HAYIR — mock** | Statik 3 satır KYC/blokaj/RPC açıklaması, gerçek register_bid_deposit/execute_buy_now akışı YOK |
| `mobile/src/app/ihale/[id]/kapali-teklif.tsx:23-29` | onSubmit | **HAYIR — mock** | Sealed-bid backend yok zaten (doğru karar — preview only) |

**Mobile auth client engeli (BLOKER):** `mobile/src/app/(auth)/authClient.ts:11-20` tanımındaki `SupabaseClientLike` tipinde **`.rpc()` exposed DEĞİL** — sadece `auth` ve (implicit any cast'siz) `from`. Mobil tarafta RPC çağrısı için tipi genişletmek ya da `as unknown as SupabaseClient` cast pattern'ini (zaten `persistAuthSession`'da kullanılıyor — satır 72-73) yeni helper'da kullanmak gerekiyor.

**KYC ekranı eksik:** `mobile/src/app/(tabs)/profil.tsx` yalnız push/biyometrik/lokasyon ayarlarını gösteriyor, `kyc` veya `kimlik` route'u YOK. Sunucu `kyc_required` döndüğünde mobile UI nereye yönlendirecek? — bu kararı kullanıcıya soruyorum (en altta Soru 1).

### 1.2 Production RPC hazırlık (teyit edildi, sunucuda hazır)

#### `place_bid(p_auction_id uuid, p_amount numeric, p_idempotency_key text) returns json`

- Kaynak: `supabase/migrations/20260430150000_profiles_role_place_bid_antisniping.sql:12-79` (SON override, schema_migrations'da bu satır canlı)
- **KYC guard YOK** kendisinde; sadece `auth.uid()` null değil + idempotency + auction state + min_increment (default 100 TRY) + anti-sniping (120s extend)
- **bid_bonds check'i YOK** son versiyonda (önceki 20260430120000 versiyon yapıyordu ama bu üzerine yazılmış) — **dikkat: bu bir karar mı yoksa istemsiz regression mu?** (Soru 2)
- Dönüş kodları:
  - `{status:'ok', amount, ends_at}` — bid kabul
  - `{status:'duplicate', message}` — idempotency_key zaten kullanılmış
  - `{status:'error', message}` — auth/auction/ends/min_increment
- Min increment: `auctions.min_increment_try` (default 100) — istemci `MIN_INCREMENT_TRY` ile uyumlu olmalı (`src/lib/fees.ts`)

#### `register_bid_deposit(p_listing_id, p_auction_id, p_base_amount_try, p_deposit_amount_try, p_pre_auth_ref, p_context, p_idempotency_key) returns json`

- Kaynak: `supabase/migrations/20260527120000_buy_now_kyc_guard.sql:45-123` (KYC guard'lı son hâl)
- **KYC guard SERT:** `kyc_status != 'verified'` → `{status:'error', code:'kyc_required', message:'...'}`
- Rate limit: `pre_auth_attempts` (bid context) 10/window veya `buy_now_attempts` (buy_now context) 5/window
- `p_context in ('bid','buy_now')`; başka değer → error
- Dönüş: `{status:'ok', deposit_id}` veya `{status:'error', code?, message}`
- **Mock flag:** Şu an `metadata.is_mock=true` veriyor — production'da gerçek iyzico pre-auth yok, simülasyon

#### `execute_buy_now(p_listing_id, p_deposit_id, p_idempotency_key) returns json`

- Kaynak: `supabase/migrations/20260527120000_buy_now_kyc_guard.sql:129-252` (KYC guard'lı son hâl)
- **KYC guard SERT** (aynı kod ve mesaj)
- Sıralı kontroller: auth → KYC → rate_limit(buy_now) → duplicate purchase → listing state → buy_now_price/disabled → auction state → report_approved → deposit (status=authorized + context=buy_now)
- Dönüş kodları:
  - `{status:'ok', buy_now_id, amount}` — satın alma kayıtlı, listings.status='sold', auctions.status='ended'
  - `{status:'duplicate', message}` — aynı kullanıcı zaten pending
  - `{status:'error', code?:'kyc_required', message}` — KYC + diğerleri

#### Çekirdek facade'ler (zaten hazır, mobile'a expose edilecek)

- `src/lib/placeBid.ts` — `placeBidRpc({auctionId, amountTry, idempotencyKey?})` → `PlaceBidResult` (ok/duplicate/error+code). 96 satır, test edilmiş.
- `src/lib/buyNow.ts` — `executeBuyNow({listingId, depositId, idempotencyKey?})` → `ExecuteBuyNowResult` (7 case discriminated union: ok/duplicate/kyc_required/auth_required/preconditions_failed/rpc_error/config_missing). 188 satır, KYC istemci ön-check + sunucu enforce.
- `register_bid_deposit` için **henüz facade YOK** — şu an web `src/pages/AuctionDetail.tsx:752,847` raw `supabase.rpc("register_bid_deposit", …)` çağırıyor. Mobil bağlantı sırasında bir `src/lib/depositRegister.ts` ince facade'i ya da `buyNow.ts`'e ek fonksiyon yazılması gerekiyor (Soru 3).

**Web refactor partial uyarı:** OTURUM_DURUMU.md'de `bdaa42e refactor(client): BuyNow.tsx + AuctionDetail.tsx use buyNow helper` yazıyor ama grep `src/pages/AuctionDetail.tsx:752,847,906` hâlâ raw `supabase.rpc("execute_buy_now"/"register_bid_deposit")` görüyor. Refactor BuyNow.tsx tarafında tamam ama AuctionDetail.tsx tarafı henüz raw RPC'de. Bu akşam tamamlanırsa, mobil için de aynı pattern uygulanır (tek facade her iki taraf paylaşır). Orta öncelik temizlik.

### 1.3 Bağlantı planı — adım adım

**Faz M-RPC-1: Köprü altyapı (Claude Code, çekirdek + mobile/shared)**

| Adım | Dosya | İş | Büyüklük |
|---|---|---|---|
| 1 | `mobile/src/app/(auth)/authClient.ts:11-20` | `SupabaseClientLike` tipini `.rpc(fn, params) → Promise<{data, error}>` ekleyerek genişlet | Küçük (10 satır) |
| 2 | `src/lib/depositRegister.ts` (YENİ) | `registerBidDeposit({listingId, auctionId, baseAmountTry, depositAmountTry, preAuthRef, context, idempotencyKey?})` → `DepositResult` discriminated union (ok/kyc_required/rate_limited/listing_not_found/error). `buyNow.ts` patterniyle yaz. | Küçük (~100 satır) |
| 3 | `src/pages/AuctionDetail.tsx:752,847` | Raw RPC çağrılarını yeni facade'e çevir (web refactor tamamla) | Orta |
| 4 | `mobile/shared/bidActions.ts:53` | TODO yorumunu kaldır; `placeBidRpc({auctionId, amountTry: final, idempotencyKey: crypto.randomUUID()})` gerçek çağrı | Küçük |
| 5 | `mobile/shared/buyNow.ts` (YENİ) | `executeBuyNow` ve `registerBidDeposit` re-export — mobile için thin barrel | Küçük (5 satır) |
| 6 | `mobile/shared/index.ts` | Yeni `buyNow` exportlarını ekle | Küçük (1 satır) |

**Faz M-RPC-2: UI bağlama (Cursor, mobile ekranlar)**

| Adım | Dosya | İş | Büyüklük |
|---|---|---|---|
| 7 | `mobile/src/app/(tabs)/borsa.tsx:98-142` | `handleSubmit` içinde bidActions zaten gerçek RPC çağıracak (Adım 4 sonrası); UI feedback'i `result.code` (rate_limit/listing_not_found/auction_ended) için ayrı mesajla genişlet | Küçük |
| 8 | `mobile/src/app/ihale/[id]/teklif.tsx` | submitMock kaldır; gerçek akış: (a) auth check, (b) önce `registerBidDeposit({context:'bid', auctionId, listingId, base=amount, deposit=amount*0.05})`, (c) bond authorize sonra `placeBidRpc`, (d) ekrandan KYC redirect (kyc_required dönerse) | **Orta-büyük** (200 satır) — Cursor |
| 9 | `mobile/src/app/ihale/[id]/hemen-al.tsx` | onMockBuyNow kaldır; gerçek akış: (a) auth + report_approved teyit UI, (b) `registerBidDeposit({context:'buy_now', deposit=buyNowPrice*0.015})`, (c) sonra `executeBuyNow({listingId, depositId})`, (d) sözleşme/MASAK 5-checkbox web parite | **Büyük** (~300 satır + sözleşme akışı) — Cursor |
| 10 | `mobile/src/app/ihale/[id]/kapali-teklif.tsx` | Backend henüz yok — mock kalır, sadece kullanıcıya "şu an yalnız ön-izleme" notu netleştir | Trivial |

### 1.4 KYC akışı — kyc_required dönünce mobil UI ne yapar?

**Şu an mobile'da `profil.tsx` yalın, KYC ekranı YOK.** İki seçenek:

- **Seçenek A — Mobile'a mini KYC ekranı** (`mobile/src/app/profil/kimlik.tsx` veya `(auth)/kyc.tsx`). Şu sürümde sadece kullanıcıyı web KYC akışına yönlendiren bir karşılama + deep link (`https://ihaleal.com/profil/kimlik`). Web tarafı `kyc-submit` edge function'ı var (workflow'da geçiyor). Küçük (~50 satır), Cursor.
- **Seçenek B — Direkt Alert + web aç** (`Linking.openURL('https://ihaleal.com/profil/kimlik')`). Daha düz, ama mobile UX zayıflar. Trivial.

**Önerim:** A (mini ekran), çünkü mobile'da KYC ekranı yokken `kyc_required` mesajını gösterip "Profili Aç" düğmesi koyup web'e linklemek normalde yeterli olur ama uzun vadede mobile-native KYC akışı (kamera + KKTC kimlik OCR + e-Devlet) bu ekrana eklenebilir. Şimdilik karşılama-only.

### 1.5 Hata yönetimi (her ekran için aynı şablon)

| Sunucu yanıtı | Mobile UI |
|---|---|
| `{status:'ok', ...}` | Toast/Alert "Teklif alındı / Hemen Al kayıtlı"; başarı sonrası ekran kapanır veya detaya döner |
| `{status:'duplicate', message}` | Toast "Bu teklif/işlem zaten kayıtlı" — sessiz başarı |
| `{code:'kyc_required'}` | Modal/Alert "KYC zorunlu" + "Kimlik Doğrula" düğmesi → Seçenek A ekranı |
| `{status:'error', message:'Çok sık deneme'}` (rate_limit) | Toast "Çok sık deneme, lütfen bekleyin" + disabled buton (15s cooldown) |
| `{status:'error', message:'İhale aktif değil/bitti'}` | Alert "İhale sona ermiş" + detay refresh |
| `{status:'error', message:'Teklif çok düşük'}` | Inline error "Min ₺X gerekli" (min_increment kullan) |
| Network/timeout | Toast "Bağlantı sorunu, tekrar dene" — buton enable |
| `error.code` PostgrestError | Generic Toast + Sentry/clientLog (varsa) |

### 1.6 İş bölümü ve sıra

| Adım | Sahip | Sıra | Bağımlılık |
|---|---|---|---|
| 1 (authClient tip) | Claude Code | İlk | — |
| 2 (depositRegister facade) | Claude Code | Adım 1 sonrası | — |
| 3 (web AuctionDetail refactor) | Claude Code | Adım 2 sonrası | Adım 2 |
| 4 (bidActions gerçek RPC) | Claude Code | Adım 1 sonrası | Adım 1 |
| 5,6 (mobile/shared/buyNow + barrel) | Claude Code | Adım 2 sonrası | Adım 2 |
| 7 (borsa.tsx feedback) | Cursor | Adım 4 sonrası | Adım 4 |
| 8 (teklif.tsx bağlama) | Cursor | Adım 5 sonrası | Adımlar 2,4,5 |
| 9 (hemen-al.tsx bağlama) | Cursor | Adım 5 sonrası | Adımlar 2,5 |
| 10 (kapali-teklif not) | Cursor | Bağımsız | — |
| KYC ekranı (Seçenek A) | Cursor | 8/9 öncesi tercihen | — |

**Paralelleşebilir:** 1↔10, 2↔7 (sıradaki bekleyiş yok). Sıralı: 2→3→5→{8,9}.

### 1.7 Risk — para akışı & test

**Risk seviyesi:** ORTA. `register_bid_deposit` şu an `metadata.is_mock=true` ile simülasyon (gerçek iyzico pre-auth yok). Yine de KYC guard + rate_limit + audit trail aktif. Test sırası:

1. **Yerel typecheck + test:run** (npm run test:run) — köprü kodu için
2. **Canlı test (öncesi onay):** Production'da 4 `kyc_status='none'` test user var (OTURUM_DURUMU.md). Sıra:
   - (a) `none` user ile borsa.tsx submitBid → place_bid çağrısı → `{status:'error', message:'Önce teminat yatırmalısınız'}` BEKLENMEZ çünkü place_bid son override bond check'siz; **place_bid bond olmadan kabul edebilir** → bu plan riski (Soru 2).
   - (b) `none` user ile hemen-al → `registerBidDeposit({context:'buy_now'})` → `{code:'kyc_required'}` — beklenen, UI redirect doğru gösteriyor mu?
   - (c) `verified` user ile aynı akış (bir test user'ı verified yapmak için DB write gerek — kullanıcı onaylı)
3. **Reverse/rollback yolu:**
   - Köprü facade dosyaları yeni — git revert tek commit
   - `authClient.ts` tip genişlemesi geri alınabilir
   - Hiç schema değişikliği yok — DB rollback gerekmez

**Production yazma onayı gereken noktalar:** Bu turda HİÇBİR. Sadece kod köprü; canlı test sırası kullanıcı uyanıkken yapılır.

---

## BÖLÜM 2 — GÜVENLİK SERTLEŞTİRME (OWASP MASVS / fintech)

### 2.1 Mevcut mobil güvenlik durumu (salt-okuma sonucu)

| Kontrol | Mevcut durum | Risk |
|---|---|---|
| **TLS Certificate Pinning** | YOK | Orta — MITM proxy ile bid değiştirilebilir |
| **Biometric (LocalAuthentication)** | Var (`mobile/src/app/(auth)/biometric.ts`) ama `disableDeviceFallback:false` (M-1) | Orta — PIN/parola fallback yüksek-değer için uygunsuz |
| **Jailbreak/Root tespiti** | YOK | Düşük-orta — SecureStore zaten platform anahtarlı, ama tweak'ler bypass edebilir |
| **Screen capture engeli** | YOK | Düşük — ödeme/KYC ekranı screenshot edilebilir |
| **PrivacyInfo.xcprivacy (iOS 17+)** | YOK (Expo managed; Expo SDK 56 mı handle ediyor?) | Orta — App Store reddine yol açabilir |
| **App Transport Security** | Default (HTTPS-only) ✓ | OK |
| **Code obfuscation/Hermes** | Expo default Hermes ✓ | OK (ama deobfuscatable) |
| **expo-secure-store** | Kullanılıyor ✓ (`SecureStore` adapter authClient'ta) | OK |

### 2.2 Eksikler — SDK56-uyumlu çözüm (öncelik sırasıyla)

#### Yüksek

1. **PrivacyInfo.xcprivacy (iOS App Store)** — `expo-build-properties` plugin'i ile `iosPrivacyManifests` config. Apple 2024-Q1'den beri 3rd-party SDK için zorunlu. Expo SDK 56 v3.x `expo-build-properties` privacy manifests destekliyor. **Yaklaşım:** `app.json` plugins'e ekle, kullanılan API listesi (Mobile/UserDefaults, FileTimestamp) deklare. Cursor, küçük-orta (~30 satır config).

2. **Screen capture block (ödeme/KYC ekranlarında)** — `expo-screen-capture` paket. SDK 56 ✓. `preventScreenCaptureAsync()` ekran-mount'ta çağır, unmount'ta `allowScreenCaptureAsync()`. Hassas ekranlar: `hemen-al.tsx`, `teklif.tsx`, KYC ekranı, profil → kimlik kartı görüntüsü. Cursor, küçük.

3. **M-1: Biometric strict (yüksek-değer)** — `authenticateBiometric()` parametresi `strict?:boolean` eklenip yüksek-değer akışta (hemen-al, kapalı-teklif) `disableDeviceFallback:true` geçilir. Düşük-değer (giriş) için fallback açık kalır. Tek dosya değişiklik. Cursor, küçük.

#### Orta

4. **TLS Certificate Pinning** — RN ekosisteminde 2 yaklaşım:
   - (a) **`react-native-ssl-pinning`** — bare workflow gerek; Expo managed ile çakışır → custom dev client (EAS Build) zorunlu
   - (b) **`expo-network` + manuel fetch interceptor** — daha hafif ama tam pinning değil
   - **Öneri:** Bu sürüm için **ertelensin** (EAS Build yapısı kurulana kadar). Şimdilik supabase-js HTTPS yeterli; pin'e geçiş orta-vadeli yol haritası. **Karar:** Bugün skip et, sonraki sprint için kayda al.

5. **Jailbreak/Root detection** — `jail-monkey` paketi (RN), ama Expo managed'a entegrasyonu sıkıntılı (native module). Alternatif: `expo-device.isRootedExperimentalAsync()` SDK 56'da deneysel. Düşük öncelik — Türkiye pazarında jailbreak yaygın değil.

#### Düşük

6. **Code obfuscation** — Hermes zaten enable, ek `metro-minify-terser` deobfuscation'ı zorlaştırır ama büyük etki yok. Skip.

7. **Anti-debugging** — production build'de Sentry tap-into'su yeterli. Skip.

### 2.3 Öncelik özeti

| # | İş | Araç | Büyüklük |
|---|---|---|---|
| 1 | PrivacyInfo.xcprivacy (app.json) | Cursor | Küçük-orta |
| 2 | Screen capture block (4 ekran) | Cursor | Küçük |
| 3 | M-1 biometric strict variant | Cursor | Küçük |
| 4 | TLS pinning | — | **Erteleme** |
| 5 | Jailbreak detect | — | Erteleme |

---

## BÖLÜM 3 — KALAN MÜFETTİŞ BULGULARI

| ID | Bulgu | Dosya:satır | Çözüm | Araç | Büyüklük |
|---|---|---|---|---|---|
| M-1 | Biometric strict yok (yüksek-değer) | `mobile/src/app/(auth)/biometric.ts:19` (`disableDeviceFallback:false`) | `authenticateBiometric(reason, {strict:true})` — yüksek-değer akış strict=true geçer | Cursor | Küçük |
| M-3 | KVKK consent SecureStore persist yok | `mobile/src/app/(tabs)/profil.tsx:42-45` (`useState(false)` her seferinde sıfırlanır) | `SecureStore.setItemAsync('consent_location'/`'consent_push'`, '1')` + ekran mount'ta read; back/refresh ile korunsun | Cursor | Küçük-orta |
| M-4 | Push RPC payload error handling | `mobile/src/features/notifications/pushNotifications.ts` (registerPushTokenToSupabase) | `data?.status==='error'` ise `Alert.alert` veya state'e set; sessiz başarısızlık olmasın | Cursor | Küçük |
| M-5 | Background location KVKK modal eksik | `mobile/src/features/location/locationRadar.ts` (requestLocationWithConsent) | `requestBackgroundPermissionsAsync()` öncesi açık rıza modalı + KVKK metni; Android `ACCESS_BACKGROUND_LOCATION` ayrı izin | Cursor | Orta |
| O8 | Push deep link `Linking.openURL` | `mobile/src/features/notifications/pushNotifications.ts` (bindNotificationDeepLinking) | `Linking.openURL('ihaleal://...')` yerine `router.push('/path')` (expo-router) — back-stack uyumlu | Cursor | Küçük |
| D-1 | EAS projectId placeholder | `mobile/app.json:60` (`PLACEHOLDER_EAS_PROJECT_ID`) | Kullanıcı `eas init` çalıştırıp projectId üretmeli; app.json'a yazılır | Kullanıcı + Cursor | Küçük (kullanıcı adımı) |
| D-3 | Mock PII (e-mail vb. demo veride) | `mobile/shared/demoMarket.ts` (?) — re-check | Sentetik isim/şehir/IBAN, gerçek-veri çağrışımlı string'leri faker'la replace | Cursor | Küçük |
| D-4 | Mock PII (auctionsSource?) | `src/lib/auctionsSource.ts` (?) — re-check kullanıcı veri yoksa atla | Aynı pattern, sadece gerekiyorsa | Cursor/Claude | Küçük |
| D-7 | bidActions fake-success setTimeout | `mobile/shared/bidActions.ts:53` (`setTimeout(250)`) | **Bölüm 1 Adım 4'te zaten kapatılacak** | Claude Code | (Bölüm 1'in parçası) |

---

## BÖLÜM 4 — FAZ 4 + MAIN PUSH PLANI

### 4.1 Faz 4 (pgmq async matching)

**Migration:** `supabase/migrations/20260516120400_v2_pgmq_matching.sql` (repo'da, schema_migrations'da YOK = gap=1).

**Kullanıcının Dashboard'da yapması gereken adımlar (bu turda DEĞİL, akşam ileri saatte onayla):**

1. Supabase Dashboard → Database → **Extensions** sayfası:
   - `pgmq` enable
   - `pg_cron` enable
   - `pg_net` enable
2. Supabase Dashboard → **SQL Editor** veya `db query`:
   ```sql
   alter database postgres set app.functions_url = 'https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1';
   alter database postgres set app.cron_secret = '<gizli — kullanıcı üretsin>';
   ```
3. **Pre-check:** `select extname from pg_extension where extname in ('pgmq','pg_cron','pg_net')` üçü dönerse hazır.
4. **Deploy:** Kullanıcı "BAS Faz 4" → `npx supabase db query --linked --file supabase/migrations/20260516120400_v2_pgmq_matching.sql` (atomik, BEGIN/COMMIT).
5. **Smoke:**
   - `select queue from pgmq.list_queues()` → en az 1 queue
   - `select * from cron.job where jobname like 'matching%'` → cron job kayıtlı
   - `select trigger_name from information_schema.triggers where event_object_table='listing_matches'` → fanout trigger
6. **Regression:** Önceki tüm RPC'ler hâlâ çalışır mı (KYC + Faz 1+2+3 smoke pattern tekrar et).

**Acil değil** — kullanıcısız özellik (background matching). Mobil RPC bağlantısı + güvenlik sertleştirme bittikten sonra rahat yapılır. Tahmin: 30 dk Dashboard + 10 dk deploy + 15 dk smoke = 1 saat.

### 4.2 main push planı

**Mevcut durum:**
- Local `main` = `3091f84` (en son: docs snapshot)
- Origin/main = `6179800` (son: Polish homepage layout)
- **11 commit ahead** (önceki snapshot'a göre +1: `3091f84 docs(audit): session status snapshot for context handoff`)

**Push 3 workflow tetikler:**

1. **`ci.yml`** (push branches:[main]) — Heavy. Adımlar:
   - typecheck (`tsc --noEmit`)
   - precheck:encoding (`scripts/check-source-encoding.mjs`)
   - validate:env (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets gerek)
   - test:run (vitest)
   - build (vite-build-safe)
   - test:rls (RLS policy contract)
   - test:coverage
   - check-bundle-budget
   - lint:ci (strict allowlist)
   - security:audit (npm audit --audit-level=high)
   - rls:matrix
   - playwright (arastirma-routes + demo-routes smoke)
2. **`supabase-v2-deploy.yml`** (push branches:[main] + path filter `supabase/**`):
   - `npx supabase link --project-ref wsjifesrdaeorrdzbvmk`
   - **`npx supabase db push --include-all`** ← Faz 4 (pgmq) eğer Dashboard hazır değilse FAİL ('create extension if not exists pgmq' permission/extension hatası)
   - Edge functions deploy: place-bid, ai-price-estimate, matching-fanout (--no-verify-jwt), bulk-listing-ingest, kyc-submit
3. **`deploy-vercel.yml`** — Vercel production deploy

**GÜVENLİ push için zorunlu pre-condition'lar:**

- **CI ön-kontrol (LOKAL, push öncesi):**
  - `npm run typecheck` — mobil bağlantıdan sonra muhtemelen geçer ama yeni `depositRegister.ts` ile teyit
  - `npm run test:run` — vitest yeşil
  - `npm run test:rls` — RLS policy contract; Faz 1 (bids visibility) + Faz 2 (multi_tenant) policy değişiklikleri matrix'i etkiledi mi, kontrol
  - `npm run lint:ci` — strict allowlist
  - `node scripts/check-bundle-budget.mjs` — bundle limit
  - `npm run security:audit` — high+ vuln var mı

  Bu liste CI'ın aynısı; lokal yeşilse CI yeşil (çoğunlukla).

- **Supabase deploy ön-kontrol (Faz 4 öncesi push edilirse):**
  - **Senaryo A** — Faz 4 Dashboard hazır + deploy edildi (schema_migrations'da var): `db push --include-all` no-op, başarılı.
  - **Senaryo B** — Faz 4 Dashboard hazır DEĞİL: `db push --include-all` Faz 4'ü deploy etmeye çalışır → `pgmq` extension yoksa fail → workflow kırmızı. **Bu durumda push'u erteleyeceğiz.**

**Önerilen sıra (akşam → sonraki gün):**

| Adım | İş | Onay |
|---|---|---|
| 1 | Mobil RPC bağlantısı + güvenlik sertleştirme + müfettiş bulguları (bu plan) | Kullanıcı plan onaylar |
| 2 | Lokal CI ön-kontrol: typecheck + test:run + test:rls + lint:ci + bundle + security:audit | Otomatik (her yeşil) |
| 3 | Faz 4 Dashboard hazırlık (extension + GUC) — kullanıcı | Kullanıcı yapar |
| 4 | "BAS Faz 4" → `db query --linked --file` ile manual deploy + smoke | Kullanıcı onayı |
| 5 | Migration gap 0 doğrulama: `select version from schema_migrations order by version desc limit 5` | Otomatik |
| 6 | **Şimdi push güvenli:** `git push origin main` → 3 workflow yeşil olmalı | Kullanıcı "BAS push" |
| 7 | Workflow logs takip: ci.yml + supabase-v2-deploy.yml + vercel | Otomatik |
| 8 | Post-deploy smoke: 4-5 RPC + frontend route loadtest | Kullanıcı onayı |

**RİSK YÖNETİMİ:**
- Eğer Adım 4 (Faz 4) ertelendi: Adım 6'da `supabase-v2-deploy.yml` --include-all Faz 4'ü deploy etmeye çalışır. Bu fail riski büyük. **Çözüm:** önce Faz 4 manual, sonra push.
- Eğer CI fail (test/lint): push öncesi lokal bul, düzelt, yeniden commit. Push edilen son commit fail bırakırsa main branch protect yok → ana branch fail commit içeriyor olur, ama Vercel/Supabase deploy YAPILMAZ (CI fail koşulu).
- Force push YASAK (kural).

---

## BÖLÜM 5 — ÖNCELİK SIRASI + RİSK MATRISI

### 5.1 Akşam sırası (önerilen)

| # | İş | Sahip | Büyüklük | Risk |
|---|---|---|---|---|
| 1 | **Bölüm 1 Adım 1-2:** authClient tip + depositRegister facade | Claude Code | Küçük-orta | Düşük (kod) |
| 2 | **Bölüm 1 Adım 4-6:** bidActions gerçek RPC + mobile/shared barrel | Claude Code | Küçük | Düşük (kod) |
| 3 | **Bölüm 1 Adım 3:** Web AuctionDetail.tsx raw RPC → facade refactor | Claude Code | Orta | Orta (web regresyon riski; test:rls + tests/auctionDetail koşulmalı) |
| 4 | **Bölüm 2 #2:** Screen capture block (4 ekran) | Cursor | Küçük | Düşük |
| 5 | **Bölüm 2 #3 = M-1:** Biometric strict variant | Cursor | Küçük | Düşük |
| 6 | **Bölüm 3 M-3:** Consent SecureStore persist | Cursor | Küçük-orta | Düşük |
| 7 | **Bölüm 3 M-4:** Push RPC payload error handling | Cursor | Küçük | Düşük |
| 8 | **Bölüm 3 O8:** Deep link router.push | Cursor | Küçük | Düşük |
| 9 | KYC mini ekran (Seçenek A) | Cursor | Küçük | Düşük |
| 10 | **Bölüm 1 Adım 8-9:** teklif.tsx + hemen-al.tsx UI bağlama | Cursor | **Büyük** | Orta (para akışı; canlı test gerek) |
| 11 | **Bölüm 1 Adım 7:** borsa.tsx feedback genişletme | Cursor | Küçük | Düşük |
| 12 | **Bölüm 2 #1:** PrivacyInfo.xcprivacy | Cursor | Küçük-orta | Düşük |
| 13 | **Bölüm 3 M-5:** Background location KVKK modal | Cursor | Orta | Düşük (UX) |
| 14 | Lokal CI ön-kontrol (Bölüm 4.2 Adım 2) | Claude Code | Küçük | Düşük (sadece koş) |
| 15 | **Faz 4 hazırlık + deploy** — kullanıcı uyanıkken, Dashboard hazırsa | Kullanıcı + Claude | Orta | **Orta-yüksek** (canlı schema değişikliği; reverse zor) |
| 16 | **main push** — Faz 4 sonrası, CI yeşil teyit + kullanıcı onay | Kullanıcı + Claude | Küçük | **Yüksek** (3 workflow tetikler) |

**Paralelleşebilir:** 1-3 (Claude) ↔ 4-9 (Cursor); 10 (Cursor) 5 sonrası başlayabilir.
**Sıralı:** 1→2→{4-13}; 14→15→16.

### 5.2 Kullanıcı onayı gereken noktalar

- **Bölüm 1 Adım 3** (web AuctionDetail refactor): web regresyon riski; "BAS web-refactor" onayı önce, sonra commit
- **Bölüm 1 Adım 10** (mobil hemen-al RPC): para akışı — canlı test öncesi "BAS canlı test" onayı; 4 test user'dan 1'i verified yapılırsa onay
- **Bölüm 4.1 Faz 4:** Dashboard hazırlık + "BAS Faz 4"
- **Bölüm 4.2 main push:** CI yeşil + Faz 4 deploy edildi + "BAS push"

### 5.3 Para/güvenlik kritik karar noktaları (özet)

1. **place_bid bond check'i son override'da kaldırılmış** — kasıtlı mı? (Soru 2)
2. **register_bid_deposit `metadata.is_mock=true`** — gerçek iyzico pre-auth ne zaman?
3. **KYC mobile ekranı YOK** — A vs B seçeneği (Soru 1)

---

## ⚠️ KULLANICIYA SORACAK 3 KRİTİK NOKTA

### Soru 1 — Mobil KYC akışı için A mı B mi?

`executeBuyNow` veya `registerBidDeposit` sunucudan `{code:'kyc_required'}` döndüğünde mobil UI ne yapsın?
- **A (önerilen):** Mobile-native mini KYC karşılama ekranı (`mobile/src/app/profil/kimlik.tsx`). Şu sürümde "KYC zorunlu, kimlik doğrulamak için profil sayfasında devam et" + "Web'de Aç" düğmesi (https://ihaleal.com/profil/kimlik).
- **B:** Doğrudan `Linking.openURL` web KYC sayfasına yönlendir (in-app browser ya da external).

### Soru 2 — `place_bid` v3 (`20260430150000`) bid_bond check'ini kaldırdı: kasıt mı bug mı?

`supabase/migrations/20260430120000_write_policies_and_place_bid_v2.sql:117-130` versiyonu `bid_bonds.status='held'` zorunlu kılıyordu. Üzerine yazan `20260430150000_profiles_role_place_bid_antisniping.sql:12-79` bu kontrolü **çıkarmış**. Bu:
- (a) **Kasıtlı simplification** — teminat akışını `register_bid_deposit` üzerinden ayrı bir UX yaptık, place_bid'in işi yalın bid kaydı?
- (b) **İstemsiz regression** — orijinal anti-sniping eklerken bond check'i yazmayı unuttuk?

Mobile teklif akışı planı buna göre değişir: kasıtsa borsa.tsx doğrudan placeBidRpc çağırabilir; istemsizse önce migration düzelt + sonra mobil.

### Soru 3 — `registerBidDeposit` için ayrı facade dosyası mı, `buyNow.ts`'e eklemek mi?

- **A (önerilen):** Yeni `src/lib/depositRegister.ts` — temiz ayrım, single responsibility (her facade tek RPC).
- **B:** `src/lib/buyNow.ts`'e `registerBidDeposit` fonksiyonu ekle — daha az dosya ama ad uyuşmazlığı (buyNow ≠ deposit).

---

## EK — DOSYA YERLERİ (hızlı referans)

**Mobil:**
- `mobile/src/app/(tabs)/borsa.tsx` (BG terminali, submitBid)
- `mobile/src/app/(auth)/authClient.ts` (SupabaseClient — .rpc YOK)
- `mobile/src/app/(auth)/biometric.ts` (LocalAuth — disableDeviceFallback:false)
- `mobile/src/app/ihale/[id]/teklif.tsx,hemen-al.tsx,kapali-teklif.tsx` (mock ekranlar)
- `mobile/shared/bidActions.ts,borsa.ts,index.ts` (köprü barrel)
- `mobile/src/features/notifications/pushNotifications.ts`, `features/location/locationRadar.ts`
- `mobile/app.json`, `mobile/eas.json`

**Çekirdek:**
- `src/lib/placeBid.ts` (placeBidRpc)
- `src/lib/buyNow.ts` (executeBuyNow — 7-case union)
- `src/pages/AuctionDetail.tsx:752,847,906` (raw RPC kalıntısı)
- `src/lib/fees.ts` (MIN_INCREMENT_TRY)

**Supabase migrations:**
- `20260430150000_profiles_role_place_bid_antisniping.sql` (place_bid final — bond check YOK)
- `20260527120000_buy_now_kyc_guard.sql` (KYC guard — register_bid_deposit + execute_buy_now)
- `20260516120400_v2_pgmq_matching.sql` (Faz 4 bekliyor)

**CI/Deploy:**
- `.github/workflows/ci.yml` (typecheck + test + rls + bundle + lint + audit + playwright)
- `.github/workflows/supabase-v2-deploy.yml` (db push --include-all + edge fns)
- `.github/workflows/deploy-vercel.yml` (Vercel)

---

**Bu plan dosyası:** salt-okuma turunun çıktısı. Production'a/git'e yazma YOK. Sadece bu dosya lokal commit edilecek (push YOK). Kullanıcı 3 kritik soruyu yanıtlayınca planın uygulamaya geçilir — her ana iş için kullanıcı "BAS [iş]" onayıyla başlatılır.
