# R14 P0 FIX — SALT-OKUNUR DOĞRULAMA RAPORU

**Tarih:** 2026-05-30 (gece) · **Doğrulayan:** Claude (salt-okuma, git'e dokunmadı)
**Repo:** `C:\Users\yagiz\Documents\GitHub\ihaleal` · **HEAD (committed):** `106cf92`
**Doğrulanan dosyalar:** working tree (committed `106cf92` + uncommitted Register.tsx + 2 yeni helper)

> Working tree durumu:
> - **Modified:** `src/pages/auth/Register.tsx` (uncommitted — fix burada)
> - **Untracked:** `src/lib/activeOrgId.ts`, `src/lib/contractorOrgSlug.ts`, `_audit/DERIN_ANALIZ_2026_05_30.md`
> - **DOKUNULMAMIŞ:** `src/pages/portals/MuteahhitPanelPage.tsx`, `src/hooks/useDeveloperProjects.ts` — committed sürüm `9e1a3ff` / `09a0f5e` aynısı

---

## FIX DOĞRU MU: **HAYIR** ❌

P0 fix **EKSİK ve KISMI**. 6 maddeden **2 PASS + 3 FAIL + 1 KISMI**. Sadece `Register.tsx` düzgün yamalanmış; `MuteahhitPanelPage.tsx` ve `useDeveloperProjects.ts` üzerindeki kritik şema-uyum düzeltmeleri **HİÇ YAPILMAMIŞ** (working tree'de modified bile değiller).

---

## MADDE TABLOSU

| # | Konu | Sonuç | Kanıt (dosya:satır) |
|---:|---|:---:|---|
| 1 | Register organizations INSERT: `name` & `owner_user_id` YOK; `slug`+`legal_name`+`display_name`+`org_type:"contractor"` VAR | ✅ **PASS** | `src/pages/auth/Register.tsx:84-100` |
| 2 | Register: `organization_members` INSERT (`role:"owner"`) + `set_active_org` RPC + `auth.refreshSession()` | ✅ **PASS** | `src/pages/auth/Register.tsx:105-126` |
| 3 | MuteahhitPanelPage: `organizations.owner_user_id` filtresi KALKMIŞ + aktif org JWT/`useActiveOrg` ile geliyor | ❌ **FAIL** | `src/pages/portals/MuteahhitPanelPage.tsx:71` |
| 4 | `src/` genelinde `/login` kalmamış (→`/giris`) | ❌ **FAIL** | `src/pages/portals/MuteahhitPanelPage.tsx:148` |
| 5 | `useDeveloperProjects`: `listings` INSERT `organization_id` VAR; `createProject` `org_id`+`owner_user_id` ikisini set | ❌ **FAIL** | `src/hooks/useDeveloperProjects.ts:113-117, 207-220` |
| 6 | 4 fix dosyasında YENİ eklenen `any` / `as ` / `@ts-ignore` (kılıf maskesi) | 🟡 **KISMI PASS** | `src/lib/activeOrgId.ts:5` — pragmatik typed cast |

---

## MADDE 1 — Register organizations INSERT şeması ✅ PASS

**Beklenen:** `name` & `owner_user_id` ARTIK YOK; `slug`+`legal_name`+`display_name`+`org_type:"contractor"` VAR.

**Kanıt — `src/pages/auth/Register.tsx:84-100`:**
```ts
const { data: orgRow, error: orgErr } = await supabase
  .from("organizations")
  .insert({
    slug: buildContractorOrgSlug(firmaAdi),
    legal_name: firmaAdi,
    display_name: firmaAdi,
    org_type: "contractor",
    tax_number: taxNumber.trim(),
    settings: {
      ruhsat_pending: true,
      company_address: companyAddress.trim(),
      created_via: "self_register",
    },
  })
  .select("id")
  .single();
```

- `name`: ❌ YOK (kaldırıldı) → **PASS**
- `owner_user_id`: ❌ YOK (kaldırıldı) → **PASS**
- `slug`: ✅ `buildContractorOrgSlug(firmaAdi)` (helper `src/lib/contractorOrgSlug.ts`)
- `legal_name`: ✅ `firmaAdi`
- `display_name`: ✅ `firmaAdi`
- `org_type`: ✅ `"contractor"`

**Sonuç:** PASS.

---

## MADDE 2 — `organization_members` + `set_active_org` ✅ PASS

**Beklenen:** `organization_members` INSERT (role:'owner') + `set_active_org` RPC.

**Kanıt — `src/pages/auth/Register.tsx:105-126`:**
```ts
const { error: memErr } = await supabase.from("organization_members").insert({
  organization_id: orgRow.id,
  user_id: session.user.id,
  role: "owner",
  status: "active",
});
if (memErr) {
  setError("Firma üyeliği oluşturulamadı. Destek ile iletişime geçin.");
  return;
}

const { error: rpcErr } = await supabase.rpc("set_active_org", { p_org_id: orgRow.id });
if (rpcErr) {
  setError("Aktif firma oturumu ayarlanamadı. Destek ile iletişime geçin.");
  return;
}
await supabase.auth.refreshSession();
```

- `organization_members` INSERT: ✅ var
- `role: "owner"`: ✅ var
- `status: "active"`: ✅ bonus (ek doğrulama)
- `supabase.rpc("set_active_org", { p_org_id: orgRow.id })`: ✅ var
- `auth.refreshSession()`: ✅ JWT yenilemesi (aktif org claim'i için)

**Sonuç:** PASS.

---

## MADDE 3 — Panel `owner_user_id` filtresi ❌ FAIL

**Beklenen:** `organizations.owner_user_id` filtresi KALKMIŞ; aktif org JWT/`useActiveOrg`/`getActiveOrgId` üzerinden geliyor.

**Kanıt — `src/pages/portals/MuteahhitPanelPage.tsx:66-74`:**
```ts
const [{ data: prof }, { data: org }] = await Promise.all([
  supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  supabase
    .from("organizations")
    .select("settings")
    .eq("owner_user_id", user.id)        // ← HÂLÂ MEVCUT (FAIL kanıtı)
    .eq("org_type", "contractor")
    .maybeSingle(),
]);
```

- **`.eq("owner_user_id", user.id)` hâlâ duruyor (satır 71).** P1 migration sonrası `organizations.owner_user_id` kolonu hâlâ var olsa bile, çoklu üyelik modeli için `organization_members` join'i veya aktif org JWT okuması beklenirdi.
- `useActiveOrg` hook'u kullanılmıyor; `getActiveOrgId` helper'ı (`src/lib/activeOrgId.ts:9`) yazılmış ama **bu sayfada çağrılmıyor**.
- `import` satırlarında `activeOrgId`/`useActiveOrg` referansı yok (Grep doğrulandı).

**Modified satır sayısı:** Bu dosya `git diff HEAD` ile **modified DEĞİL** — yani fix HİÇ UYGULANMAMIŞ.

**Sonuç:** **FAIL.** Düzeltme önerisi:
```ts
// 1) getActiveOrgId() ile aktif org id'yi al
// 2) supabase.from("organizations").select("settings").eq("id", activeOrgId).maybeSingle();
```

---

## MADDE 4 — `/login` artık `/giris` ❌ FAIL

**Beklenen:** `src/` altında hiçbir `/login` string'i kalmamış olmalı (rota `/giris`).

**Grep komutu:** `rg "/login" src/`

**Kanıt — `src/pages/portals/MuteahhitPanelPage.tsx:148`:**
```tsx
<Link to="/login?next=/muteahhit/panel">Giriş yap</Link>
```

- `App.tsx`'te rota `/giris` (`/login` rotası YOK). Kullanıcı bu Link'e bastığında **catch-all 404'e gider** — gerçek giriş sayfasına ulaşamaz.
- Site genelinde tek `/login` referansı bu (Grep tek hit).
- Beklenen: `/giris?next=/muteahhit/panel`.

**Sonuç:** **FAIL.** Tek satır düzeltme: `MuteahhitPanelPage.tsx:148` → `to="/giris?next=/muteahhit/panel"`.

---

## MADDE 5 — `useDeveloperProjects`: `organization_id` + `createProject` ikili set ❌ FAIL

**Beklenen:**
1. `publishUnitAsListing` içindeki `listings` INSERT'inde `organization_id` ALANI VAR.
2. `createProject` hem `org_id` hem `owner_user_id` set ediyor.

### 5a) `createProject` org_id eksik — FAIL

**Kanıt — `src/hooks/useDeveloperProjects.ts:108-123`:**
```ts
const createProject = useCallback(
  async (input: NewProjectInput): Promise<{ data: DeveloperProject | null; error: string | null }> => {
    if (!user) return { data: null, error: "Giriş yapın" };
    const { data, error: err } = await supabase
      .from("developer_projects")
      .insert({
        ...input,
        owner_user_id: user.id,           // ← sadece owner_user_id
        stage: input.stage ?? "planning",
      })
      ...
```

- `owner_user_id`: ✅ var (115)
- `org_id`: ❌ **YOK** — eklenmemiş.

### 5b) `publishUnitAsListing` listings INSERT'te `organization_id` YOK — FAIL

**Kanıt — `src/hooks/useDeveloperProjects.ts:205-220`:**
```ts
const { data: listing, error: listErr } = await supabase
  .from("listings")
  .insert({
    seller_id: user.user.id,
    title: options.title,
    body: { ... },
    project_id: projectId,
    unit_id: unitId,
    is_lansman: true,
    buy_now_price_try: options.price_try,
    status: "active",
  })
  ...
```

- `organization_id`: ❌ **YOK**.

### 5c) Bonus — `fetchProjects` hâlâ `owner_user_id` filtreli — FAIL (madde 3 ile aynı kalıp)

**Kanıt — `src/hooks/useDeveloperProjects.ts:89-93`:**
```ts
const { data, error: err } = await supabase
  .from("developer_projects")
  .select("*")
  .eq("owner_user_id", user.id)          // ← üyelik modeline geçilmemiş
  .order("created_at", { ascending: false });
```

**Modified satır sayısı:** `useDeveloperProjects.ts` `git diff HEAD` ile **modified DEĞİL** — fix HİÇ UYGULANMAMIŞ.

**Sonuç:** **FAIL.** Beklenen düzeltmeler:
1. `createProject` INSERT'e `org_id: activeOrgId` ekle (helper'dan veya parametre olarak).
2. `publishUnitAsListing` listings INSERT'e `organization_id: activeOrgId` ekle.
3. `fetchProjects` → `organization_members` üzerinden user'ın org id'leri ile `.in("org_id", [...])` (veya tek aktif org).

---

## MADDE 6 — TS maske / kılıf kontrolü 🟡 KISMI PASS

**Aranan:** Fix dosyalarında YENİ eklenen `any` / `as <Type>` / `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`.

| Dosya | Bulgu | Değerlendirme |
|---|---|---|
| `src/pages/auth/Register.tsx` (modified) | Hiç `as `, `any`, `@ts-ignore` yok (Grep negatif) | ✅ TEMİZ |
| `src/lib/contractorOrgSlug.ts` (yeni) | Hiç cast/ignore yok | ✅ TEMİZ |
| `src/lib/activeOrgId.ts:5` (yeni) | `as Record<string, unknown>` (typed cast — `any` değil) | 🟡 PRAGMATİK |
| `src/pages/portals/MuteahhitPanelPage.tsx` | Modified değil → yeni cast yok | ✅ N/A |
| `src/hooks/useDeveloperProjects.ts` | Modified değil → yeni cast yok | ✅ N/A |

**Tek not — `src/lib/activeOrgId.ts:5`:**
```ts
const raw = (session?.user?.app_metadata as Record<string, unknown> | undefined)?.active_org_id;
```
- Supabase `app_metadata` tipinin gevşek olduğu için index erişimi için kullanılmış typed cast. `as any` veya `@ts-ignore` değil — düzgün daraltma. **Kabul edilebilir**, ama tip-saf yol: dedicated `interface AppMetadata { active_org_id?: string }` ve `as AppMetadata`.
- "Fix kılıfı" değil; bu helper zaten fix bağlamı dışında genel yardımcı.

**Sonuç:** KISMI PASS — yeni eklenen tek cast pragmatik & sınırlı; maske/kılıflama yok.

---

## ÖZET

### Yapılan (PASS)
1. ✅ `Register.tsx` organizations INSERT şeması (name/owner_user_id kaldırıldı, slug+legal+display+org_type eklendi)
2. ✅ `Register.tsx` organization_members + set_active_org + refreshSession akışı
3. ✅ Helper'lar (`contractorOrgSlug.ts`, `activeOrgId.ts`) TS bakımından temiz

### Yapılmayan (FAIL)
1. ❌ `MuteahhitPanelPage.tsx` aktif-org-bazlı org fetch — `owner_user_id` filtresi hâlâ duruyor (satır 71)
2. ❌ `MuteahhitPanelPage.tsx:148` `/login` linki düzeltilmemiş (`/giris` olmalı)
3. ❌ `useDeveloperProjects.ts:115` `createProject` `org_id` set etmiyor
4. ❌ `useDeveloperProjects.ts:207-220` `publishUnitAsListing` listings INSERT'inde `organization_id` yok
5. ❌ `useDeveloperProjects.ts:92` `fetchProjects` hâlâ `owner_user_id` filtreli (üyelik modeline geçmemiş)

### Önemli not
- `src/pages/portals/MuteahhitPanelPage.tsx` ve `src/hooks/useDeveloperProjects.ts` working tree'de **modified bile değil**. Fix bu dosyalara hiç dokunmamış. Master "fix bitti" emrini erken vermiş veya Cursor yarıda kesilmiş.
- `getActiveOrgId()` helper'ı yazılmış ama **hiçbir yerde çağrılmıyor** (Grep doğrulandı).
- TS/lint maske yok — geçiştirme şüphesi yok; sadece **iş eksik**.

### Tavsiye edilen sıra (master için)
1. `MuteahhitPanelPage.tsx:71` → `.eq("id", activeOrgId)` (getActiveOrgId ile)
2. `MuteahhitPanelPage.tsx:148` → `/giris?next=/muteahhit/panel`
3. `useDeveloperProjects.ts:92` → `organization_members` join veya `.in("org_id", userOrgIds)`
4. `useDeveloperProjects.ts:115` → `org_id: activeOrgId` ekle
5. `useDeveloperProjects.ts:215` (listings INSERT) → `organization_id: activeOrgId` ekle
6. tsc + lint + build tekrar; commit "fix(muteahhit): R14 P0 — org membership migration"

---

**Doğrulama metodu:** Salt-okuma (Read + Grep + git diff). Hiçbir kod değişikliği yapılmadı. Hiçbir git komutu (commit/push/tag) çalıştırılmadı. Sadece bu tek dosya (`_audit/R14_FIX_DOGRULAMA_2026_05_30.md`) yazıldı.
