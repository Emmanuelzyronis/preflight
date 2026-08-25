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
