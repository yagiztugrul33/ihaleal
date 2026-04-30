#!/usr/bin/env node
/**
 * CI’da çalışır: PR için insan/harici ajan review öncesi kontrol listesi yazdırır.
 * Cursor Cloud Agent API anahtarı gerektirmez; çıkış kodu her zaman 0.
 */

const hints = `
╔══════════════════════════════════════════════════════════════╗
║  ihaleal.com — otomatik review / ön kontrol ipuçları (CI)    ║
╚══════════════════════════════════════════════════════════════╝

[Ürün]
  - fees.ts ile komisyon / üyelik metinleri tutarlı mı?
  - Demo veride bağlayıcı “garanti / lisanslı platform” iddiası yok mu?

[Frontend]
  - Yeni rota: App.tsx + seo.ts güncellendi mi?
  - HashRouter: dahili linkler #/ ile mi?

[Güvenlik]
  - localStorage anahtarları ve PII sızıntısı gözden geçirildi mi?
  - API anahtarı repoda düz metin değil mi?

Cursor Cloud Agent API veya harici LLM ile tam otomatik kod review için:
  GitHub Secrets’a CURSOR_API_KEY ekleyip Cursor dokümantasyonundaki beta API ile ayrı iş akışı tanımlanabilir.
`;

console.log(hints);
