import { createDatabasePool, ensureSchema } from './db.js';

const pool = createDatabasePool();
try {
  await ensureSchema(pool);
  await pool.query('TRUNCATE pool_events, channel_counters, subchannel_counters, note_counters, nullifiers RESTART IDENTITY');
  await pool.query('UPDATE sync_state SET last_synced_block = 0 WHERE id = 1');
  console.info('[indexer] database reset complete');
} finally {
  await pool.end();
}
