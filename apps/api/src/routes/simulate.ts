import type { FastifyInstance } from 'fastify';

export async function simulateRoutes(app: FastifyInstance): Promise<void> {
  app.post('/simulate', async (_request, reply) => reply.code(501).send({ error: 'Not Implemented' }));
}
