# Güvenlik Son Taraması (N20–N25)

**Tarih:** 2026-05-30

## Yeni özellikler — kontrol listesi

| Özellik | RLS / veri | Durum | Kanıt |
|---------|------------|-------|-------|
| Geofence prefs | `user_geofence_preferences` RLS owner | 🟡 CC-apply | `20260603100000_user_geofence_preferences.sql:30-44` |
| Geofence alert log | owner-only insert/select | 🟡 CC-apply | aynı migration:38-44 |
| Konum KVKK | Açık rıza + cihazda işleme | ✅ | `GeofenceSettingsPanel.tsx:59-63`, `useGeofenceWatch.ts:51-54` |
| signatures | RLS signer only | 🟡 CC-apply | `20260603110000_signatures.sql:24-34` |
| E-imza hash | SHA-256 | ✅ | `signatureClient.ts:3-7`, `SignaturePad.tsx:72-73` |
| Borsa ETL | service_role write only | ✅ | `borsa_etl/index.ts:41-47`, mevcut `price_index` RLS |
| Chat XSS | input strip | ✅ | `ChatWidget.tsx:sanitizeChatInput` |
| PDF export | istemci-only, no PII leak | ✅ | `pdfBuilder.ts` — kullanıcı tetikler |

## npm audit (2026-05-30)

```
1 moderate — ws 8.0.0–8.20.0 (GHSA-58qx-3vcg-4xpx)
Öneri: npm audit fix (transitive; CI doğrulama gerekir)
```

## Claude Code crafted-pentest bekleyenler

1. **Geofence CC-apply sonrası** — başka kullanıcının prefs/alert okunamaz mı?
2. **signatures CC-apply sonrası** — cross-user SELECT/INSERT reddi
3. **borsa_etl deploy** — `INTERNAL_CRON_SECRET` olmadan 401
4. **ChatWidget** — stored XSS yok (mesajlar DOM text, not innerHTML)
5. **SignaturePad** — imza data URL boyut limiti (DoS) — opsiyonel edge validation

## Düzeltmeler bu turda

- Geofence: ham GPS sunucuya gönderilmiyor (tasarım)
- Chat: HTML tag strip eklendi
- uploadFile path traversal (N12) — önceki turda düzeltildi
