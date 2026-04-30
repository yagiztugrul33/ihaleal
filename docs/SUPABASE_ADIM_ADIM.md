# Supabase — senin yapacağın adımlar (tek tek)

Bu liste **repo dışı**: Dashboard hesabın ve `.env.local` dosyan gerekiyor. Cursor/agent anahtarlarına erişemez.

---

## 1) Anahtarları nereden alırsın?

1. Tarayıcıda [Supabase Dashboard](https://supabase.com/dashboard) → giriş yap.
2. **ihaleal.com** ile bağlı projeyi seç (URL genelde `https://xxxxx.supabase.co`).
3. Sol menü: **Project Settings** (dişli) → **API**.
4. Şunları kopyala:
   - **Project URL** → bu `VITE_SUPABASE_URL`.
   - **`anon` `public`** anahtarı → bu `VITE_SUPABASE_ANON_KEY` (JWT `eyJ…` veya yeni `sb_publishable_…` olabilir).
   - **`service_role` `secret`** → bu `SUPABASE_SERVICE_ROLE_KEY` (**asla** frontend’e koyma, **commit etme**).

**Önemli:** Her anahtar **tek satır** olmalı; satır ortasında Enter yok. Yanlış yapıştırma en sık `jwt_role_service=(okunamadi)` hatasına yol açar.

---

## 2) Bilgisayarında `.env.local` oluştur / güncelle

Proje kökü: `ihaleal.com` klasörü.

1. `\.env.example` dosyasını referans al.
2. Aynı klasörde **`.env.local`** oluştur (yoksa) ve şu satırları doldur:

```env
VITE_SUPABASE_URL=https://SENIN-PROJE.supabase.co
VITE_SUPABASE_ANON_KEY=BURAYA_ANON
SUPABASE_SERVICE_ROLE_KEY=BURAYA_SERVICE_ROLE
```

3. Dosyayı kaydet. (Bu dosya `.gitignore` ile commit edilmez.)

**İpucu:** Masaüstünde `supabase-keys.txt` tutuyorsan, projede `npm run env:sync` ile sadece URL + anon `.env.local`’e yazdırılabilir; **service role’ü elle** eklemen gerekir (script bilerek yazmaz).

---

## 3) Ön kontrolü çalıştır

Proje klasöründe terminal:

```bash
npm run precheck:supabase
```

**Beklenen (özet):**

- `jwt_role_anon=anon` (veya dashboard’un verdiği anon formatı ile uyumlu)
- `jwt_role_service=service_role`
- Tablolar için çoğu istek **200** veya RLS nedeniyle bilinçli **401** — tablo yoksa **404** görürsün.

Hâlâ `jwt_role_service=(okunamadi)` ise: service anahtarını yeniden tek satır yapıştır veya Dashboard’dan **yeni secret** üretip güncelle.

---

## 4) Veritabanı şeması (tablolar yoksa)

Supabase → **SQL Editor** → yeni sorgu:

1. Repoda **`supabase/SQL_EDITOR_TEK_DOSYA.sql`** içeriğini (boş projede) tek seferde veya parça parça çalıştır; güncel birleşik dosya için `npm run sql:bundle`.
2. Parça parça tercih ediyorsan: `docs/SQL_EDITOR_TEK_TEK_YAPISTIR.md` ve `docs/SUPABASE_SQL_PARCA_PARCA_KOPYALA.md`.

`pre_launch_signups` için **404** görüyorsan genelde tablo henüz oluşturulmamıştır → ilgili migration/sql çalıştırılmalı.

---

## 5) Deploy ortamı (Vercel vb.)

Hosting panelinde **Environment Variables** kısmına en az:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Service role **sadece** sunucu/script kullanımı için; tarayıcıya verme.

---

## 6) Sorun giderme (kısa)

| Belirti | Ne yap |
|--------|--------|
| `(okunamadi)` | Anahtar kesilmiş / çok satır / yanlış yapıştırma |
| Tablolarda **403** service ile | Service JWT yanlış veya RLS/policy uyumsuzluğu |
| **404** belirli tabloda | O tablo için SQL henüz çalışmadı |
| **500** `profiles_anon` | Genelde view/policy veya şema hatası → Supabase **Logs** |

---

Daha geniş liste: `docs/LAUNCH_CHECKLIST.md`.
