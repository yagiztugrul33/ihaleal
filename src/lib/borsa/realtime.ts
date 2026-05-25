/**
 * Demo notu: Bu dosya yalnizca mock realtime akis kurar.
 * Canliya geciste WebSocket/Supabase realtime + cekirdek teklif/odeme katmani ile degistirilmelidir.
 */

export const REALTIME_INTEGRATION_NOTE =
  "Canli ortamda mock interval yerine WebSocket veya Supabase Realtime akisi kullanilmalidir.";

export function isOutbid(myBid: number | null | undefined, currentHighest: number): boolean {
  if (myBid == null || !Number.isFinite(myBid)) return false;
  return currentHighest > myBid;
}

export function createRealtimeMockInterval(onTick: () => void, intervalMs = 2500): () => void {
  const id = window.setInterval(() => {
    onTick();
  }, Math.max(500, intervalMs));
  return () => window.clearInterval(id);
}
