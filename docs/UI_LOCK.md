# 🔒 UI LOCK — baseline (`main` @ HEAD, v81 önizleme ile uyumlu istatistikler)

Bu dosya Cursor ve geliştiriciler için **zorunlu uyarıdır**.

## Korunan tasarım özeti (mevcut `main`)

- **Hero istatistikleri:** 1.247 Aktif İhale · 8.452 Kayıtlı Kullanıcı · ₺386M Toplam Hacim · %97 Başarı Oranı  
- **Hero başlık satırı:** “Gayrimenkul” + gradient **“Satış · Pazarlama · İhale”** (önizlemedeki vitrin metni bu yapıyla uyumludur).  
- **Navbar:** AI Analiz, Dashboard, Harita, Karşılaştır, Favoriler, Mortgage vb. rotalar (`App.tsx` / `Navbar.tsx`).  
- **Kimi / sohbet:** `ChatWidget` floating davranışı korunur.

## YASAK (ön izin olmadan)

- Kahraman (Hero), navbar ve ana vitrin düzeninde **tasarım yenileme**  
- Renk paleti / tipografi / spacing ile **“yeniden modernleştirme”**  
- Bileşenleri **gereksiz yeniden yazma**

## İZİN

- Backend: Supabase, RLS, RPC, `src/lib/*` mantığı (UI’a dokunmadan)  
- Veri bağlama: mevcut kartlara gerçek API verisi  
- Bug düzeltmesi: yalnızca kırık davranış; **görünümü değiştirmeden**  
- Yeni sayfa: **mevcut sayfa diline ve bileşenlerine uyarak**

## Geri yükleme notu (2026-04-30)

Yerel çalışma kopyasında biriken UI sapmaları **`git stash`** ile yedeklenip çalışma ağacı **`origin/main` ile aynı commit içeriğine** döndürüldü.  
Yedeği görmek için: `git stash list` → `backup-before-ui-restore-*`.
