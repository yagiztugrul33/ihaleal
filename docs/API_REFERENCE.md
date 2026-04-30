# ihaleal.com — API ve RPC referansı (cURL)

**Ortam:** `SUPABASE_URL` ve `ANON_KEY` üretimde güvenli şekilde saklanır; aşağıdaki örnekler **yapı taşlarını** gösterir. Tarayıcıda yalnızca anon anahtar kullanılmalıdır; `service_role` yalnızca güvenilir sunucu ortamlarında.

## Kimlik doğrulama (e-posta / şifre)

```bash
curl -sS -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"kullanici@ornek.com","password":"********"}'
```

Yanıt gövdesinde `access_token` ve `refresh_token` döner.

## Oturum açıkken REST satır okuma

```bash
curl -sS "$SUPABASE_URL/rest/v1/auctions?select=id,status,ends_at,current_high_bid_try&limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json"
```

## `place_bid` RPC (teklif)

```bash
curl -sS -X POST "$SUPABASE_URL/rest/v1/rpc/place_bid" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "p_auction_id": "00000000-0000-0000-0000-000000000000",
    "p_amount": 3000000,
    "p_idempotency_key": "bir-kezlik-uuid-v4"
  }'
```

**Not:** İş mantığı PostgreSQL fonksiyonunda (`SECURITY DEFINER`); idempotency ve kilitleme veritabanında yapılır.

## Ön kayıt (anon insert politikası varsa)

```bash
curl -sS -X POST "$SUPABASE_URL/rest/v1/pre_launch_signups" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"email":"bülten@ornek.com","source":"website"}'
```

## Edge Functions

Şablonda `supabase/functions/` altında örnekler olabilir. Deploy sonrası:

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/place_bid" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"auction_id":"...","amount":1000000}'
```

Gerçek yük için fonksiyon sözleşmesi ve imzalama anahtarları dokümante edilmelidir.

## Swagger / Postman

Supabase proje panelinden otomatik OpenAPI üretimi yoktur; REST uçları **PostgREST** kurallarına uyar (`Prefer`, `Range` başlıkları vb.). Bu dosya “tek doğruluk” yerine geliştirici kısayoludur.
