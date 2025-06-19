import { GameStatesType } from '../../../types/core';

export interface GameStatesSlice {
  states: GameStatesType;
  setStates: (update: Partial<GameStatesType>) => void;
}
