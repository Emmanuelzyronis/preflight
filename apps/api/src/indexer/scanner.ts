import { hash } from 'starknet';
import type { Pool } from 'pg';
import { withTransaction } from './db.js';

export interface RawEvent {
  keys: string[];
  data: string[];
  block_number?: number;
  block_hash?: string;
  transaction_hash: string;
  event_index?: number;
}

export interface EventsProvider {
  getEvents: (params: { address: string; from_block: { block_number: number }; to_block: { block_number: number }; chunk_size: number }) => Promise<{ events: RawEvent[] }>;
  getBlock: (blockIdentifier: { block_number: number }) => Promise<{ timestamp: number }>;
  getBlockNumber: () => Promise<number>;
}

export interface ScanResult { scanned: number; inserted: number; lastBlock: number; }

const selectors = (name: string): Set<string> => new Set([hash.getSelectorFromName(name), hash.getSelectorFromName(`privacy::events::${name}`)]);
const DEPOSIT_SELECTORS = selectors('Deposit');
const WITHDRAW_SELECTORS = selectors('Withdrawal');
const NOTE_USED_SELECTORS = selectors('NoteUsed');

function felt(value: string | undefined): string {
  if (!value) throw new Error('Malformed Starknet event: missing felt');
  return value;
}

function amount(value: string | undefined): string {
  const parsed = BigInt(felt(value));
  if (parsed < 0n) throw new Error('Malformed Starknet event: negative amount');
  return parsed.toString();
}

export async function scanRange(pool: Pool, provider: EventsProvider, fromBlock: number, toBlock: number): Promise<ScanResult> {
  const address = process.env.STRK20_POOL_ADDRESS;
  if (!address) throw new Error('STRK20_POOL_ADDRESS must be configured for the indexer');
  if (toBlock < fromBlock) return { scanned: 0, inserted: 0, lastBlock: fromBlock - 1 };
  const response = await provider.getEvents({ address, from_block: { block_number: fromBlock }, to_block: { block_number: toBlock }, chunk_size: 1000 });
  const blockTimestamps = new Map<number, Date>();
  let inserted = 0;
  await withTransaction(pool, async (client) => {
    for (const [index, event] of response.events.entries()) {
      const block = event.block_number ?? toBlock;
      const timestamp = blockTimestamps.get(block) ?? new Date((await provider.getBlock({ block_number: block })).timestamp * 1000);
      blockTimestamps.set(block, timestamp);
      const selector = event.keys[0];
      if (DEPOSIT_SELECTORS.has(selector) || WITHDRAW_SELECTORS.has(selector)) {
        const isDeposit = DEPOSIT_SELECTORS.has(selector);
        const token = felt(event.keys[isDeposit ? 2 : 2]);
        const caller = felt(event.keys[1]);
        const eventIndex = event.event_index ?? index;
        const result = await client.query(
          `INSERT INTO pool_events (event_key, token, amount, caller_address, block_number, timestamp, tx_hash, event_index, event_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (event_key) DO NOTHING`,
          [`${event.transaction_hash}:${eventIndex}`, token, amount(event.data[0]), caller, block, timestamp, event.transaction_hash, eventIndex, isDeposit ? 'deposit' : 'withdraw'],
        );
        inserted += result.rowCount ?? 0;
        if ((result.rowCount ?? 0) > 0) {
          await client.query(
            `INSERT INTO note_counters (token, count, last_synced_block) VALUES ($1, 1, $2)
             ON CONFLICT (token) DO UPDATE SET count = note_counters.count + EXCLUDED.count, last_synced_block = GREATEST(note_counters.last_synced_block, EXCLUDED.last_synced_block)`,
            [token, block],
          );
        }
      } else if (NOTE_USED_SELECTORS.has(selector)) {
        const eventIndex = event.event_index ?? index;
        await client.query(
          `INSERT INTO nullifiers (nullifier_hash, block_number, timestamp) VALUES ($1,$2,$3) ON CONFLICT (nullifier_hash) DO NOTHING`,
          [felt(event.keys[1]), block, timestamp],
        );
      }
    }
    await client.query('UPDATE sync_state SET last_synced_block = GREATEST(last_synced_block, $1) WHERE id = 1', [toBlock]);
  });
  return { scanned: response.events.length, inserted, lastBlock: toBlock };
}
