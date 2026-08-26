import type { PrivacyAction, Strk20Diff } from './index.js';
export function buildStrk20Diff(action: PrivacyAction): Strk20Diff {
  const base=['token','amount','caller']; const privateFields=['note','channel','subchannel'];
  if (action.type==='ShieldAction' || action.type==='UnshieldAction') return { plainCallVisible:[...base,'recipient',...privateFields], strk20Visible:[...base,'recipient'] };
  if (action.type==='PrivateSwapAction') return { plainCallVisible:[...base,'recipient','targetToken','executor',...privateFields], strk20Visible:[...base,'recipient','targetToken','executor'] };
  return { plainCallVisible:[...base,'recipient',...privateFields], strk20Visible:[...base,'recipient'] };
}
