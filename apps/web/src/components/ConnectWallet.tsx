import { useState } from 'react';
import type { AccountInterface } from 'starknet';
import { wrapAccount } from '@preflight/sdk-hook';

interface InjectedWallet { enable(): Promise<string[]>; account?: AccountInterface & { address: string } }
declare global { interface Window { starknet?: InjectedWallet } }

export function ConnectWallet({ onAddress, onAccount }: { onAddress(address: string): void; onAccount?(account: AccountInterface): void }) {
  const [status, setStatus] = useState('');
  const connect = async () => { try { const wallet = window.starknet; if (!wallet) throw new Error('Install a Starknet wallet extension first.'); const accounts = await wallet.enable(); const account = wallet.account; const address = account?.address ?? accounts[0]; if (!address) throw new Error('Wallet did not return an account.'); onAddress(address); setStatus(`${address.slice(0, 8)}…${address.slice(-6)}`); if (account && import.meta.env.VITE_STRK20_POOL_ADDRESS) onAccount?.(wrapAccount(account, { apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001', poolAddress: import.meta.env.VITE_STRK20_POOL_ADDRESS })); } catch (error) { setStatus(error instanceof Error ? error.message : 'Wallet connection failed'); } };
  return <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={connect} className="rounded-full border border-[#a3432b] px-4 py-2 font-semibold text-[#a3432b] hover:bg-[#fff1eb]">Connect wallet</button>{status && <span className="text-sm text-[#53665a]">{status}</span>}</div>;
}
