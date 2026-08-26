import type { Pool } from 'pg';
import { createDatabasePool } from './db.js';

export interface PoolEvent { id: number; event_key: string; token: string; amount: string; caller_address: string; block_number: number; timestamp: Date; tx_hash: string; event_index: number; event_type: 'deposit' | 'withdraw'; }

export interface IndexerQueries {
  getEventsInWindow(token: string, sinceTimestamp: Date, untilTimestamp: Date): Promise<PoolEvent[]>;
  getEventsByAmount(token: string, amount: string, toleranceBps: number, sinceTimestamp: Date): Promise<PoolEvent[]>;
  getCounterSnapshot(token: string): Promise<{ channels: number; subchannels: number; notes: number }>;
}

export function createIndexerQueries(pool: Pool): IndexerQueries {
  return {
    async getEventsInWindow(token, sinceTimestamp, untilTimestamp) {
      const result = await pool.query<PoolEvent>('SELECT * FROM pool_events WHERE token = $1 AND timestamp >= $2 AND timestamp <= $3 ORDER BY timestamp, id', [token, sinceTimestamp, untilTimestamp]);
      return result.rows;
    },
    async getEventsByAmount(token, amount, toleranceBps, sinceTimestamp) {
      if (!Number.isInteger(toleranceBps) || toleranceBps < 0 || toleranceBps > 10000) throw new Error('toleranceBps must be an integer from 0 to 10000');
      const result = await pool.query<PoolEvent>(
        `SELECT * FROM pool_events WHERE token = $1 AND timestamp >= $2
         AND amount BETWEEN ($3::numeric * (10000 - $4) / 10000) AND ($3::numeric * (10000 + $4) / 10000)
         ORDER BY timestamp, id`,
        [token, sinceTimestamp, amount, toleranceBps],
      );
      return result.rows;
    },
    async getCounterSnapshot(token) {
      const [channels, subchannels, notes] = await Promise.all([
        pool.query<{ count: string }>('SELECT count FROM channel_counters WHERE token = $1', [token]),
        pool.query<{ count: string }>('SELECT count FROM subchannel_counters WHERE token = $1', [token]),
        pool.query<{ count: string }>('SELECT count FROM note_counters WHERE token = $1', [token]),
      ]);
      return { channels: Number(channels.rows[0]?.count ?? 0), subchannels: Number(subchannels.rows[0]?.count ?? 0), notes: Number(notes.rows[0]?.count ?? 0) };
    },
  };
}

let defaultQueries: IndexerQueries | undefined;
function queries(): IndexerQueries { return defaultQueries ??= createIndexerQueries(createDatabasePool()); }

export const getEventsInWindow: IndexerQueries['getEventsInWindow'] = (...args) => queries().getEventsInWindow(...args);
export const getEventsByAmount: IndexerQueries['getEventsByAmount'] = (...args) => queries().getEventsByAmount(...args);
export const getCounterSnapshot: IndexerQueries['getCounterSnapshot'] = (...args) => queries().getCounterSnapshot(...args);
