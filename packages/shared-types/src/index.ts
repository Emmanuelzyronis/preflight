export enum ActionType {
  ShieldAction = 'ShieldAction',
  PrivateTransferAction = 'PrivateTransferAction',
  UnshieldAction = 'UnshieldAction',
  PrivateSwapAction = 'PrivateSwapAction',
}

export interface ShieldAction {
  type: ActionType.ShieldAction;
  token: string;
  amount: string;
  recipient: string;
}

export interface PrivateTransferAction {
  type: ActionType.PrivateTransferAction;
  token: string;
  amount: string;
  recipient: string;
}

export interface UnshieldAction {
  type: ActionType.UnshieldAction;
  token: string;
  amount: string;
  recipient: string;
}

export interface PrivateSwapAction {
  type: ActionType.PrivateSwapAction;
  token: string;
  amount: string;
  recipient: string;
  targetToken: string;
  executor: string;
}

export type PrivacyAction =
  | ShieldAction
  | PrivateTransferAction
  | UnshieldAction
  | PrivateSwapAction;

export function isActionType(value: unknown): value is ActionType {
  return typeof value === 'string' && Object.values(ActionType).includes(value as ActionType);
}

export type ActionValidation = { valid: true; action: PrivacyAction } | { valid: false; field: string; message: string };

export function validatePrivacyAction(value: unknown): ActionValidation {
  if (!value || typeof value !== 'object') return { valid: false, field: 'action', message: 'action is required' };
  const input = value as Record<string, unknown>;
  if (!isActionType(input.type)) return { valid: false, field: 'type', message: 'type is required and must be a supported action' };
  if (typeof input.token !== 'string' || !input.token) return { valid: false, field: 'token', message: 'token is required' };
  if (typeof input.amount !== 'string' || !/^\d+$/.test(input.amount)) return { valid: false, field: 'amount', message: 'amount must be an integer string' };
  if (typeof input.recipient !== 'string' || !input.recipient) {
    return { valid: false, field: 'recipient', message: input.type === ActionType.UnshieldAction ? 'recipient is required for withdraw actions' : 'recipient is required' };
  }
  if (input.type === ActionType.PrivateSwapAction) {
    if (typeof input.targetToken !== 'string' || !input.targetToken) return { valid: false, field: 'targetToken', message: 'targetToken is required for swap actions' };
    if (typeof input.executor !== 'string' || !input.executor) return { valid: false, field: 'executor', message: 'executor is required for swap actions' };
  }
  return { valid: true, action: input as unknown as PrivacyAction };
}
