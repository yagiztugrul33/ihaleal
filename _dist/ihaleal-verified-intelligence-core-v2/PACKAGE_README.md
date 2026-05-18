# ihaleal Verified Intelligence Core v2

Paket tarihi: 2026-05-17 23:50
Branch: fix/verified-intelligence-core
Son commit: 6d36860 feat(ges): land evaluation engineering and legal compliance suite

## Icerik

- GES on fizibilite motoru (calculateGesFeasibility)
- Parsel / kat karsiligi on fizibilite (calculateParcelFeasibility)
- Markdown rapor motoru (reportBuilder)
- PVGIS tipleri (pvgisTypes)
- Route sabitleri (routes.ts)
- Testler: tests/core.test.cjs, tests/engineering/verified-core.test.ts
- tsconfig.test.json (izole typecheck)

## Entegrasyon

1. Dosyalari ihaleal repo yapisina kopyalayin
2. npm run supabase:push (ayri migration gerekmiyorsa atlayin)
3. node tests/core.test.cjs
4. npm run test:run tests/engineering/verified-core.test.ts
5. npm run build

## Canli route'lar

/arastirma, /arastirma/ges, /arastirma/parsel, /arastirma/war-room

