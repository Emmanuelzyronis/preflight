import type { Call } from 'starknet';
import type { PrivacyAction } from '@preflight/shared-types';

export interface BuiltCalldata {
  calls: Call[];
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

export class NotImplementedError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'NotImplementedError';
  }
}

function poolAddress(): string {
  const value = process.env.STRK20_POOL_ADDRESS;
  if (!value || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new Error('STRK20_POOL_ADDRESS must be configured as a Starknet contract address');
  }
  return value;
}

/**
 * The upstream Privacy SDK currently compiles actions only in the context of
 * viewing keys, notes, proving, and discovery providers. Those are deliberately
 * absent from this read-only API boundary, so no calldata is fabricated here.
 * Day 2 callers receive an explicit error until those privacy inputs are wired.
 */
export async function buildCalldata(action: PrivacyAction): Promise<BuiltCalldata> {
  poolAddress();
  throw new NotImplementedError(
    `Privacy SDK calldata compilation for ${action.type} requires viewing/proving inputs; TODO: wire the provider-backed compiler`,
  );
}
