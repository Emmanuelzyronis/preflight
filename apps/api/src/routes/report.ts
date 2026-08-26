import type { FastifyInstance } from 'fastify';
import { isActionType, type PrivacyAction } from '@preflight/shared-types';
import { estimateAnonymitySet, scoreCorrelationRisk, checkAddressLinkability, buildStrk20Diff, scoreRepeatedUseDecay, type PoolEvent } from '@preflight/scoring';
import { getEventsInWindow } from '../indexer/queries.js';

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { action?: Partial<PrivacyAction>; fundingAddress?: string; destinationAddress?: string; sessionHistory?: PoolEvent[]; calls?: unknown; modeled?: unknown } }>('/report', async (request, reply) => {
    const body = request.body;
    const raw = body?.action ?? body;
    if (!raw || !isActionType((raw as { type?: unknown }).type) || typeof (raw as { token?: unknown }).token !== 'string' || typeof (raw as { amount?: unknown }).amount !== 'string') {
      return reply.code(400).send({ error: 'Expected action with type, token, and amount' });
    }
    const action = raw as PrivacyAction;
    if (!/^\d+$/.test(action.amount)) return reply.code(400).send({ error: 'amount must be an integer string' });
    const now = Date.now();
    try {
      const events = await getEventsInWindow(action.token, new Date(now - 7 * 86400000), new Date(now));
      const target: PoolEvent = { token: action.token, amount: action.amount, caller_address: body.fundingAddress ?? '', timestamp: new Date(now), event_type: action.type === 'UnshieldAction' ? 'withdraw' : 'deposit' };
      const history = (body.sessionHistory ?? []).map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
      return { modeled: false, action, anonymitySet: estimateAnonymitySet(events, action.token, BigInt(action.amount), 86400000), correlation: scoreCorrelationRisk(target, events), linkability: checkAddressLinkability(body.fundingAddress ?? '', body.destinationAddress ?? action.recipient, events), diff: buildStrk20Diff(action), decay: scoreRepeatedUseDecay(history) };
    } catch (error) {
      return reply.code(503).send({ error: error instanceof Error ? error.message : 'Indexer unavailable' });
    }
  });
}
