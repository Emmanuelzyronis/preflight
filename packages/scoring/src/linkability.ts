import type { LinkabilityFlag, PoolEvent } from './index.js';
export function checkAddressLinkability(fundingAddress: string, destinationAddress: string, recentEvents: PoolEvent[]): LinkabilityFlag {
  const f=fundingAddress.toLowerCase(), d=destinationAddress.toLowerCase(); const same=f===d;
  const fundingTxs=new Set(recentEvents.filter(e=>e.caller_address.toLowerCase()===f).map(e=>e.tx_hash).filter(Boolean));
  const prior=recentEvents.some(e=>e.caller_address.toLowerCase()===d && e.tx_hash!==undefined && fundingTxs.has(e.tx_hash));
  const reasons:string[]=[]; if(same) reasons.push('Funding and destination addresses are identical.'); if(prior) reasons.push('Destination is connected to prior public activity from the funding address.');
  return { sameAddressReuse:same, priorFundingConnection:prior, score:(same?60:0)+(prior?40:0), reasons };
}
