import type { FastifyInstance } from 'fastify';
import { validatePrivacyAction, type PrivacyAction } from '@preflight/shared-types';
import { estimateAnonymitySet, scoreCorrelationRisk, checkAddressLinkability, buildStrk20Diff, scoreRepeatedUseDecay, type PoolEvent } from '@preflight/scoring';
import { getEventsInWindow } from '../indexer/queries.js';

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { action?: Partial<PrivacyAction>; fundingAddress?: string; destinationAddress?: string; sessionHistory?: PoolEvent[]; calls?: unknown; modeled?: unknown } }>('/report', async (request, reply) => {
    const body = request.body;
    const validation = validatePrivacyAction(body?.action ?? body);
    if (!validation.valid) return reply.code(400).send({ error: validation.message, field: validation.field });
    const action: PrivacyAction = validation.action;
    const now = Date.now();
    try {
      const events24h = await getEventsInWindow(action.token, new Date(now - 86400000), new Date(now));
      const events7d = await getEventsInWindow(action.token, new Date(now - 7 * 86400000), new Date(now));
      const target: PoolEvent = { token: action.token, amount: action.amount, caller_address: body.fundingAddress ?? '', timestamp: new Date(now), event_type: action.type === 'UnshieldAction' ? 'withdraw' : 'deposit' };
      const history = (body.sessionHistory ?? []).map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
      const estimate24h = estimateAnonymitySet(events24h, action.token, BigInt(action.amount), 86400000);
      const estimate7d = estimateAnonymitySet(events7d, action.token, BigInt(action.amount), 7 * 86400000);
      return { modeled: false, action, anonymitySet: { ...estimate7d, within24h: estimate24h.within24h, within7d: estimate7d.within7d }, correlation: scoreCorrelationRisk(target, events7d), linkability: checkAddressLinkability(body.fundingAddress ?? '', body.destinationAddress ?? action.recipient, events7d), diff: buildStrk20Diff(action), decay: scoreRepeatedUseDecay(history) };
    } catch (error) {
      return reply.code(503).send({ error: error instanceof Error ? error.message : 'Indexer unavailable' });
    }
  });
}
