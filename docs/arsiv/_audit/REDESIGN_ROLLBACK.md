# Redesign Geri Dönüş (N43)

**Tag:** `safe-before-redesign`  
**Tarih:** 2026-05-30

Redesign bozulursa geri dön:

```bash
git fetch origin
git reset --hard safe-before-redesign
git push --force-with-lease origin main
```

Alternatif (Vercel): `safe-before-redesign` tag deploy'unu production'a **promote** et.

Bu tag, N43 cinematic redesign **öncesi** son çalışan görsel state'i işaretler.

## Atomik commit geri alma

Her N43.x ayrı commit — yalnızca bozulan adım:

```bash
git revert <commit-sha>
git push origin main
```

## Kapı beklentisi

- `npm run smoke` → 36/36
- Bundle ana chunk <800KB (WebGL yok)
- `Register.tsx` / core RLS / migrations dokunulmaz
