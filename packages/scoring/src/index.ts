import type { PrivacyAction, ShieldAction, PrivateTransferAction, UnshieldAction, PrivateSwapAction } from '@preflight/shared-types';

export interface PoolEvent { id?: number; event_key?: string; token: string; amount: string; caller_address: string; timestamp: Date; event_type: 'deposit' | 'withdraw'; tx_hash?: string; block_number?: number; }
export interface AnonymitySetEstimate { token: string; amount: string; toleranceBps: number; within24h: number; within7d: number; }
export interface CorrelationReason { code: string; score: number; reasoning: string; }
export interface CorrelationRisk { score: number; reasons: CorrelationReason[]; }
export interface LinkabilityFlag { sameAddressReuse: boolean; priorFundingConnection: boolean; score: number; reasons: string[]; }
export interface Strk20Diff { plainCallVisible: string[]; strk20Visible: string[]; }
export interface DecayWarning { score: number; reasons: string[]; pattern: { sameCounterparty: boolean; sameRoundAmount: boolean; sameCadence: boolean } }
export interface PrivacyReport { action: PrivacyAction; anonymitySet: AnonymitySetEstimate; correlation: CorrelationRisk; linkability: LinkabilityFlag; diff: Strk20Diff; decay: DecayWarning | null; }
export { estimateAnonymitySet } from './anonymity-set.js';
export { scoreCorrelationRisk } from './correlation.js';
export { checkAddressLinkability } from './linkability.js';
export { buildStrk20Diff } from './diff.js';
export { scoreRepeatedUseDecay } from './decay.js';
export type { PrivacyAction, ShieldAction, PrivateTransferAction, UnshieldAction, PrivateSwapAction };
