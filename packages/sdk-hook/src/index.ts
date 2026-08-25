import type { AccountInterface, Call } from 'starknet';

export interface WrapAccountOptions {
  apiBaseUrl: string;
  poolAddress?: string;
}

function callsFromInput(input: Call | Call[]): Call[] {
  return Array.isArray(input) ? input : [input];
}

function touchesPool(input: unknown, poolAddress: string): input is Call | Call[] {
  if (!Array.isArray(input) && typeof input !== 'object') return false;
  const calls = callsFromInput(input as Call | Call[]);
  return calls.some((call) => call.contractAddress.toLowerCase() === poolAddress.toLowerCase());
}

/**
 * Wrap Account.execute so pool-bound calls are simulated before signing.
 * This wrapper never signs, broadcasts, or imports code from an application.
 */
export function wrapAccount(account: AccountInterface, options: WrapAccountOptions): AccountInterface {
  const environmentPool = typeof process === 'undefined' ? undefined : process.env.STRK20_POOL_ADDRESS;
  const poolAddress = options.poolAddress ?? environmentPool;
  if (!poolAddress) throw new Error('A STRK20 pool address is required to wrap an account');

  const wrapped = Object.create(account) as AccountInterface & {
    execute: AccountInterface['execute'];
  };
  const originalExecute = account.execute.bind(account);
  wrapped.execute = (async (...args: unknown[]) => {
    const calls = args[0];
    if (touchesPool(calls, poolAddress)) {
      const response = await fetch(`${options.apiBaseUrl.replace(/\/$/, '')}/simulate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ calls }),
      });
      const report: unknown = await response.json();
      console.log('[Preflight]', report);
    }
    return originalExecute(...(args as Parameters<AccountInterface['execute']>));
  }) as AccountInterface['execute'];
  return wrapped;
}
