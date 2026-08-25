import type { FastifyInstance } from 'fastify';
import { isActionType, type PrivacyAction } from '@preflight/shared-types';
import { buildCalldata, buildModeledPreview, NotImplementedError } from '../calldata/builder.js';
import { simulateAction } from '../calldata/simulate.js';

export async function simulateRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: Partial<PrivacyAction> }>('/simulate', async (request, reply) => {
    const body = request.body;
    if (!body || !isActionType(body.type)) return reply.code(400).send({ error: 'Invalid action type' });
    if (typeof body.token !== 'string' || typeof body.amount !== 'string' || typeof body.recipient !== 'string') {
      return reply.code(400).send({ error: 'token, amount, and recipient are required' });
    }
    if (!/^0x[0-9a-fA-F]+$/.test(body.token) || !/^0x[0-9a-fA-F]+$/.test(body.recipient) || !/^\d+$/.test(body.amount)) {
      return reply.code(400).send({ error: 'Malformed address or amount' });
    }
    if (body.type === 'PrivateSwapAction') {
      if (typeof body.targetToken !== 'string' || typeof body.executor !== 'string') {
        return reply.code(400).send({ error: 'targetToken and executor are required for swaps' });
      }
      if (!/^0x[0-9a-fA-F]+$/.test(body.targetToken) || !/^0x[0-9a-fA-F]+$/.test(body.executor)) {
        return reply.code(400).send({ error: 'Malformed swap address' });
      }
    }
    try {
      const action = body as PrivacyAction;
      if (action.type !== 'ShieldAction') {
        const modeled = await buildModeledPreview(action);
        return { calldata: modeled, modeled: true, disclaimer: modeled.disclaimer };
      }
      const calldata = await buildCalldata(action);
      const simulation = await simulateAction(calldata);
      return { calldata, simulation, modeled: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Simulation failed';
      return reply.code(error instanceof NotImplementedError ? 501 : 500).send({ error: message });
    }
  });
}
