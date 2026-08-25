import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AccountInterface, Call, InvokeFunctionResponse } from 'starknet';
import { wrapAccount } from '../src/index.js';

function mockAccount(execute: (calls: Call | Call[]) => Promise<InvokeFunctionResponse>): AccountInterface {
  return { execute } as unknown as AccountInterface;
}

afterEach(() => vi.restoreAllMocks());

describe('wrapAccount', () => {
  it('simulates pool-bound calls before executing them', async () => {
    const events: string[] = [];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      events.push('simulate');
      return new Response(JSON.stringify({ gasEstimate: '0x1' }), { status: 200 });
    });
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const execute = vi.fn(async () => { events.push('execute'); return { transaction_hash: '0xabc' }; });
    const account = wrapAccount(mockAccount(execute), { apiBaseUrl: 'http://api.test', poolAddress: '0x123' });

    await account.execute({ contractAddress: '0x123', entrypoint: 'apply_actions', calldata: [] });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/report', expect.objectContaining({
      body: JSON.stringify({ calls: [{ contractAddress: '0x123', entrypoint: 'apply_actions', calldata: [] }], modeled: false }),
    }));
    expect(events).toEqual(['simulate', 'execute']);
    expect(console.log).toHaveBeenCalledWith('[Preflight]', { gasEstimate: '0x1' });
  });

  it('passes non-pool calls through without fetch side effects', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const execute = vi.fn(async () => ({ transaction_hash: '0xabc' }));
    const account = wrapAccount(mockAccount(execute), { apiBaseUrl: 'http://api.test', poolAddress: '0x123' });
    const call = { contractAddress: '0x456', entrypoint: 'transfer', calldata: [] };

    await account.execute(call);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(execute).toHaveBeenCalledWith(call);
  });
});
