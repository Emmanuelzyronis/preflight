import { Client } from 'pg';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl) {
  const target = new URL(testDatabaseUrl);
  const databaseName = target.pathname.slice(1);
  if (!databaseName) throw new Error('TEST_DATABASE_URL must include a database name');
  target.pathname = '/postgres';
  const client = new Client({ connectionString: target.toString() });
  await client.connect();
  try {
    const exists = await client.query<{ exists: boolean }>('SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists', [databaseName]);
    if (!exists.rows[0]?.exists) {
      await client.query(`CREATE DATABASE "${databaseName.split('"').join('""')}"`);
    }
  } finally {
    await client.end();
  }
}
