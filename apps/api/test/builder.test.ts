import { beforeEach, describe, expect, it } from 'vitest';
import { buildCalldata, buildModeledPreview, NotImplementedError } from '../src/calldata/builder.js';
import { ActionType, type PrivacyAction } from '@preflight/shared-types';

const actions: PrivacyAction[] = [
  { type: ActionType.ShieldAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.PrivateTransferAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.UnshieldAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.PrivateSwapAction, token: '0x1', amount: '10', recipient: '0x2', targetToken: '0x3', executor: '0x4' },
];

describe('calldata builder action fixtures', () => {
  beforeEach(() => { process.env.STRK20_POOL_ADDRESS = '0x123'; });

  it('builds a real-shaped shield transfer call', async () => {
    const result = await buildCalldata(actions[0]);
    expect(result.calls[0]).toEqual({ contractAddress: '0x1', entrypoint: 'transfer', calldata: ['0x123', '0xa', '0x0'] });
    expect(result.contractAddress).toBe('0x123');
  });

  it.each(actions.slice(1))('keeps $type out of server calldata compilation', async (action) => {
    await expect(buildCalldata(action)).rejects.toBeInstanceOf(NotImplementedError);
    const preview = await buildModeledPreview(action);
    expect(preview.modeled).toBe(true);
    expect(preview.disclaimer.length).toBeGreaterThan(0);
  });
});
