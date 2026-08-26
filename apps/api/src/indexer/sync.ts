import { RpcProvider } from 'starknet';
import type { Pool } from 'pg';
import { scanRange, type EventsProvider } from './scanner.js';

export interface SyncHandle { stop: () => void; syncOnce: () => Promise<void>; }

export function startIndexerSync(pool: Pool): SyncHandle {
  const rpcUrl = process.env.RPC_URL;
  const intervalMs = Number(process.env.SYNC_INTERVAL_MS ?? 60000);
  let timer: ReturnType<typeof setInterval> | undefined;
  const provider = rpcUrl ? new RpcProvider({ nodeUrl: rpcUrl }) as unknown as EventsProvider : undefined;
  const syncOnce = async (): Promise<void> => {
    if (!provider) throw new Error('RPC_URL must be configured for indexer sync');
    const latest = await provider.getBlockNumber();
    const state = await pool.query<{ last_synced_block: string }>('SELECT last_synced_block FROM sync_state WHERE id = 1');
    const from = Number(state.rows[0]?.last_synced_block ?? 0) + 1;
    if (from <= latest) await scanRange(pool, provider, from, latest);
  };
  const run = () => { void syncOnce().catch((error: unknown) => console.error('[Indexer] sync failed', error)); };
  timer = setInterval(run, intervalMs);
  run();
  return { stop: () => { if (timer) clearInterval(timer); }, syncOnce };
}
