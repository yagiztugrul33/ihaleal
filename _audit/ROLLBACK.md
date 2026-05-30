# ROLLBACK — Gece Sprinti Acil Geri Dönüş Rehberi

**Tarih:** 2026-05-30 gece · **Yazılan:** Claude (gözetimsiz sprint öncesi emniyet kemeri)

## Çıpa Noktası

| Alan | Değer |
|---|---|
| Safe tag | **`safe-2026-05-30-night`** (annotated, pushed) |
| HEAD hash | **`a7bb560`** |
| Canlı bundle | **`index-vjeK2r9U.js`** |
| Doğrulanmış iyi durum | ✅ Mobil 500 fix (Footer Gavel) · ✅ RLS migration push · ✅ ai_qa try/catch · ✅ post_chat_message deploy |
| Bilinen bloklayıcı | ❌ R14 funnel signup organizations INSERT 403 (RLS policy canlıda aktif değil — `supabase migration list` 20260530160000 görünüyor ama policy uygulanmamış; master Dashboard SQL düzeltmesi bekleniyor) |

## a) Kod geri al

### Tek bozuk commit:
```bash
git revert <bozuk-hash>          # yeni revert commit, history korunur
git push origin main
```
Tercih edilen. Sabah Master yeni commit'ten birinin sorunlu olduğunu fark ederse — sadece o commit'i tersine al.

### Tüm gece sprinti geri al (nükleer seçenek):
```bash
git reset --hard safe-2026-05-30-night
git push --force-with-lease origin main   # ⚠️ FORCE PUSH — kullanmadan önce 2 kez düşün
```
- `--force-with-lease` zorunlu (`--force` değil) — başkasının paralel push'u korunur.
- Bu komut **gece atılan tüm sprint commit'lerini siler** — sadece tam felaket durumunda.
- Master onayı şart.

## b) Vercel rollback (canlı bundle)

1. https://vercel.com/yagiztugrul33/ihaleal (ihaleal projesi) → **Deployments** sekmesi.
2. Listede şu commit'i bul: **`a7bb560` — fix(edge/ai_qa): fetch + json parse try/catch — kontrollu hata** (Production, bundle `index-vjeK2r9U.js`).
3. Sağındaki üç-nokta menü → **"Promote to Production"** → onay tıkla.
4. ~30 sn içinde canlı bundle vjeK2r9U'ye döner. `curl -s https://www.ihaleal.com/ | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1` ile doğrula.

> Vercel her commit için ayrı immutable deployment tutar. Promote işlemi sadece "production" pointer'ını değiştirir, build yeniden yapılmaz → 30 sn.

## c) Veritabanı geri al (Supabase point-in-time)

> ⚠️ **Master kararı**. Bu işlem Storage + DB hepsini bir tarihe geri alır, son saat içindeki tüm kullanıcı verisi silinir.

1. https://supabase.com/dashboard/project/wsjifesrdaeorrdzbvmk → **Database** → **Backups**.
2. Pro plan PITR (Point-in-Time Recovery) penceresi son 7 gün.
3. Hedef saati seç (ör. gece sprintinden hemen önce) → **"Restore"**.
4. Yeni proje URL'i alacak — frontend `.env.production` güncellemesi gerekir, yeni anon key, vb.
5. Bu **2-4 saat** sürer ve Master için kritik bir karar — sıradan rollback değil.

**Alternatif (daha temiz):** sadece bozuk migration'ı `DROP POLICY` / `ROLLBACK` ile elle çevir, PITR'a gitme. Master Dashboard SQL Editor'da:
```sql
-- Eğer gece sprint bir tabloya zarar verdiyse
BEGIN;
  DROP TABLE IF EXISTS public.bozuk_tablo;
  -- veya policy'i geri al
COMMIT;
```

## Sabah quick-check protokolü

Master uyandığında 60 saniyede sistem sağlıklı mı:

```bash
# 1) Canlı bundle hâlâ vjeK2r9U mi (veya yeni sprint deploy hash'i mi)
curl -s "https://www.ihaleal.com/" | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1

# 2) Smoke testi koş (sabah Master için)
npm run smoke

# 3) Git log gözden geçir
git log --oneline safe-2026-05-30-night..HEAD
```

Smoke testi FAIL ise → yukarıdaki **a)** veya **b)** uygulanır.

## Bilinen Bloklayıcı (gece sprinte ait DEĞİL — önceki)

- `organizations` tablosunda authenticated INSERT 403. RLS migration `20260530160000` `supabase migration list --linked` çıktısında görünüyor ama policy `org_insert_authenticated` uygulanmamış (hint:null + "new row violates RLS policy"). Master Dashboard SQL Editor'da `_audit/R14_E2E_REPORT` içindeki tek SQL bloğu ile düzeltilebilir.
- Bu **bu emniyet kemerinin değil, önceki sprint'in** kalan işi.

---

*Bu rehber Master için yazıldı. Gece boyunca otonom çalışan Claude bunu yazdı, hiçbir komutu otonom çalıştırmadı — tüm rollback adımları manuel.*
