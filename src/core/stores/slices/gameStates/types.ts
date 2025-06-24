import { GameStatesType } from '../../../world/components/Rideable/types';

export interface GameStatesSlice {
  states: GameStatesType;
  setStates: (update: Partial<GameStatesType>) => void;
}
