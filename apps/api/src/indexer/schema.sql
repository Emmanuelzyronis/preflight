CREATE TABLE IF NOT EXISTS pool_events (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  caller_address TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  tx_hash TEXT NOT NULL,
  event_index INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('deposit', 'withdraw')),
  CONSTRAINT pool_events_tx_event_unique UNIQUE (tx_hash, event_index)
);

CREATE INDEX IF NOT EXISTS pool_events_token_timestamp_idx ON pool_events (token, timestamp);
CREATE INDEX IF NOT EXISTS pool_events_token_amount_idx ON pool_events (token, amount);

CREATE TABLE IF NOT EXISTS channel_counters (
  token TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  last_synced_block BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS subchannel_counters (
  token TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  last_synced_block BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS note_counters (
  token TEXT PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  last_synced_block BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS nullifiers (
  nullifier_hash TEXT PRIMARY KEY,
  block_number BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_synced_block BIGINT NOT NULL DEFAULT 0
);

INSERT INTO sync_state (id, last_synced_block) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;
