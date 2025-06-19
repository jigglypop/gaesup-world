import { ActiveStateType } from '../../../types/core';

export interface ActiveStateSlice {
  activeState: ActiveStateType;
  setActiveState: (state: Partial<ActiveStateType>) => void;
  updateActiveState: (update: Partial<ActiveStateType>) => void;
  resetActiveState: () => void;
}
