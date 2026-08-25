import { CallData, type Call } from 'starknet';
import type { PrivacyAction } from '@preflight/shared-types';

export interface BuiltCalldata {
  calls: Call[];
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
  senderAddress?: string;
  transactionCalldata?: string[];
}

export interface ModeledPreview extends BuiltCalldata {
  modeled: true;
  disclaimer: string;
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

function amountCalldata(amount: string): string[] {
  const value = BigInt(amount);
  const lowMask = (1n << 128n) - 1n;
  return [`0x${(value & lowMask).toString(16)}`, `0x${(value >> 128n).toString(16)}`];
}

/** Build the public ERC-20 deposit leg. No viewing key or wallet secret is used. */
export async function buildCalldata(action: PrivacyAction): Promise<BuiltCalldata> {
  if (action.type !== 'ShieldAction') {
    throw new NotImplementedError(
      `${action.type} calldata is wallet-built by @preflight/sdk-hook; use buildModeledPreview() for manual mode`,
    );
  }
  const pool = poolAddress();
  const calldata = [pool, ...amountCalldata(action.amount)];
  const call: Call = { contractAddress: action.token, entrypoint: 'transfer', calldata };
  const transactionCalldata = CallData.compile({
    orderCalls: [{
      contractAddress: action.token,
      entrypoint: 'transfer',
      calldata,
    }],
  });
  return {
    calls: [call],
    contractAddress: pool,
    entrypoint: call.entrypoint,
    calldata,
    senderAddress: action.recipient,
    transactionCalldata,
  };
}

export async function buildModeledPreview(action: PrivacyAction): Promise<ModeledPreview> {
  if (action.type === 'ShieldAction') {
    throw new Error('ShieldAction must use buildCalldata()');
  }
  const pool = poolAddress();
  const calldata = [action.recipient, ...amountCalldata(action.amount)];
  const call: Call = {
    contractAddress: pool,
    entrypoint: action.type === 'PrivateSwapAction' ? 'privacy_invoke' : action.type === 'UnshieldAction' ? 'withdraw' : 'transfer',
    calldata,
  };
  return {
    calls: [call],
    contractAddress: pool,
    entrypoint: call.entrypoint,
    calldata,
    modeled: true,
    disclaimer: 'This is a representative preview, not your real transaction shape. Connect a wallet for an exact analysis.',
  };
}
