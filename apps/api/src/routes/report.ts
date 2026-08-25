import type { FastifyInstance } from 'fastify';

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.get('/report', async (_request, reply) => reply.code(501).send({ error: 'Not Implemented' }));
}
