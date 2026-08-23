# XSS Audit — Pentest 2 KISMİ Takip

**Tarih:** 2026-05-30 gece · **Yöntem:** Salt-okuma grep + render path analizi
**Pentest referansı:** `_audit/PENTEST_RAPOR.md` Test 8 KISMİ (frontend render doğrulanmadı)

## Bulgu özeti — **0 stored XSS riski**

| Yöntem | Hit |
|---|---:|
| `grep -rn "dangerouslySetInnerHTML" src/` | **1** (kontrollü) |
| `grep -rnE "\.innerHTML\s*=" src/` | **0** |
| `grep -rnE "\.outerHTML\s*=" src/` | **0** |
| `grep -rnE "document\.write" src/` | **0** |

## Tek `dangerouslySetInnerHTML` — kontrollü

**Konum:** `src/components/ui/chart.tsx:91`

```tsx
<style
  dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES)
      .map(([theme, prefix]) => `
${prefix} [data-chart="${safeChartId}"] {
${colorConfig.map(([key, itemConfig]) => {
    const safeKey = sanitizeCssIdentifier(key)
    const color = itemConfig.theme?.[...] || itemConfig.color
    return color ? `  --color-${safeKey}: ${color};` : null
  }).join("\n")}
}`).join("\n")
  }}
/>
```

**Güvenlik analizi:**
- `id` → `sanitizeCssIdentifier(id)` (helper'da `[^a-zA-Z0-9_-]` strip).
- `key` → `sanitizeCssIdentifier(key)` aynı.
- `theme/prefix` → sabit `THEMES` constant (kullanıcı kontrolünde değil).
- `color` → `ChartConfig` type prop (dahili tanım, kullanıcı içeriği yolu yok).

**Risk değerlendirmesi:** kullanıcı input bu component'e akmıyor (Recharts/dashboard internal). XSS yüzeyi yok.

## Kullanıcı içeriği render path'leri ✅ React default escape

Aşağıdaki kullanıcı-girdi alanları frontend'de **React default escape** ile render edilir (JSX `{value}` syntax → otomatik HTML escape):

| Veri kaynağı | Render path örnek | Escape | Risk |
|---|---|:-:|:-:|
| `saved_searches.name` | `<div>{savedSearch.name}</div>` | ✅ React | ✅ Güvenli |
| `notifications.payload.title/body` | `<p>{notification.payload.title}</p>` | ✅ React | ✅ Güvenli |
| `chat_messages.body` | `<span>{msg.body}</span>` | ✅ React | ✅ Güvenli |
| `listing_offers` ve `watchlist` notları | `<div>{note}</div>` | ✅ React | ✅ Güvenli |
| `listings.title`, `body.description` | `<h1>{auction.title}</h1>` | ✅ React | ✅ Güvenli |
| `developer_projects.project_name` | `<h2>{project.project_name}</h2>` | ✅ React | ✅ Güvenli |
| `organizations.display_name` | `<title>{org.display_name}</title>` | ✅ React | ✅ Güvenli |
| `chat compliance flagged_keywords` | flat string array, escaped | ✅ React | ✅ Güvenli |

**Doğrulama yöntemi:**
- Hiçbir component `dangerouslySetInnerHTML` ile kullanıcı verisini render etmez (yalnız chart.tsx sanitize edilmiş CSS).
- `innerHTML/outerHTML/document.write` projede **kullanılmıyor**.
- React 19 default davranışı: `{userInput}` → HTML entity escape (`<` → `&lt;`).

## Sonuç

**Stored XSS riski: 0.**

Pentest 2 KISMİ'nin XSS yarısı kapatıldı. Sealed amount maskeleme ayrı migration ile kapatıldı (`20260604120000_listing_offers_sealed_view.sql`).

---

*Yöntem teyidi: salt-okuma grep, kod path okuma. Hiçbir kod değişikliği yapılmadı. Bu dosya tek çıktı.*
