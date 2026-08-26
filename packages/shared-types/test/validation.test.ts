import { describe, expect, it } from 'vitest';
import { ActionType, validatePrivacyAction } from '../src/index.js';

describe('report action validation', () => {
  it('rejects an unshield without recipient at the boundary', () => {
    const result = validatePrivacyAction({ type: ActionType.UnshieldAction, token: '0x1', amount: '238' });
    expect(result).toEqual({ valid: false, field: 'recipient', message: 'recipient is required for withdraw actions' });
  });
});
