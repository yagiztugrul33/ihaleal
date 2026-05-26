# Cloudflare Security Runbook (Panel Steps)

Bu adımlar Cloudflare panelinde manuel uygulanır. Kod değişikliği gerektirmez.

1. **Origin IP gizleme (DNS proxy / turuncu bulut)**
   - Menü: `Websites -> <domain> -> DNS`
   - `A` / `CNAME` kayıtlarında `Proxy status` alanını **Proxied (orange cloud)** yapın.
   - Amaç: Origin sunucu IP adresi doğrudan görünmesin.

2. **WAF açma (OWASP Managed Rules)**
   - Menü: `Security -> WAF -> Managed rules`
   - `Cloudflare Managed Ruleset` ve `OWASP Core Ruleset` için **Enable** yapın.
   - Hassas endpointler için `Sensitivity: Medium/High` ile başlayın, false-positive izleyin.

3. **DDoS koruması**
   - Menü: `Security -> Settings`
   - `DDoS protection` otomatik açık olmalı; katman 3/4 ve 7 korumalarını doğrulayın.

4. **Bot Fight Mode**
   - Menü: `Security -> Bots`
   - `Bot Fight Mode` veya planda varsa `Super Bot Fight Mode` -> **On**.

5. **Rate limiting (login/api)**
   - Menü: `Security -> WAF -> Rate limiting rules`
   - Kural 1 (Login):
     - If URI contains `/auth` veya `/#/giris`
     - Threshold: örn. `10 requests / 1 minute / IP`
     - Action: `Managed Challenge` veya `Block (60s)`
   - Kural 2 (API/Function):
     - If URI contains `/functions/v1/`
     - Threshold: örn. `120 requests / 1 minute / IP`
     - Action: `Managed Challenge`

6. **SSL/TLS Full (strict)**
   - Menü: `SSL/TLS -> Overview`
   - `Encryption mode` = **Full (strict)**.
   - Origin certificate zinciri geçerli olmalı.

7. **TLS 1.3 + HSTS zorla**
   - Menü: `SSL/TLS -> Edge Certificates`
   - `TLS 1.3` = **On**
   - `Always Use HTTPS` = **On**
   - `HTTP Strict Transport Security (HSTS)` = **On**
     - `Max Age`: en az `6 months`, tercihen `12 months+`
     - `Include subdomains`: **On**
     - `Preload`: sadece tüm subdomainler HTTPS hazırsa **On**

8. **Always Use HTTPS**
   - Menü: `SSL/TLS -> Edge Certificates`
   - `Always Use HTTPS` = **On** (http istekleri otomatik https’e yönlenir).

