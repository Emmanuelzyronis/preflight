import type { FastifyInstance } from 'fastify';

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { calls?: unknown; modeled?: unknown } }>('/report', async (request, reply) => {
    if (request.body?.modeled !== false || !Array.isArray(request.body.calls)) {
      return reply.code(400).send({ error: 'Expected { calls: Call[], modeled: false }' });
    }
    return {
      modeled: false,
      calls: request.body.calls,
      message: 'Exact wallet-built calldata received for privacy analysis.',
    };
  });
}
