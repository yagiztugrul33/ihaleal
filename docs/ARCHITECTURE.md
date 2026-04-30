# Mimari — ihaleal.com

Bu dosya repo içinde **tek kaynak** olarak tutulur; `README.md` buraya bağlanır.

## 1. Yığın ve dağıtım

| Katman | Teknoloji |
|--------|-----------|
| Ön uç | **Vite 6** + **React 19** + **TypeScript**, **Tailwind**, **react-router-dom** (HashRouter kullanımı `App.tsx` ile uyumlu) |
| BaaS | **Supabase** (Auth, Postgres, REST `PostgREST`, isteğe bağlı Realtime) |
| Yayın | Statik **`dist`** → **Vercel** (`vercel.json` SPA rewrite) |

Üretim derlemesi: `npm run build`. Ortam değişkenleri **`VITE_*`** ile Vite’a enjekte edilir; tarayıcıda görünür olanlar için **gizli sırlar koymayın** (yalnızca anon/public key).

## 2. İstemci yapısı (özet)

- **`src/lib/supabase.ts`** — `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`, PKCE oturumu.
- **`src/lib/fees.ts`** — Komisyon (satıcı işlem matrahı **%4 + KDV**, ortak emlakçı **B2B %2 + KDV**, alıcı işlem komisyonu **0** — kod gerçeği), üyelik/hizmet sabitleri; UI ve iş kuralları için tek kaynak.
- **`src/pages/`** — Sayfa bileşenleri; rotalar **`src/App.tsx`** içinde tanımlı.
- **Varlıklar** — `public/` altında statik dosyalar (video, görseller vb.).

## 3. Supabase ve ortam

### Zorunlu (istemci)

| Değişken | Amaç |
|----------|------|
| `VITE_SUPABASE_URL` | Proje REST temeli (`…supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Tarayıcıda kullanılan **anon** JWT |

### Sunucu tarafı / scriptler (`.env.local`, CI’da asla commit etmeyin)

| Değişken | Amaç |
|----------|------|
| `SUPABASE_SERVICE_ROLE_KEY` | Script veya admin işlemleri; **tam yetki** — RLS’yi bypass eder. JWT içindeki `role` claim’i **`service_role`** olmalı. |

`profiles` şeması şu an **`is_admin`** içerir (`manual_push.sql`); istemci **yalnızca `is_admin`** seçer. İleride `role` sütunu eklenirse `AuthContext` genişletilebilir.

## 4. Veritabanı ve SQL sırası

Repoda birleşik şema **`supabase/manual_push.sql`** içindedir (ilk kurulum için tek dosya olarak kullanılabilir). Ek migration örneği: **`supabase/manual_push_v7.sql`** (`pre_launch_signups` vb.).

Uzak projede sıra tipik olarak:

1. Auth kullanıcıları ve **profiles** (foreign key `profiles.id` → `auth.users`).
2. **`manual_push.sql`** içeriği (veya Supabase migration zinciri ile eşdeğeri).
3. Gerekirse **`manual_push_v7.sql`** ve sonraki numaralı dosyalar.

RLS politikaları tanımlıysa, **anon** ile beklenen bazı tablolarda **403/401** görmek normaldir; **service role** ile yönetim scriptleri çalışır. Yanlış yapıştırılmış **anon** anahtarının `service_role` yerine kullanılması sık **403** sebebidir — `precheck:supabase` JWT `role` satırını kontrol edin.

## 5. Güvenlik notları

- **`SUPABASE_SERVICE_ROLE_KEY`** yalnızca güvenilir ortamlarda; tarayıcı bundle’ına eklenmez.
- Üretimde oturum ve ödeme için httpOnly çerez / backend doğrulama modeli hedeflenmelidir (SPA tek başına yeterli değildir).

## 6. İlgili dokümanlar

- **[Mega paket görev kontrolü](MEGA_PAKET_GOREV_KONTROL.md)** — `ihaleal_paket_*.md` kaynakları ve terminoloji uyumu.
- **[REST / RPC cURL referansı](API_REFERENCE.md)** — Supabase örnek çağrıları.
- **[Production Platform Master](PRODUCTION_PLATFORM_MASTER.md)** — hukuki mimari özeti, full-stack mimari, çekirdek teklif motoru, şema, güvenlik, ödeme, MVP ve ölçekleme (CTO seviyesi tek kaynak).
- [Gelir modeli](REVENUE_MODEL.md) — `fees.ts` ile uyumlu tutulur.
- [Yayına hazırlık](LAUNCH_CHECKLIST.md) — doğrulama ve deploy adımları.
- [Güvenlik modeli](SECURITY_MODEL.md) — SPA/Supabase gerçekçi sınırlar.
- [Kimi içerik senkron](KIMI_SYNC_TASKS.md) — mega paket ↔ kod hizalama görevleri.
