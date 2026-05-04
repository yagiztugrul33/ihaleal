# Realtime Servisi

## Amaç
Canlı ihale akışı, fiyat güncellemeleri, Hemen Al kilit bildirimleri ve genel realtime event altyapısı. WebSocket + SSE hibrit modeli kullanır: WebSocket bidirectional, SSE server-to-client fallback.

## İlgili Fasıl
- Fasıl 6 — WebSocket/SSE Canlı İhale, Anti-Sniper Geri Sayım

## Dosya Yapısı

```
realtime/
├── README.md
├── index.ts
├── WebSocketClient.ts       # Socket.io-client yönetimi (bağlantı, reconnect, heartbeat)
├── SSEClient.ts             # Server-Sent Events fallback (WebSocket kapalıyken)
├── AuctionSync.ts           # İhale state senkronizasyonu (client-server clock drift)
├── CountdownEngine.ts       # Anti-sniper geri sayım + uzatma mantığı
├── EventBus.ts              # Uygulama içi event yayını (bidding, price update)
├── ConnectionMonitor.ts     # NetInfo + bağlantı durumu yönetimi
└── types.ts
```

## WebSocket Event Katalogu

### Client → Server
| Event | Payload | Açıklama |
|-------|---------|----------|
| `subscribe_auction` | `{ auctionId }` | İhale kanalına abone ol |
| `unsubscribe_auction` | `{ auctionId }` | İhale kanalından ayrıl |
| `bid_attempt` | `{ auctionId, amount, clientTimestamp }` | Teklif dene |
| `ping` | `{ clientTime }` | Heartbeat + latency ölçüm |

### Server → Client
| Event | Payload | Açıklama |
|-------|---------|----------|
| `bid_accepted` | `{ bidId, newPrice, position }` | Teklif kabul edildi |
| `bid_rejected` | `{ reason }` | Teklif reddedildi |
| `countdown_sync` | `{ secondsRemaining, serverTime }` | Geri sayım senkronizasyonu |
| `auction_extended` | `{ newDeadline, reason }` | Anti-sniper uzatma |
| `buy_now_locked` | `{ listingId, lockedBy, expiresAt }` | Hemen Al kilitlendi |
| `price_drop` | `{ listingId, oldPrice, newPrice }` | Fiyat düştü |
| `pong` | `{ serverTime, latency }` | Heartbeat yanıtı |

## Anti-Sniper Mekanizması

```typescript
function shouldExtendDeadline(auction: Auction, bid: Bid): boolean {
  const secondsRemaining = (auction.deadline - now) / 1000;
  const isLastMinute = secondsRemaining <= 120; // Son 2 dakika
  const extensionCount = auction.extensionCount || 0;
  const maxExtensions = 3;
  
  if (isLastMinute && extensionCount < maxExtensions) {
    auction.deadline += 300000; // +5 dakika
    auction.extensionCount += 1;
    return true;
  }
  return false;
}
```

## Kritik Kurallar

1. **Client-Server Saat Senkronizasyonu:** Cihaz saati yanlış ayarlanmışsa geri sayım hatalı görünür. Her WebSocket bağlantısında server timestamp alınır, drift hesaplanır. Geri sayım `serverTime - currentServerTime` üzerinden hesaplanır.
2. **Reconnect Stratejisi:**
   - 1. deneme: hemen
   - 2-3: 2sn, 5sn exponential backoff
   - 4+: 30sn sabit
   - 10+ deneme: SSE fallback'e geç
3. **Background Mode:** Uygulama background'a atıldığında WebSocket bağlantısı `disconnect` edilmez, `pause` edilir. Native iOS/Android background task ile ihale sonuç bildirimi alınır.
4. **Race Condition:** Aynı auction'a birden fazla tab'da abone olunursa tek bağlantı, multiplexed kanallar kullanılır.

## Bağımlılıklar
- `core/security` — Challenge imzalı teklifler
- `features/buy_it_now` — `buy_now_locked` event handler

## Test Senaryoları
1. İhale son 2dk → teklif → geri sayım 5dk uzar
2. WebSocket kopması → 10sn içinde reconnect → state sync
3. Cihaz saati -5dk → server countdown override çalışır
4. 3 tab aynı ihale → tek WS bağlantısı, 3 listener
