import type { AnonymitySetEstimate, PoolEvent } from './index.js';
export function estimateAnonymitySet(events: PoolEvent[], token: string, amount: bigint, windowMs: number, toleranceBps = 500): AnonymitySetEstimate {
  const now = events.length ? Math.max(...events.map(e => e.timestamp.getTime())) : Date.now();
  const inBand = (e: PoolEvent) => { if (e.token.toLowerCase() !== token.toLowerCase()) return false; if (Math.abs(BigInt(e.amount) - amount) * 10000n > amount * BigInt(toleranceBps)) return false; return true; };
  const count = (ms: number) => events.filter(e => inBand(e) && now - e.timestamp.getTime() <= ms).length;
  return { token, amount: amount.toString(), toleranceBps, within24h: count(windowMs || 86400000), within7d: count(Math.max(windowMs || 86400000, 7 * 86400000)) };
}
