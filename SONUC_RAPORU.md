# SONUÇ RAPORU — iBuyer prod-only + Ana sayfa pixel-perfect

**Tarih:** 2026-05-18
**Production:** https://ihaleal.vercel.app
**Cache bypass:** https://ihaleal.vercel.app/?v=20260518143400

## Migration durumu

| Adım | Sonuç |
|------|--------|
| migration list --linked | HATA — proje bağlı değil |
| db push --linked | Uygulanmadı |

### MIGRATION_ERROR

Cannot find project ref. Have you run supabase link?

**Çözüm:** supabase link --project-ref <ref>, sonra migration list; 20260518120000_ibuyer_trade_in yoksa db push.

## Silinen dosyalar

- scripts/write-ibuyer-module.mjs

## Değişen dosyalar

- src/lib/ibuyer/submitInstantOffer.ts, types.ts — demo kaldırıldı
- src/components/ibuyer/SubmissionForm.tsx — hata UX
- src/pages/ibuyer/IBuyerPage.tsx — auth gate
- src/components/auth/RequireAuthGate.tsx — YENİ
- src/pages/auth/Login.tsx, Register.tsx — ?next=
- src/sections/target/HomeTarget.tsx — pixel-perfect TR ana sayfa
- tests/ibuyer/*.ts, tests/smoke/ibuyer.spec.ts — YENİ

## Eklenen testler

- tests/ibuyer/submitInstantOffer.test.ts
- tests/ibuyer/SubmissionForm.test.tsx
- tests/smoke/ibuyer.spec.ts

## Doğrulama

- npm run verify: GEÇTİ
- npm run test:smoke: GEÇTİ (15 passed, 1 skipped)

## Bilinen kısıtlar

1. Migration production push yapılamadı (Supabase link yok).
2. Site üst DEMO MODU bandı platform geneli; iBuyer bileşeninde demo yok.