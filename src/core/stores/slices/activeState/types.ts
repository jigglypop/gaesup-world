import { ActiveStateType } from '../../../motions/core/types';

export interface ActiveStateSlice {
  activeState: ActiveStateType;
  setActiveState: (state: Partial<ActiveStateType>) => void;
  updateActiveState: (update: Partial<ActiveStateType>) => void;
  resetActiveState: () => void;
}
