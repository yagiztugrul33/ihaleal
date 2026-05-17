# Security Status

**Updated:** 2026-05-16 | **Security slice:** ~3.4/5 (was ~2.6/5)

## Verified in CI
- RLS migration contract tests (`npm run test:rls`)
- Security-scoped ESLint + `npm audit --audit-level=high`
- Production mock payment blocked (`src/lib/payment/capabilities.ts`)
- Edge CORS allowlist (`supabase/functions/_shared/cors.ts`)

## Trust boundary
PostgreSQL RLS + SECURITY DEFINER RPCs — not React AdminGuard.

## Critical remaining
1. Apply migration `20260516120000_admin_listing_security.sql` on live Supabase.
2. Run live RLS: `RUN_RLS_INTEGRATION=1` + test users → `npm run test:rls:live`
3. PSP not production-ready (skeleton Edge functions).
4. Full-repo lint debt (CI uses security paths only).

## Investor note
Production candidate for auction MVP; not a licensed payment institution.