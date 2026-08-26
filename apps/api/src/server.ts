import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';
import { reportRoutes } from './routes/report.js';
import { simulateRoutes } from './routes/simulate.js';
import { createDatabasePool, ensureSchema } from './indexer/db.js';
import { startIndexerSync } from './indexer/sync.js';

export async function buildServer(): Promise<ReturnType<typeof Fastify>> {
  const app = Fastify({ logger: true });
  await app.register(healthRoutes);
  await app.register(simulateRoutes);
  await app.register(reportRoutes);
  return app;
}

const app = await buildServer();
const port = Number(process.env.PORT ?? 3001);
if (process.env.DATABASE_URL) {
  const indexerPool = createDatabasePool();
  void ensureSchema(indexerPool)
    .then(() => startIndexerSync(indexerPool))
    .catch((error: unknown) => console.error('[Indexer] startup failed', error));
}
await app.listen({ port, host: '0.0.0.0' });
