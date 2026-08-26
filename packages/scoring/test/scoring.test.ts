import { describe, expect, it } from 'vitest';
import { estimateAnonymitySet, scoreCorrelationRisk, checkAddressLinkability, buildStrk20Diff, scoreRepeatedUseDecay, type PoolEvent } from '../src/index.js';
import { ActionType } from '@preflight/shared-types';

const event = (overrides: Partial<PoolEvent> = {}): PoolEvent => ({ token:'STRK', amount:'1000000000000000000', caller_address:'0xa', timestamp:new Date('2026-01-07T00:00:00Z'), event_type:'deposit', ...overrides });
describe('scoring', () => {
  it('counts distinct 24h and 7d windows', () => { const e=[event(),event({timestamp:new Date('2026-01-06T12:00:00Z')}),event({timestamp:new Date('2026-01-03T00:00:00Z')}),event({timestamp:new Date('2025-12-20T00:00:00Z')})]; const estimate=estimateAnonymitySet(e,'STRK',1000000000000000000n,7*86400000); expect(estimate.within24h).toBe(2); expect(estimate.within7d).toBe(3); });
  it('scores exact match and burst, but normalizes token decimals', () => { const t=event({event_type:'deposit'}); const w=event({event_type:'withdraw',timestamp:new Date('2026-01-07T00:05:00Z')}); expect(scoreCorrelationRisk(t,[w]).score).toBeGreaterThan(0); const usdc=event({token:'USDC',amount:'1000000'}); expect(scoreCorrelationRisk(usdc,[event({token:'STRK',amount:'1000000',event_type:'withdraw'})]).reasons.some(r=>r.code==='exact-amount')).toBe(false); });
  it('flags address reuse and prior connection', () => { const r=checkAddressLinkability('0xa','0xa',[event({caller_address:'0xa',tx_hash:'0x1'})]); expect(r.score).toBe(100); });
  it('builds visibility diff', () => { const d=buildStrk20Diff({type:ActionType.PrivateTransferAction,token:'STRK',amount:'1',recipient:'0xb'}); expect(d.plainCallVisible).toContain('note'); expect(d.strk20Visible).not.toContain('note'); });
  it('warns on repeated cadence and round amounts', () => { const h=[event({amount:'1000'}),event({amount:'2000',timestamp:new Date('2026-01-07T00:10:00Z')}),event({amount:'3000',timestamp:new Date('2026-01-07T00:20:00Z')})]; expect(scoreRepeatedUseDecay(h)).not.toBeNull(); });
});
