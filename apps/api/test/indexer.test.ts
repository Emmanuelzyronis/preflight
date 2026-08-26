import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { hash } from 'starknet';
import { createDatabasePool, ensureSchema } from '../src/indexer/db.js';
import { parseWithdrawalEvent, scanRange, type EventsProvider } from '../src/indexer/scanner.js';
import { createIndexerQueries, type IndexerQueries } from '../src/indexer/queries.js';
import type { Pool } from 'pg';

const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);
const poolAddress = '0x123';
const token = '0xabc';
const depositSelector = hash.getSelectorFromName('privacy::events::Deposit');
const withdrawalSelector = hash.getSelectorFromName('privacy::events::Withdrawal');

describe.skipIf(!hasDatabase)('indexer scanner and SQL queries', () => {
  let pool: Pool;
  let queries: IndexerQueries;
  const provider = {
    getEvents: async () => ({ events: [
      { keys: [depositSelector, '0x111', token], data: ['0x64'], block_number: 10, transaction_hash: '0xtx1', event_index: 0 },
      { keys: [withdrawalSelector, '0x222', token], data: ['0xaudit', '0xeph', '0xenc', '0x32'], block_number: 11, transaction_hash: '0xtx2', event_index: 1 },
    ] }),
    getBlock: async ({ block_number }: { block_number: number }) => ({ timestamp: 1_700_000_000 + block_number }),
    getBlockNumber: async () => 11,
  } as EventsProvider;

  beforeAll(async () => {
    process.env.STRK20_POOL_ADDRESS = poolAddress;
    pool = createDatabasePool(process.env.TEST_DATABASE_URL);
    await ensureSchema(pool);
    queries = createIndexerQueries(pool);
  });
  beforeEach(async () => {
    await pool.query('TRUNCATE pool_events, channel_counters, subchannel_counters, note_counters, nullifiers RESTART IDENTITY');
    await pool.query('UPDATE sync_state SET last_synced_block = 0 WHERE id = 1');
  });
  afterAll(async () => { await pool.end(); });

  it('parses public events and is idempotent', async () => {
    const first = await scanRange(pool, provider, 10, 11);
    const second = await scanRange(pool, provider, 10, 11);
    expect(first.inserted).toBe(2);
    expect(second.inserted).toBe(0);
    expect((await pool.query('SELECT count(*)::int AS count FROM pool_events')).rows[0].count).toBe(2);
  });

  it('maps withdrawal ABI fields in their declared order', () => {
    expect(parseWithdrawalEvent({
      keys: [withdrawalSelector, '0xto', token],
      data: ['0xaudit', '0xeph', '0xenc', '0x1234'],
      transaction_hash: '0xfixture',
    })).toEqual({
      toAddress: '0xto', token, auditorPublicKey: '0xaudit', ephemeralPubkey: '0xeph',
      encryptedUserAddress: '0xenc', amount: '4660',
    });
  });

  it('supports time-window, amount-tolerance, and counter queries', async () => {
    await scanRange(pool, provider, 10, 11);
    const since = new Date(1_700_000_000 * 1000);
    const until = new Date(1_700_000_020 * 1000);
    expect((await queries.getEventsInWindow(token, since, until)).length).toBe(2);
    expect((await queries.getEventsByAmount(token, '100', 100, since)).length).toBe(1);
    expect(await queries.getCounterSnapshot(token)).toEqual({ channels: 0, subchannels: 0, notes: 2 });
  });
});
