import type { CorrelationRisk, PoolEvent } from './index.js';
const DECIMALS: Record<string, number> = { strk: 18, eth: 18, usdc: 6 };
// Unknown assets default to Starknet's common 18-decimal convention.
const decimals = (token: string) => DECIMALS[token.toLowerCase()] ?? 18;
const normalized = (e: PoolEvent) => { const d = decimals(e.token); return Number(BigInt(e.amount)) / 10 ** d; };
export function scoreCorrelationRisk(target: PoolEvent, candidateEvents: PoolEvent[]): CorrelationRisk {
  const reasons = [] as CorrelationRisk['reasons']; const t = target.timestamp.getTime(); const ta = normalized(target);
  const match = candidateEvents.find(e => e.event_type !== target.event_type && Math.abs(normalized(e)-ta) <= Math.max(ta*0.000001, 1e-12) && Math.abs(e.timestamp.getTime()-t) <= 3600000);
  if (match) reasons.push({ code:'exact-amount', score:40, reasoning:'A deposit and withdrawal use the same normalized amount within one hour.' });
  const d = decimals(target.token); if (BigInt(target.amount) % (10n ** BigInt(d)) === 0n) reasons.push({ code:'round-amount', score:15, reasoning:'Amount is a clean whole-token multiple and can fingerprint activity.' });
  if (match) { const gap = Math.abs(match.timestamp.getTime()-t); const score = Math.round(30 * (1 - Math.min(gap,3600000)/3600000)); reasons.push({ code:'latency', score, reasoning:`Short ${Math.round(gap/1000)} second deposit-to-withdraw gap increases timing correlation risk.` }); }
  const burst = candidateEvents.filter(e => e.caller_address.toLowerCase()===target.caller_address.toLowerCase() && e.token.toLowerCase()===target.token.toLowerCase() && normalized(e)===ta && Math.abs(e.timestamp.getTime()-t)<=900000).length;
  if (burst > 1) reasons.push({ code:'same-source-burst', score:15, reasoning:`${burst} same-source, same-amount actions occurred within 15 minutes.` });
  return { score: Math.min(100, reasons.reduce((s,r)=>s+r.score,0)), reasons };
}
