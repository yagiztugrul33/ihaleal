# Deploy Talimatları — ihaleal.com

## 1. GitHub Push

```bash
git add .
git commit -m "deploy: cumartesi yayın"
git push origin main
```

## 2. Vercel

- vercel.com/new
- GitHub repo bağla
- Framework: Vite (otomatik)
- Build: npm run build (otomatik, vercel.json'dan)
- Output: dist (otomatik)

## 3. Env Variables

`.env.production.example`'daki değişkenleri Vercel Dashboard'a ekle.

## 4. Custom Domain

- Vercel > Domains > ihaleal.com
- DNS: A kaydı 76.76.21.21 veya CNAME → cname.vercel-dns.com

## 5. Doğrulama

- https://ihaleal.com açılıyor mu?
- Demo banner görünüyor mu?
- /kayit ile yeni hesap açılıyor mu?
- /ihaleler liste yükleniyor mu?

## 6. Cumartesi Sonrası

- Lighthouse skoru al
- Smoke test (16 madde)
- Console hata var mı kontrol

## 7. Yatırımcıya yerel önizleme (LAN / dış ağ)

- **Aynı Wi‑Fi:** `npm run dev` sonrası bilgisayarın LAN IP’si + Vite portu, örn. `http://192.168.1.x:5173/#/`.
- **Farklı ağ / WhatsApp:** LAN adresi dışarıdan erişilemez. **Vercel Preview** veya tünel kullanın; örnek: `npx ngrok http 5173` → verilen `https://….ngrok-free.app` bağlantısını paylaşın.
