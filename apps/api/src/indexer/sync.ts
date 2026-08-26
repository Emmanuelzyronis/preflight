import { RpcProvider } from 'starknet';
import type { Pool } from 'pg';
import { scanRange, type EventsProvider } from './scanner.js';

export interface SyncHandle {
  stop: () => void;
  syncOnce: () => Promise<void>;
}

export function startIndexerSync(pool: Pool): SyncHandle {
  const rpcUrl = process.env.RPC_URL;
  const intervalMs = Number(process.env.SYNC_INTERVAL_MS ?? 60000);

  let timer: ReturnType<typeof setInterval> | undefined;
  let running = false;

  const provider = rpcUrl
    ? (new RpcProvider({ nodeUrl: rpcUrl }) as unknown as EventsProvider)
    : undefined;

  const syncOnce = async (): Promise<void> => {
    if (!provider) {
      throw new Error('RPC_URL must be configured for indexer sync');
    }

    const latest = await provider.getBlockNumber();

    const state = await pool.query<{ last_synced_block: string }>(
      'SELECT last_synced_block FROM sync_state WHERE id = 1',
    );

    const checkpoint = Number(state.rows[0]?.last_synced_block ?? 0);
    const configuredStart = Number(
      process.env.INDEXER_START_BLOCK ?? Math.max(0, latest - 1000),
    );

    const from = checkpoint > 0 ? checkpoint + 1 : configuredStart;

    if (from <= latest) {
      await scanRange(pool, provider, from, latest);
    }
  };

  const run = () => {
    if (running) {
      console.info('[indexer] sync already in progress; skipping interval tick');
      return;
    }

    running = true;

    void syncOnce()
      .catch((error: unknown) => console.error('[indexer] sync failed', error))
      .finally(() => {
        running = false;
      });
  };

  timer = setInterval(run, intervalMs);
  run();

  return {
    stop: () => {
      if (timer) clearInterval(timer);
    },
    syncOnce,
  };
}
