import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { reportRoutes } from './routes/report.js';
import { simulateRoutes } from './routes/simulate.js';
import { createDatabasePool, ensureSchema } from './indexer/db.js';
import { startIndexerSync } from './indexer/sync.js';

export async function buildServer(): Promise<ReturnType<typeof Fastify>> {
  const app = Fastify({ logger: true });
  const configuredOrigins = (process.env.WEB_ORIGINS ?? process.env.WEB_ORIGIN ?? 'http://localhost:5173')
    .split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
  await app.register(cors, {
    origin: (origin, callback) => {
      // Requests without an Origin header (curl, health checks) remain allowed.
      if (!origin || configuredOrigins.includes(origin.replace(/\/$/, '')) ||
          (process.env.ALLOW_CODESPACES_ORIGINS === 'true' && /^https:\/\/[-a-z0-9]+-5173\.app\.github\.dev$/i.test(origin))) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  });
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
