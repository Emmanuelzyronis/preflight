import { beforeEach, describe, expect, it } from 'vitest';
import { buildCalldata, NotImplementedError } from '../src/calldata/builder.js';
import { ActionType, type PrivacyAction } from '@preflight/shared-types';

const actions: PrivacyAction[] = [
  { type: ActionType.ShieldAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.PrivateTransferAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.UnshieldAction, token: '0x1', amount: '10', recipient: '0x2' },
  { type: ActionType.PrivateSwapAction, token: '0x1', amount: '10', recipient: '0x2', targetToken: '0x3', executor: '0x4' },
];

describe('calldata builder action fixtures', () => {
  beforeEach(() => { process.env.STRK20_POOL_ADDRESS = '0x123'; });

  it.each(actions)('handles $type through the Privacy SDK boundary', async (action) => {
    await expect(buildCalldata(action)).rejects.toBeInstanceOf(NotImplementedError);
  });
});
